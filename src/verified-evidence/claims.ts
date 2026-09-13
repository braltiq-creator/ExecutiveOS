/**
 * Claims require evidence references; classifications are preserved.
 */

import type {
  ClaimClassification,
  OrganizationClaim,
  OrganizationEvidence,
} from "@/verified-evidence/types";
import { isEvidenceEligibleForDiscovery } from "@/verified-evidence/safety";

export class ClaimEvidenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaimEvidenceError";
  }
}

export function assertClaimHasEvidenceRefs(
  evidenceIds: string[],
): asserts evidenceIds is [string, ...string[]] {
  if (!evidenceIds.length) {
    throw new ClaimEvidenceError("Claims require at least one evidence reference.");
  }
}

export function classifyClaimFromEvidence(
  evidence: OrganizationEvidence[],
): ClaimClassification {
  if (evidence.length === 0) {
    throw new ClaimEvidenceError("Cannot classify a claim without evidence.");
  }
  if (evidence.some((e) => e.provenance === "SYNTHETIC")) {
    throw new ClaimEvidenceError("SYNTHETIC evidence cannot support a claim.");
  }
  if (evidence.every((e) => e.provenance === "DIRECT" || e.provenance === "USER_PROVIDED")) {
    return evidence.some((e) => e.provenance === "USER_PROVIDED") &&
      evidence.every((e) => e.provenance === "USER_PROVIDED")
      ? "DIRECT"
      : "DIRECT";
  }
  if (evidence.some((e) => e.provenance === "INFERRED")) {
    return "INFERRED";
  }
  return "DERIVED";
}

export function buildClaim(input: {
  id: string;
  organizationId: string;
  claimKind: string;
  statement: string;
  evidence: OrganizationEvidence[];
  classification?: ClaimClassification;
  confidence?: number | null;
  createdBy?: string | null;
  asOf?: string;
}): OrganizationClaim {
  const evidenceIds = input.evidence.map((e) => e.id);
  assertClaimHasEvidenceRefs(evidenceIds);

  for (const item of input.evidence) {
    if (!isEvidenceEligibleForDiscovery(item) && item.provenance !== "DERIVED" && item.provenance !== "INFERRED") {
      // Active DIRECT/USER_PROVIDED preferred; DERIVED/INFERRED allowed only as classified claims.
      if (item.evidenceStatus !== "active") {
        throw new ClaimEvidenceError("Claims may only reference active evidence.");
      }
    }
  }

  const classification =
    input.classification ?? classifyClaimFromEvidence(input.evidence);

  // Never silently promote DERIVED/INFERRED to DIRECT.
  if (
    input.classification === "DIRECT" &&
    input.evidence.some(
      (e) => e.provenance === "DERIVED" || e.provenance === "INFERRED",
    )
  ) {
    throw new ClaimEvidenceError(
      "Cannot classify a claim as DIRECT when supporting evidence is DERIVED or INFERRED.",
    );
  }

  return {
    id: input.id,
    organizationId: input.organizationId,
    claimKind: input.claimKind,
    statement: input.statement,
    classification,
    evidenceIds,
    confidence: input.confidence ?? null,
    claimStatus: "proposed",
    createdBy: input.createdBy ?? null,
    createdAt: input.asOf ?? new Date().toISOString(),
  };
}
