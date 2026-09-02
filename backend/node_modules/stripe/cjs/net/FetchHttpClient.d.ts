import { RequestHeaders, ResponseHeaders } from '../Types.js';
import { HttpClient, HttpClientResponse, FetchHttpClientInterface, FetchHttpClientResponseInterface } from './HttpClient.js';
/**
 * Keeps the request timeout applicable to work that happens after the response
 * headers arrive, so that `timeout` bounds the whole request rather than just
 * the time to headers.
 */
type RequestTimeout = {
    /** Applies the remaining timeout to reading the response body. */
    guard: <T>(promise: Promise<T>) => Promise<T>;
    /** Disarms the timeout; call once the body is read or handed off. */
    release: () => void;
};
/**
 * HTTP client which uses a `fetch` function to issue requests.
 *
 * By default relies on the global `fetch` function, but an optional function
 * can be passed in. If passing in a function, it is expected to match the Web
 * Fetch API. As an example, this could be the function provided by the
 * node-fetch package (https://github.com/node-fetch/node-fetch).
 */
export declare class FetchHttpClient extends HttpClient implements FetchHttpClientInterface {
    private readonly _fetchFn;
    constructor(fetchFn?: typeof fetch);
    private static makeFetchWithRaceTimeout;
    private static makeFetchWithAbortTimeout;
    /** @override. */
    getClientName(): string;
    makeRequest(host: string, port: string, path: string, method: string, headers: RequestHeaders, requestData: string, protocol: string, timeout: number): Promise<FetchHttpClientResponseInterface>;
}
export declare class FetchHttpClientResponse extends HttpClientResponse implements FetchHttpClientResponseInterface {
    _res: Response;
    _requestTimeout: RequestTimeout;
    constructor(res: Response, requestTimeout?: RequestTimeout);
    getRawResponse(): Response;
    toStream(streamCompleteCallback: () => void): ReadableStream<Uint8Array> | null;
    toJSON(): Promise<any>;
    static _transformHeadersToObject(headers: Headers): ResponseHeaders;
}
export {};
