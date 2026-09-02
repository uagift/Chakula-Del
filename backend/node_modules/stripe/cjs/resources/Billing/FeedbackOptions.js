"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackOptionResource = void 0;
const StripeResource_js_1 = require("../../StripeResource.js");
class FeedbackOptionResource extends StripeResource_js_1.StripeResource {
    /**
     * An API method for listing the feedback options model
     */
    list(params, options) {
        return this._makeRequest('GET', '/v1/billing/feedback_options', params, options, {
            methodType: 'list',
        });
    }
    /**
     * Creates a new feedback option.
     */
    create(params, options) {
        return this._makeRequest('POST', '/v1/billing/feedback_options', params, options);
    }
    /**
     * Retrieves a feedback options object given an ID.
     */
    retrieve(id, params, options) {
        return this._makeRequest('GET', `/v1/billing/feedback_options/${encodeURIComponent(id)}`, params, options);
    }
    /**
     * Updates the description of an existing feedback option.
     */
    update(id, params, options) {
        return this._makeRequest('POST', `/v1/billing/feedback_options/${encodeURIComponent(id)}`, params, options);
    }
    /**
     * Deactivates a feedback option. Deactivated feedback options cannot be used in portal configurations.
     */
    deactivate(id, params, options) {
        return this._makeRequest('POST', `/v1/billing/feedback_options/${encodeURIComponent(id)}/deactivate`, params, options);
    }
}
exports.FeedbackOptionResource = FeedbackOptionResource;
//# sourceMappingURL=FeedbackOptions.js.map