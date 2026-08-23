/**
 * Normalisation helpers — ensure vendor data becomes BusinessEvents only.
 */

import type { BusinessEvent } from "@/connectors/types";
import { assertBusinessEvent } from "@/platform/contracts";

export type NormalisationResult = {
  events: BusinessEvent[];
  rejected: number;
  errors: string[];
};

export function normaliseEventBatch(
  events: BusinessEvent[],
): NormalisationResult {
  const accepted: BusinessEvent[] = [];
  const errors: string[] = [];
  for (const event of events) {
    try {
      assertBusinessEvent(event);
      accepted.push(event);
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "Invalid business event",
      );
    }
  }
  return {
    events: accepted,
    rejected: events.length - accepted.length,
    errors,
  };
}

/** Strip vendor-specific keys that must never leave the connector boundary. */
export function stripVendorLeakage(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const blocked = [
    "raw",
    "vendorPayload",
    "sapObject",
    "maximoObject",
    "_raw",
    "odata",
  ];
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (blocked.includes(key)) continue;
    clean[key] = value;
  }
  return clean;
}
