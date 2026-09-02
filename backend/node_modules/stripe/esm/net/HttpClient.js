/**
 * Encapsulates the logic for issuing a request to the Stripe API.
 *
 * A custom HTTP client should should implement:
 * 1. A response class which extends HttpClientResponse and wraps around their
 *    own internal representation of a response.
 * 2. A client class which extends HttpClient and implements all methods,
 *    returning their own response class when making requests.
 */
export class HttpClient {
    /** The client name used for diagnostics. */
    getClientName() {
        throw new Error('getClientName not implemented.');
    }
    makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
        throw new Error('makeRequest not implemented.');
    }
    /** Helper to make a consistent timeout error across implementations. */
    static makeTimeoutError() {
        const timeoutErr = new TypeError(HttpClient.TIMEOUT_ERROR_CODE);
        timeoutErr.code = HttpClient.TIMEOUT_ERROR_CODE;
        return timeoutErr;
    }
    /**
     * Helper to wrap a failure that occurred while reading a response body, so
     * that implementations can report one consistently.
     */
    static makeResponseBodyError(exception) {
        const error = new HttpClientResponseBodyError('Failed to read the response body');
        error.exception = exception;
        if (exception && typeof exception.code === 'string') {
            error.code = exception.code;
        }
        return error;
    }
}
// Public API accessible via Stripe.HttpClient
HttpClient.CONNECTION_CLOSED_ERROR_CODES = ['ECONNRESET', 'EPIPE'];
HttpClient.TIMEOUT_ERROR_CODE = 'ETIMEDOUT';
export class HttpClientResponse {
    constructor(statusCode, headers) {
        this._statusCode = statusCode;
        this._headers = headers;
    }
    getStatusCode() {
        return this._statusCode;
    }
    getHeaders() {
        return this._headers;
    }
    getRawResponse() {
        throw new Error('getRawResponse not implemented.');
    }
    toStream(streamCompleteCallback) {
        throw new Error('toStream not implemented.');
    }
    toJSON() {
        throw new Error('toJSON not implemented.');
    }
    _parseResponseBody(body) {
        try {
            return JSON.parse(body);
        }
        catch (e) {
            if (e instanceof Error) {
                e.rawBody = body;
            }
            throw e;
        }
    }
}
export class HttpClientRuntimeError extends Error {
}
/**
 * Raised when the response body could not be read to completion, e.g. because
 * the connection stalled or was severed after the headers arrived. This is
 * distinct from a body that was received in full but is not valid JSON, so that
 * a transport failure can be surfaced as a connection error rather than as a
 * parsing error.
 */
export class HttpClientResponseBodyError extends Error {
}
//# sourceMappingURL=HttpClient.js.map