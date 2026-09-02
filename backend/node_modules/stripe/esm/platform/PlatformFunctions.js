import { FetchHttpClient } from '../net/FetchHttpClient.js';
import { SubtleCryptoProvider } from '../crypto/SubtleCryptoProvider.js';
/**
 * Interface encapsulating various utility functions whose
 * implementations depend on the platform / JS runtime.
 */
export class PlatformFunctions {
    constructor() {
        this._fetchFn = null;
        this._agent = null;
    }
    /**
     * Returns platform info string for telemetry, or null if unavailable.
     */
    getPlatformInfo() {
        return null;
    }
    getTelemetryId() {
        return null;
    }
    /**
     * Writes a message to stderr, or does nothing if unavailable.
     */
    writeStderr(_msg) { }
    /**
     * Emits a warning. Node.js uses process.emitWarning; other runtimes
     * fall back to console.warn.
     */
    emitWarning(warning) {
        /* eslint-disable no-console */
        console.warn(`Stripe: ${warning}`);
        /* eslint-enable no-console */
    }
    /**
     * Returns environment variables, or null if unavailable.
     */
    getEnv() {
        return null;
    }
    /**
     * Returns the runtime version string, or null if unavailable.
     */
    getRuntimeVersion() {
        return null;
    }
    /**
     * Returns the default number of network retries for this platform.
     */
    getDefaultMaxNetworkRetries() {
        return 2;
    }
    /**
     * Returns the default request authenticator for this platform.
     */
    createDefaultAuthenticator() {
        return null;
    }
    /**
     * Generates a v4 UUID. Must be cryptographically secure: this seeds both `Idempotency-Key` values and the multipart/form-data boundary.
     *
     * Deliberately throws rather than degrading to `Math.random()`.
     */
    uuid4() {
        if (typeof crypto === 'undefined' || !crypto.randomUUID) {
            throw new Error('Stripe: no cryptographically secure random number generator is available in this runtime; `crypto.randomUUID` is required.');
        }
        return crypto.randomUUID();
    }
    /**
     * Compares strings in constant time.
     */
    secureCompare(a, b) {
        // return early here if buffer lengths are not equal
        if (a.length !== b.length) {
            return false;
        }
        const len = a.length;
        let result = 0;
        for (let i = 0; i < len; ++i) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    }
    /**
     * Creates an event emitter.
     */
    createEmitter() {
        throw new Error('createEmitter not implemented.');
    }
    /**
     * Checks if the request data is a stream. If so, read the entire stream
     * to a buffer and return the buffer.
     */
    tryBufferData(data) {
        throw new Error('tryBufferData not implemented.');
    }
    /**
     * Creates an HTTP client which uses the Node `http` and `https` packages
     * to issue requests.
     */
    createNodeHttpClient(agent) {
        throw new Error('createNodeHttpClient not implemented.');
    }
    /**
     * Creates an HTTP client for issuing Stripe API requests which uses the Web
     * Fetch API.
     *
     * A fetch function can optionally be passed in as a parameter. If none is
     * passed, will default to the default `fetch` function in the global scope.
     */
    createFetchHttpClient(fetchFn) {
        return new FetchHttpClient(fetchFn);
    }
    /**
     * Creates an HTTP client using runtime-specific APIs.
     */
    createDefaultHttpClient() {
        throw new Error('createDefaultHttpClient not implemented.');
    }
    /**
     * Creates a CryptoProvider which uses the Node `crypto` package for its computations.
     */
    createNodeCryptoProvider() {
        throw new Error('createNodeCryptoProvider not implemented.');
    }
    /**
     * Creates a CryptoProvider which uses the SubtleCrypto interface of the Web Crypto API.
     */
    createSubtleCryptoProvider(subtleCrypto) {
        return new SubtleCryptoProvider(subtleCrypto);
    }
    createDefaultCryptoProvider() {
        throw new Error('createDefaultCryptoProvider not implemented.');
    }
}
//# sourceMappingURL=PlatformFunctions.js.map