/**
 * Design Partner operating-loop audit — executive-readable events.
 * Complements UDG gateway audit; does not replace it.
 */

export type DesignPartnerAuditEventKind =
  | "data_uploaded"
  | "mapping_confirmed"
  | "validation_completed"
  | "snapshot_created"
  | "snapshot_activated"
  | "intelligence_generated"
  | "decision_opened"
  | "option_selected"
  | "action_created"
  | "action_status_changed";

export type DesignPartnerAuditEvent = {
  id: string;
  kind: DesignPartnerAuditEventKind;
  at: string;
  organisationId: string;
  actorId: string | null;
  /** Executive-facing label — not raw stack traces. */
  summary: string;
  objectType: "dataset" | "mapping" | "snapshot" | "decision" | "action" | "intelligence";
  objectId: string | null;
  snapshotId: string | null;
  decisionId: string | null;
  actionId: string | null;
};

const events: DesignPartnerAuditEvent[] = [];

export function recordDesignPartnerAudit(
  partial: Omit<DesignPartnerAuditEvent, "id" | "at"> & { at?: string },
): DesignPartnerAuditEvent {
  const entry: DesignPartnerAuditEvent = {
    id: `dpa_${Date.now().toString(36)}_${events.length}`,
    at: partial.at ?? new Date().toISOString(),
    kind: partial.kind,
    organisationId: partial.organisationId,
    actorId: partial.actorId,
    summary: partial.summary,
    objectType: partial.objectType,
    objectId: partial.objectId,
    snapshotId: partial.snapshotId,
    decisionId: partial.decisionId,
    actionId: partial.actionId,
  };
  events.push(entry);
  return entry;
}

export function listDesignPartnerAudit(
  organisationId?: string,
): DesignPartnerAuditEvent[] {
  if (!organisationId) return [...events];
  return events.filter((e) => e.organisationId === organisationId);
}

export function clearDesignPartnerAudit(): void {
  events.length = 0;
}

/** Assert Tenant A cannot read Tenant B audit. */
export function assertOrganisationAuditIsolation(
  organisationId: string,
  otherOrganisationId: string,
): { ok: boolean; leaked: number } {
  const mine = listDesignPartnerAudit(organisationId);
  const leaked = mine.filter((e) => e.organisationId === otherOrganisationId);
  return { ok: leaked.length === 0, leaked: leaked.length };
}
