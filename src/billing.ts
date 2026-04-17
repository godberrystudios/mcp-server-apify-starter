import { Actor } from 'apify';

export type EventName = 'summarize-text';

/**
 * Charges the user for a pay-per-event action via Apify.
 * Event names must match those declared in .actor/pay_per_event.json.
 *
 * Billing failures are logged but do not block the user's request — you
 * decide the tradeoff. For hard-enforced billing, throw instead of swallow.
 */
export async function chargeEvent(eventName: EventName, count = 1): Promise<void> {
  try {
    await Actor.charge({ eventName, count });
  } catch (error) {
    console.error(`Billing charge failed for ${eventName}:`, error);
  }
}
