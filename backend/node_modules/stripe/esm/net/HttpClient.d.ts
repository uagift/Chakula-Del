/// <reference types="node" />
import { RequestHeaders, ResponseHeaders } from '../Types.js';
type TimeoutError = TypeError & {
    code?: string;
};
export interface HttpClientInterface {
    getClientName: () => string;
    makeRequest: (host: string, port: string, path: string, method: string, headers: RequestHeaders, requestData: string, protocol: string, timeout: number) => Promise<HttpClientResponseInterface>;
}
export interface HttpClientResponseInterface {
    getStatusCode: () => number;
    getHeaders: () => ResponseHeaders;
    getRawResponse: () => unknown;
    toStream: (streamCompleteCallback: () => void) => unknown;
    toJSON: () => Promise<any>;
}
/**
 * Interface for Node HTTP client with Node-specific stream types.
 */
export interface NodeHttpClientInterface extends HttpClientInterface {
    makeRequest: (host: string, port: string, path: string, method: string, headers: RequestHeaders, requestData: string, protocol: string, timeout: number) => Promise<NodeHttpClientResponseInterface>;
}
export interface NodeHttpClientResponseInterface extends HttpClientResponseInterface {
    toStream: (streamCompleteCallback: () => void) => NodeJS.ReadableStream;
}
/**
 * Interface for Fetch HTTP client with Web Streams API types.
 */
export interface FetchHttpClientInterface extends HttpClientInterface {
    makeRequest: (host: string, port: string, path: string, method: string, headers: RequestHeaders, requestData: string, protocol: string, timeout: number) => Promise<FetchHttpClientResponseInterface>;
}
export interface FetchHttpClientResponseInterface extends HttpClientResponseInterface {
    toStream: (streamCompleteCallback: () => void) => ReadableStream<Uint8Array> | null;
}
/**
 * Encapsulates the logic for issuing a request to the Stripe API.
 *
 * A custom HTTP client should should implement:
 * 1. A response class which extends HttpClientResponse and wraps around their
 *    own internal representation of a response.
 * 2. A client class which extends HttpClient and implements all methods,
 *    returning their own response class when making requests.
 */
export declare class HttpClient implements HttpClientInterface {
    static CONNECTION_CLOSED_ERROR_CODES: string[];
    static TIMEOUT_ERROR_CODE: string;
    /** The client name used for diagnostics. */
    getClientName(): string;
    makeRequest(host: string, port: string, path: string, method: string, headers: RequestHeaders, requestData: string, protocol: string, timeout: number): Promise<HttpClientResponseInterface>;
    /** Helper to make a consistent timeout error across implementations. */
    static makeTimeoutError(): TimeoutError;
    /**
     * Helper to wrap a failure that occurred while reading a response body, so
     * that implementations can report one consistently.
     */
    static makeResponseBodyError(exception: unknown): HttpClientResponseBodyError;
}
export declare class HttpClientResponse implements HttpClientResponseInterface {
    _statusCode: number;
    _headers: ResponseHeaders;
    constructor(statusCode: number, headers: ResponseHeaders);
    getStatusCode(): number;
    getHeaders(): ResponseHeaders;
    getRawResponse(): unknown;
    toStream(streamCompleteCallback: () => void): unknown;
    toJSON(): any;
    protected _parseResponseBody(body: string): any;
}
export declare class HttpClientRuntimeError extends Error {
}
/**
 * Raised when the response body could not be read to completion, e.g. because
 * the connection stalled or was severed after the headers arrived. This is
 * distinct from a body that was received in full but is not valid JSON, so that
 * a transport failure can be surfaced as a connection error rather than as a
 * parsing error.
 */
export declare class HttpClientResponseBodyError extends Error {
    /** The error code of the underlying failure, when the runtime supplies one. */
    code?: string;
    /** The underlying failure, when the runtime supplies one. */
    exception?: unknown;
}
export {};
