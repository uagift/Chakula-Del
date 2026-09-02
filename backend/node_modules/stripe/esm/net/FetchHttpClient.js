import { parseHeadersForFetch } from '../utils.js';
import { HttpClient, HttpClientResponse, } from './HttpClient.js';
const NOOP_REQUEST_TIMEOUT = {
    guard: (promise) => promise,
    release: () => { },
};
/**
 * HTTP client which uses a `fetch` function to issue requests.
 *
 * By default relies on the global `fetch` function, but an optional function
 * can be passed in. If passing in a function, it is expected to match the Web
 * Fetch API. As an example, this could be the function provided by the
 * node-fetch package (https://github.com/node-fetch/node-fetch).
 */
export class FetchHttpClient extends HttpClient {
    constructor(fetchFn) {
        super();
        // Default to global fetch if available
        if (!fetchFn) {
            if (!globalThis.fetch) {
                throw new Error('fetch() function not provided and is not defined in the global scope. ' +
                    'You must provide a fetch implementation.');
            }
            fetchFn = globalThis.fetch;
        }
        // Both timeout behaviors differs from Node:
        // - Fetch uses a single timeout for the entire length of the request.
        // - Node is more fine-grained and resets the timeout after each stage of the request.
        if (globalThis.AbortController) {
            // Utilise native AbortController if available
            // AbortController was added in Node v15.0.0, v14.17.0
            this._fetchFn = FetchHttpClient.makeFetchWithAbortTimeout(fetchFn);
        }
        else {
            // Fall back to racing against a timeout promise if not available in the runtime
            // This does not actually cancel the underlying fetch operation or resources
            this._fetchFn = FetchHttpClient.makeFetchWithRaceTimeout(fetchFn);
        }
    }
    static makeFetchWithRaceTimeout(fetchFn) {
        return async (url, init, timeout) => {
            let pendingTimeoutId;
            const timeoutPromise = new Promise((_, reject) => {
                pendingTimeoutId = setTimeout(() => {
                    pendingTimeoutId = null;
                    reject(HttpClient.makeTimeoutError());
                }, timeout);
            });
            // The timeout keeps racing against the body read below, so make sure its
            // rejection is always observed even if nothing is racing it any more.
            timeoutPromise.catch(() => { });
            const release = () => {
                if (pendingTimeoutId) {
                    clearTimeout(pendingTimeoutId);
                    pendingTimeoutId = null;
                }
            };
            const requestTimeout = {
                // Racing cannot cancel the underlying read, but it does stop the
                // request from hanging past the timeout.
                guard: (promise) => Promise.race([promise, timeoutPromise]),
                release,
            };
            try {
                const res = await Promise.race([fetchFn(url, init), timeoutPromise]);
                return { res, requestTimeout };
            }
            catch (err) {
                release();
                throw err;
            }
        };
    }
    static makeFetchWithAbortTimeout(fetchFn) {
        return async (url, init, timeout) => {
            // Use AbortController because AbortSignal.timeout() was added later in Node v17.3.0, v16.14.0
            const abort = new AbortController();
            let timeoutId = setTimeout(() => {
                timeoutId = null;
                abort.abort(HttpClient.makeTimeoutError());
            }, timeout);
            const release = () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
            };
            // Some implementations, like node-fetch, do not respect the reason passed to AbortController.abort()
            // and instead it always throws an AbortError
            // We catch this case to normalise all timeout errors
            const normalizeAbortError = (err) => {
                if (err?.name === 'AbortError') {
                    throw HttpClient.makeTimeoutError();
                }
                throw err;
            };
            const requestTimeout = {
                // The signal stays armed after the headers arrive, so aborting it also
                // interrupts the body read.
                guard: (promise) => promise.catch(normalizeAbortError),
                release,
            };
            try {
                const res = await fetchFn(url, {
                    ...init,
                    signal: abort.signal,
                });
                return { res, requestTimeout };
            }
            catch (err) {
                // Only release on failure; a successful response still needs the
                // timeout armed while its body is read.
                release();
                return normalizeAbortError(err);
            }
        };
    }
    /** @override. */
    getClientName() {
        return 'fetch';
    }
    async makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
        const isInsecureConnection = protocol === 'http';
        if (!path.startsWith('/')) {
            throw new Error(`Only relative paths are supported, got: "${path}"`);
        }
        const url = new URL(`${isInsecureConnection ? 'http' : 'https'}://${host}${path}`);
        url.port = port;
        // For methods which expect payloads, we should always pass a body value
        // even when it is empty. Without this, some JS runtimes (eg. Deno) will
        // inject a second Content-Length header. See https://github.com/stripe/stripe-node/issues/1519
        // for more details.
        const methodHasPayload = method == 'POST' || method == 'PUT' || method == 'PATCH';
        const body = requestData || (methodHasPayload ? '' : undefined);
        const { res, requestTimeout } = await this._fetchFn(url.toString(), {
            method,
            headers: parseHeadersForFetch(headers),
            body: body,
        }, timeout);
        return new FetchHttpClientResponse(res, requestTimeout);
    }
}
export class FetchHttpClientResponse extends HttpClientResponse {
    constructor(res, requestTimeout) {
        super(res.status, FetchHttpClientResponse._transformHeadersToObject(res.headers));
        this._res = res;
        this._requestTimeout = requestTimeout ?? NOOP_REQUEST_TIMEOUT;
    }
    getRawResponse() {
        return this._res;
    }
    toStream(streamCompleteCallback) {
        // The caller consumes this stream on its own schedule, and a legitimate
        // download may well outlast `timeout`, so hand ownership of the body over
        // rather than aborting it.
        this._requestTimeout.release();
        // Unfortunately `fetch` does not have event handlers for when the stream is
        // completely read. We therefore invoke the streamCompleteCallback right
        // away. This callback emits a response event with metadata and completes
        // metrics, so it's ok to do this without waiting for the stream to be
        // completely read.
        streamCompleteCallback();
        // Fetch's `body` property is expected to be a readable stream of the body.
        return this._res.body;
    }
    async toJSON() {
        let text;
        try {
            // `timeout` is meant to cover the entire request, so it has to stay armed
            // while the body is read. Otherwise a connection that stalls or drops
            // after the headers arrive hangs forever.
            // See https://github.com/stripe/stripe-node/issues/2814.
            text = await this._requestTimeout.guard(this._res.text());
        }
        catch (e) {
            throw HttpClient.makeResponseBodyError(e);
        }
        finally {
            this._requestTimeout.release();
        }
        return this._parseResponseBody(text);
    }
    static _transformHeadersToObject(headers) {
        // Fetch uses a Headers instance so this must be converted to a barebones
        // JS object to meet the HttpClient interface.
        const headersObj = {};
        for (const entry of headers) {
            if (!Array.isArray(entry) || entry.length != 2) {
                throw new Error('Response objects produced by the fetch function given to FetchHttpClient do not have an iterable headers map. Response#headers should be an iterable object.');
            }
            headersObj[entry[0]] = entry[1];
        }
        return headersObj;
    }
}
//# sourceMappingURL=FetchHttpClient.js.map