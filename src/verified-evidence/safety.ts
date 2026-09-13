/**
 * Production safety — Phase 36 Truth Boundary extended for Phase 37 evidence.
 */

import { isMockMode } from "@/lib/mock/mode";
import type {
  EvidenceProvenance,
  OrganizationEvidence,
} from "@/verified-evidence/types";

export class SyntheticEvidenceError extends Error {
  constructor(message = "SYNTHETIC evidence is forbidden in Production.") {
    super(message);
    this.name = "SyntheticEvidenceError";
  }
}

export function assertProvenanceAllowed(
  provenance: EvidenceProvenance,
  options?: { allowSyntheticInMock?: boolean },
): void {
  if (provenance !== "SYNTHETIC") return;
  const allowMock = options?.allowSyntheticInMock !== false && isMockMode();
  if (allowMock) return;
  throw new SyntheticEvidenceError();
}

export function assertNoSyntheticEvidence(
  items: Array<Pick<OrganizationEvidence, "provenance">>,
): void {
  for (const item of items) {
    assertProvenanceAllowed(item.provenance, { allowSyntheticInMock: false });
  }
}

/** Connection alone never yields business evidence eligibility. */
export function isEvidenceEligibleForDiscovery(
  evidence: Pick<OrganizationEvidence, "provenance" | "evidenceStatus">,
): boolean {
  if (evidence.evidenceStatus !== "active") return false;
  if (evidence.provenance === "SYNTHETIC") return false;
  return (
    evidence.provenance === "DIRECT" || evidence.provenance === "USER_PROVIDED"
  );
}
