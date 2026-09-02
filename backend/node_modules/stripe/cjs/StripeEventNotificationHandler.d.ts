import { Stripe } from './stripe.core.js';
import * as Events from './resources/V2/Core/Events.js';
import { WebhookHeader, WebhookPayload } from './Webhooks.js';
export interface UnhandledNotificationDetails {
    isKnownEventType: boolean;
}
export type FallbackCallback = (event: Events.UnknownEventNotification, client: Stripe, details: UnhandledNotificationDetails) => Promise<void>;
export type PreHandleCallback = (event: Stripe.V2.Core.EventNotification, client: Stripe) => Promise<boolean>;
/**
 * Shared registration and dispatch machinery for the two handlers below.
 *
 * Deliberately does not declare `handle`, and is not exported. TypeScript won't
 * let a subclass add a required parameter to an inherited method, so a verifying
 * handler cannot extend a non-verifying one (or vice versa) without either
 * loosening a signature or suppressing the error. Making them siblings lets each
 * declare its own exact `handle` while sharing everything else.
 */
declare class BaseEventNotificationHandler {
    protected client: Stripe;
    private fallbackCallback;
    private registeredHandlers;
    private preHandleCallback;
    protected hasHandledEvent: boolean;
    constructor(client: Stripe, fallbackCallback: FallbackCallback);
    on<T extends Stripe.V2.Core.EventNotification['type']>(type: T, callback: (event: Extract<Stripe.V2.Core.EventNotification, {
        type: T;
    }>, client: Stripe) => Promise<void>): this;
    /**
     * Callbacks are expected to be registered once on startup, so registering
     * anything after handling has begun indicates a bug.
     */
    private assertCanRegister;
    /**
     * Registers a function that will be run before any event-specific callbacks. A useful place to store event-agnostic logic, such as logging or checking for [duplicate event deliveries](https://docs.stripe.com/webhooks#handle-duplicate-events).
     *
     * Returning `true` causes handling to continue as normal; returning `false` returns from `.handle()` immediately, so neither the registered callback nor the fallback callback are called.
     */
    preHandle(callback: PreHandleCallback): this;
    registeredEventTypes(): string[];
    protected dispatchEvent(event: Stripe.V2.Core.EventNotification): Promise<void>;
}
export declare class StripeEventNotificationHandler extends BaseEventNotificationHandler {
    private webhookSecret;
    constructor(client: Stripe, webhookSecret: string, fallbackCallback: FallbackCallback);
    static withoutVerification(client: Stripe, fallbackCallback: FallbackCallback): StripeEventNotificationHandlerWithoutVerification;
    handle(rawBody: WebhookPayload, signature: WebhookHeader): Promise<void>;
}
/**
 * A variant of StripeEventNotificationHandler that parses events without
 * verifying webhook signatures. Intended for pre-authenticated channels
 * like AWS EventBridge or Azure Event Grid.
 *
 * Prefer StripeEventNotificationHandler.withoutVerification() or
 * client.notificationHandlerWithoutVerification() to construct one.
 */
export declare class StripeEventNotificationHandlerWithoutVerification extends BaseEventNotificationHandler {
    handle(rawBody: WebhookPayload): Promise<void>;
}
export {};
