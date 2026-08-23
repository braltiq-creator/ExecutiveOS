import type { TrustDashboard } from "@/trust/framework/types";
import { listExplanations } from "@/trust/explainability";
import { listExecutiveReviews } from "@/trust/review";
import { listTrustAudit } from "@/trust/audit";
import { getTrustGovernance } from "@/trust/governance";

export function buildTrustDashboard(input: {
  tenantId: string;
  asOf?: string;
}): TrustDashboard {
  const asOf = input.asOf ?? new Date().toISOString();
  const explanations = listExplanations(input.tenantId);
  const reviews = listExecutiveReviews(input.tenantId);
  const audit = listTrustAudit(input.tenantId);

  const averageConfidence =
    explanations.length === 0
      ? 0
      : Math.round(
          explanations.reduce((sum, e) => sum + e.confidence.score, 0) /
            explanations.length,
        );

  const agreeCount = reviews.filter((r) => r.verdict === "agree").length;

  return {
    asOf,
    tenantId: input.tenantId,
    explanationCount: explanations.length,
    averageConfidence,
    highConfidenceCount: explanations.filter(
      (e) => e.confidence.band === "high",
    ).length,
    lowConfidenceCount: explanations.filter(
      (e) => e.confidence.band === "low",
    ).length,
    reviewCount: reviews.length,
    agreeRate:
      reviews.length === 0
        ? 0
        : Math.round((agreeCount / reviews.length) * 100),
    auditEntryCount: audit.length,
    recentExplanations: explanations.slice(0, 8),
    recentReviews: reviews.slice(0, 8),
    recentAudit: audit.slice(0, 12),
    governance: getTrustGovernance(),
  };
}
