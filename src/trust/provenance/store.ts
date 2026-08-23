import type { ProvenanceRecord } from "@/trust/framework/types";

const provenance = new Map<string, ProvenanceRecord>();

export function resetProvenance(): void {
  provenance.clear();
}

export function recordProvenance(
  input: Omit<ProvenanceRecord, "id"> & { id?: string },
): ProvenanceRecord {
  const id =
    input.id ??
    `prov-${provenance.size + 1}-${Date.now().toString(36)}`;
  const record: ProvenanceRecord = { ...input, id };
  provenance.set(id, record);
  return record;
}

export function listProvenance(tenantId: string): ProvenanceRecord[] {
  return [...provenance.values()]
    .filter((item) => item.tenantId === tenantId)
    .sort((a, b) => b.at.localeCompare(a.at));
}

export function listProvenanceForExplanation(
  explanationId: string,
): ProvenanceRecord[] {
  return [...provenance.values()]
    .filter((item) => item.explanationId === explanationId)
    .sort((a, b) => a.at.localeCompare(b.at));
}
