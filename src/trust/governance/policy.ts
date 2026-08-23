import type { TrustGovernancePolicy } from "@/trust/framework/types";

export const DEFAULT_TRUST_GOVERNANCE: TrustGovernancePolicy = {
  requireEvidence: true,
  minEvidenceSources: 1,
  minConfidenceForHighBand: 70,
  allowRecommendationWithoutMemory: true,
  auditRetentionDays: 365,
};

export function getTrustGovernance(): TrustGovernancePolicy {
  return { ...DEFAULT_TRUST_GOVERNANCE };
}

export function assertTrustPayload(input: {
  evidenceCount: number;
  policy?: TrustGovernancePolicy;
}): { ok: boolean; reasons: string[] } {
  const policy = input.policy ?? getTrustGovernance();
  const reasons: string[] = [];
  if (policy.requireEvidence && input.evidenceCount < policy.minEvidenceSources) {
    reasons.push(
      `At least ${policy.minEvidenceSources} evidence source(s) required.`,
    );
  }
  return { ok: reasons.length === 0, reasons };
}
