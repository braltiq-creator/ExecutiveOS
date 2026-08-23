import type { TrustAuditEntry } from "@/trust/framework/types";

const audit = new Map<string, TrustAuditEntry>();

export function resetTrustAudit(): void {
  audit.clear();
}

export function appendTrustAudit(
  input: Omit<TrustAuditEntry, "id"> & { id?: string },
): TrustAuditEntry {
  const id =
    input.id ?? `taudit-${audit.size + 1}-${Date.now().toString(36)}`;
  const entry: TrustAuditEntry = { ...input, id };
  audit.set(id, entry);
  return entry;
}

export function listTrustAudit(tenantId: string): TrustAuditEntry[] {
  return [...audit.values()]
    .filter((item) => item.tenantId === tenantId)
    .sort((a, b) => b.at.localeCompare(a.at));
}

export function listTrustAuditForExplanation(
  explanationId: string,
): TrustAuditEntry[] {
  return [...audit.values()]
    .filter((item) => item.explanationId === explanationId)
    .sort((a, b) => a.at.localeCompare(b.at));
}
