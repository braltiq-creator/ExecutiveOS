/**
 * Snapshot Studio multi-source preparation — does not replace Excel flow.
 */

import type { OrganizationEvidence } from "@/verified-evidence/types";

export type SnapshotEvidenceBundle = {
  organizationId: string;
  sources: Array<{
    provider: OrganizationEvidence["provider"];
    provenance: OrganizationEvidence["provenance"];
    evidenceIds: string[];
    recordCount: number;
  }>;
};

/**
 * Bundle evidence for a future multi-source snapshot.
 * Excel/user_upload remains the primary Production path today.
 */
export function buildSnapshotEvidenceBundle(input: {
  organizationId: string;
  evidence: OrganizationEvidence[];
}): SnapshotEvidenceBundle {
  const byProvider = new Map<
    OrganizationEvidence["provider"],
    OrganizationEvidence[]
  >();
  for (const row of input.evidence) {
    if (row.provenance === "SYNTHETIC") continue;
    if (row.evidenceStatus !== "active") continue;
    const list = byProvider.get(row.provider) ?? [];
    list.push(row);
    byProvider.set(row.provider, list);
  }

  return {
    organizationId: input.organizationId,
    sources: [...byProvider.entries()].map(([provider, rows]) => ({
      provider,
      provenance: rows[0]!.provenance,
      evidenceIds: rows.map((r) => r.id),
      recordCount: rows.length,
    })),
  };
}
