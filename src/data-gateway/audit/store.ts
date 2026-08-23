import type { UdgAuditAction, UdgAuditEntry } from "../contracts";

const entries: UdgAuditEntry[] = [];

export function recordAudit(
  partial: Omit<UdgAuditEntry, "id" | "at"> & { at?: string },
): UdgAuditEntry {
  const entry: UdgAuditEntry = {
    id: `aud_${Date.now().toString(36)}_${entries.length}`,
    at: partial.at ?? new Date().toISOString(),
    action: partial.action,
    organisationId: partial.organisationId,
    actorId: partial.actorId,
    snapshotId: partial.snapshotId,
    connectorId: partial.connectorId,
    mappingId: partial.mappingId,
    detail: partial.detail,
    metadata: partial.metadata,
  };
  entries.push(entry);
  return entry;
}

export function listAudit(organisationId?: string): UdgAuditEntry[] {
  if (!organisationId) return [...entries];
  return entries.filter((e) => e.organisationId === organisationId);
}

export function clearAuditStore(): void {
  entries.length = 0;
}

export type { UdgAuditAction };
