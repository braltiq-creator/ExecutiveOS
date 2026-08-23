/**
 * Canonical Business Event contract — universal enterprise language.
 * Connectors emit only BusinessEvents above the vendor boundary.
 */

import type { BusinessEvent } from "@/connectors/types";

/** Named enterprise event verbs — extensions may emit these as eventType. */
export const PLATFORM_BUSINESS_EVENT_TYPES = [
  "AssetFailed",
  "ProjectDelayed",
  "InvoicePaid",
  "CustomerEscalated",
  "RiskAccepted",
  "ShutdownStarted",
  "ContractAwarded",
  "TechnicianUnavailable",
  // Existing Core types remain valid
  "entity_upserted",
  "status_changed",
  "risk_raised",
  "risk_mitigated",
  "opportunity_moved",
  "signal_emitted",
  "decision_required",
  "action_created",
  "relationship_asserted",
] as const;

export type PlatformBusinessEventType =
  (typeof PLATFORM_BUSINESS_EVENT_TYPES)[number] | string;

/** Re-export Core BusinessEvent as the platform universal language. */
export type PlatformBusinessEvent = BusinessEvent;

export type BusinessEventMapper = {
  readonly id: string;
  readonly sourceSystem: string;
  /** Map a vendor-neutral intermediate or domain event into BusinessEvents */
  map(input: unknown): PlatformBusinessEvent[];
  /** Optional reverse for replay diagnostics */
  describe?(event: PlatformBusinessEvent): string;
};

export function assertBusinessEvent(event: PlatformBusinessEvent): void {
  if (!event.id) throw new Error("BusinessEvent.id required");
  if (!event.timestamp) throw new Error("BusinessEvent.timestamp required");
  if (!event.sourceSystem) throw new Error("BusinessEvent.sourceSystem required");
  if (!event.entityType) throw new Error("BusinessEvent.entityType required");
  if (!event.entityId) throw new Error("BusinessEvent.entityId required");
  if (!event.eventType) throw new Error("BusinessEvent.eventType required");
  if (typeof event.importance !== "number") {
    throw new Error("BusinessEvent.importance required");
  }
  if (typeof event.confidence !== "number") {
    throw new Error("BusinessEvent.confidence required");
  }
  if (!event.metadata?.connectorId) {
    throw new Error("BusinessEvent.metadata.connectorId required");
  }
}
