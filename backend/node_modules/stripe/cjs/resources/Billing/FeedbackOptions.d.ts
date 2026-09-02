import { StripeResource } from '../../StripeResource.js';
import { PaginationParams } from '../../shared.js';
import { RequestOptions, ApiListPromise, Response } from '../../lib.js';
export declare class FeedbackOptionResource extends StripeResource {
    /**
     * An API method for listing the feedback options model
     */
    list(params?: Billing.FeedbackOptionListParams, options?: RequestOptions): ApiListPromise<FeedbackOption>;
    /**
     * Creates a new feedback option.
     */
    create(params: Billing.FeedbackOptionCreateParams, options?: RequestOptions): Promise<Response<FeedbackOption>>;
    /**
     * Retrieves a feedback options object given an ID.
     */
    retrieve(id: string, params?: Billing.FeedbackOptionRetrieveParams, options?: RequestOptions): Promise<Response<FeedbackOption>>;
    /**
     * Updates the description of an existing feedback option.
     */
    update(id: string, params?: Billing.FeedbackOptionUpdateParams, options?: RequestOptions): Promise<Response<FeedbackOption>>;
    /**
     * Deactivates a feedback option. Deactivated feedback options cannot be used in portal configurations.
     */
    deactivate(id: string, params?: Billing.FeedbackOptionDeactivateParams, options?: RequestOptions): Promise<Response<FeedbackOption>>;
}
export interface FeedbackOption {
    /**
     * Unique identifier for the object.
     */
    id: string;
    /**
     * String representing the object's type. Objects of the same type share the same value.
     */
    object: 'billing.feedback_option';
    /**
     * An arbitrary string attached to the object. Often useful for displaying to users.
     */
    description: string;
    /**
     * If the object exists in live mode, the value is `true`. If the object exists in test mode, the value is `false`.
     */
    livemode: boolean;
    /**
     * The feedback option's status.
     */
    status: FeedbackOption.Status;
    status_transitions: FeedbackOption.StatusTransitions;
}
export declare namespace FeedbackOption {
    type Status = 'active' | 'inactive';
    interface StatusTransitions {
        /**
         * The time the feedback option was deactivated, if any. Measured in seconds since Unix epoch.
         */
        deactivated_at: number | null;
    }
}
export declare namespace Billing {
    interface FeedbackOptionCreateParams {
        description: string;
        /**
         * Specifies which fields in the response should be expanded.
         */
        expand?: Array<string>;
    }
}
export declare namespace Billing {
    interface FeedbackOptionRetrieveParams {
        /**
         * Specifies which fields in the response should be expanded.
         */
        expand?: Array<string>;
    }
}
export declare namespace Billing {
    interface FeedbackOptionUpdateParams {
        description?: string;
        /**
         * Specifies which fields in the response should be expanded.
         */
        expand?: Array<string>;
    }
}
export declare namespace Billing {
    interface FeedbackOptionListParams extends PaginationParams {
        /**
         * Specifies which fields in the response should be expanded.
         */
        expand?: Array<string>;
        /**
         * Filter results to only include feedback options with the given status.
         */
        status?: FeedbackOptionListParams.Status;
    }
    namespace FeedbackOptionListParams {
        type Status = 'active' | 'inactive';
    }
}
export declare namespace Billing {
    interface FeedbackOptionDeactivateParams {
        /**
         * Specifies which fields in the response should be expanded.
         */
        expand?: Array<string>;
    }
}
