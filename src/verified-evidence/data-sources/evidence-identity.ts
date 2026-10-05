import type { OrganizationEvidence } from "@/verified-evidence/types";

/**
 * Active-evidence identity used by organization_evidence_source_uniq
 * (organization, provider, source system, object type, source identifier).
 */
export function weeklyUploadSourceIdentifier(
  dataSourceId: string,
  snapshotId: string,
): string {
  return `weekly-upload:${dataSourceId}:${snapshotId}`;
}

export function assertReusableWeeklyEvidence(
  evidence: OrganizationEvidence,
  expected: {
    organizationId: string;
    dataSourceId: string;
    snapshotId: string;
  },
): void {
  if (evidence.organizationId !== expected.organizationId) {
    throw new Error("Existing evidence belongs to another organisation.");
  }
  if (evidence.provenance !== "USER_PROVIDED" || evidence.evidenceStatus !== "active") {
    throw new Error("Existing evidence cannot be reused for this weekly upload.");
  }
  if ((evidence.dataSourceId ?? null) !== expected.dataSourceId) {
    throw new Error("Existing evidence belongs to a different data source.");
  }
  if (
    evidence.sourceIdentifier !==
    weeklyUploadSourceIdentifier(expected.dataSourceId, expected.snapshotId)
  ) {
    throw new Error("Existing evidence does not match this weekly upload.");
  }
  if (evidence.contentPayload.snapshotId !== expected.snapshotId) {
    throw new Error("Existing evidence is bound to a different snapshot.");
  }
}
