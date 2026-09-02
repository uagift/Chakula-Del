// most languages can check if we have an UnknownEventNotification at runtime
// but JS only has interfaces so we fall back to a string match to determine known events
const KNOWN_EVENT_TYPES = new Set([
    // event-types: The beginning of the section generated from our OpenAPI spec
    'v1.billing.meter.error_report_triggered',
    'v1.billing.meter.no_meter_found',
    'v2.commerce.product_catalog.imports.failed',
    'v2.commerce.product_catalog.imports.processing',
    'v2.commerce.product_catalog.imports.succeeded',
    'v2.commerce.product_catalog.imports.succeeded_with_errors',
    'v2.core.account.closed',
    'v2.core.account.created',
    'v2.core.account.updated',
    'v2.core.account[configuration.customer].capability_status_updated',
    'v2.core.account[configuration.customer].updated',
    'v2.core.account[configuration.merchant].capability_status_updated',
    'v2.core.account[configuration.merchant].updated',
    'v2.core.account[configuration.recipient].capability_status_updated',
    'v2.core.account[configuration.recipient].updated',
    'v2.core.account[defaults].updated',
    'v2.core.account[future_requirements].updated',
    'v2.core.account[identity].updated',
    'v2.core.account[requirements].updated',
    'v2.core.account_link.returned',
    'v2.core.account_person.created',
    'v2.core.account_person.deleted',
    'v2.core.account_person.updated',
    'v2.core.event_destination.ping',
    // event-types: The end of the section generated from our OpenAPI spec
]);
/**
 * Shared registration and dispatch machinery for the two handlers below.
 *
 * Deliberately does not declare `handle`, and is not exported. TypeScript won't
 * let a subclass add a required parameter to an inherited method, so a verifying
 * handler cannot extend a non-verifying one (or vice versa) without either
 * loosening a signature or suppressing the error. Making them siblings lets each
 * declare its own exact `handle` while sharing everything else.
 */
class BaseEventNotificationHandler {
    // the body is empty but the parameter properties are not, so the lint is ignorable
    // eslint-disable-next-line no-useless-constructor
    constructor(client, fallbackCallback) {
        this.client = client;
        this.fallbackCallback = fallbackCallback;
        this.registeredHandlers = {};
        this.preHandleCallback = null;
        this.hasHandledEvent = false;
    }
    on(type, callback) {
        this.assertCanRegister();
        // the matched types are validated by the type system
        if (this.registeredHandlers[type]) {
            throw new Error(`Callback for event type "${type}" is already registered.`);
        }
        this.registeredHandlers[type] = callback;
        return this;
    }
    /**
     * Callbacks are expected to be registered once on startup, so registering
     * anything after handling has begun indicates a bug.
     */
    assertCanRegister() {
        if (this.hasHandledEvent) {
            throw new Error('Cannot register new callbacks after an event has been handled. This is indicative of a bug.');
        }
    }
    /**
     * Registers a function that will be run before any event-specific callbacks. A useful place to store event-agnostic logic, such as logging or checking for [duplicate event deliveries](https://docs.stripe.com/webhooks#handle-duplicate-events).
     *
     * Returning `true` causes handling to continue as normal; returning `false` returns from `.handle()` immediately, so neither the registered callback nor the fallback callback are called.
     */
    preHandle(callback) {
        this.assertCanRegister();
        if (this.preHandleCallback) {
            throw new Error('A preHandle callback is already registered');
        }
        this.preHandleCallback = callback;
        return this;
    }
    registeredEventTypes() {
        const keys = Object.keys(this.registeredHandlers);
        keys.sort();
        return keys;
    }
    async dispatchEvent(event) {
        // Create a new client with the event's context instead of modifying the shared client
        // This ensures thread-safety when processing webhooks in parallel
        // We create a shallow copy and override _api with a new object containing the event context
        // This reuses expensive resources like httpClient (Flyweight pattern)
        const eventClient = Object.create(Object.getPrototypeOf(this.client));
        Object.assign(eventClient, this.client);
        eventClient._api = {
            ...this.client._api,
            stripeContext: event.context,
        };
        if (this.preHandleCallback &&
            !(await this.preHandleCallback(event, eventClient))) {
            return;
        }
        const handler = this.registeredHandlers[event.type];
        if (handler) {
            return await handler(event, eventClient);
        }
        else {
            return await this.fallbackCallback(event, eventClient, {
                isKnownEventType: KNOWN_EVENT_TYPES.has(event.type),
            });
        }
    }
}
export class StripeEventNotificationHandler extends BaseEventNotificationHandler {
    constructor(client, webhookSecret, fallbackCallback) {
        super(client, fallbackCallback);
        this.webhookSecret = webhookSecret;
        if (!webhookSecret) {
            throw new Error('webhookSecret must be a non-empty string');
        }
    }
    static withoutVerification(client, fallbackCallback) {
        return new StripeEventNotificationHandlerWithoutVerification(client, fallbackCallback);
    }
    async handle(rawBody, signature) {
        // set before parsing, so that even a failed parse locks out registration.
        // we're not worried about thread safety here because we expect callbacks will be registered synchronously on app startup
        this.hasHandledEvent = true;
        return await this.dispatchEvent(this.client.parseEventNotification(rawBody, signature, this.webhookSecret));
    }
}
/**
 * A variant of StripeEventNotificationHandler that parses events without
 * verifying webhook signatures. Intended for pre-authenticated channels
 * like AWS EventBridge or Azure Event Grid.
 *
 * Prefer StripeEventNotificationHandler.withoutVerification() or
 * client.notificationHandlerWithoutVerification() to construct one.
 */
export class StripeEventNotificationHandlerWithoutVerification extends BaseEventNotificationHandler {
    async handle(rawBody) {
        this.hasHandledEvent = true;
        return await this.dispatchEvent(this.client.parseEventNotificationWithoutVerification(rawBody));
    }
}
//# sourceMappingURL=StripeEventNotificationHandler.js.map