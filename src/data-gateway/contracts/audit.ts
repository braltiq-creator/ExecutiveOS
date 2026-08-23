/**
 * Audit trail for gateway operations.
 */

export type UdgAuditAction =
  | "upload_received"
  | "parsed"
  | "validated"
  | "mapped"
  | "confidence_scored"
  | "snapshot_created"
  | "snapshot_replayed"
  | "mapping_saved"
  | "ingestion_failed"
  | "connector_invoked"
  | "snapshot_activated"
  | "intelligence_generated"
  | "decision_opened"
  | "option_selected"
  | "action_created"
  | "action_status_changed";

export type UdgAuditEntry = {
  id: string;
  action: UdgAuditAction;
  at: string;
  organisationId: string;
  actorId?: string;
  snapshotId?: string;
  connectorId?: string;
  mappingId?: string;
  detail?: string;
  metadata?: Record<string, string | number | boolean | null>;
};
