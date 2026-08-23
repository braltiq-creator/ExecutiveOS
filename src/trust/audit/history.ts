import { getExplanation } from "@/trust/explainability/store";
import { listExplanationEvidence } from "@/trust/evidence/store";
import { listProvenanceForExplanation } from "@/trust/provenance/store";
import { listTrustAuditForExplanation } from "@/trust/audit/store";
import { listReviewsForExplanation } from "@/trust/review/store";

/** Governance-ready history pack for a single explanation. */
export function buildExplanationAuditPack(explanationId: string) {
  const explanation = getExplanation(explanationId);
  return {
    explanation,
    recommendationHistory: explanation
      ? [
          {
            recommendationId: explanation.recommendationId,
            title: explanation.recommendation,
            at: explanation.createdAt,
            expectedOutcome: explanation.expectedOutcome,
          },
        ]
      : [],
    evidenceHistory: listExplanationEvidence(explanationId),
    reasoningHistory: explanation?.reasoningPath ?? [],
    confidenceEvolution: listTrustAuditForExplanation(explanationId)
      .filter((entry) => entry.kind === "confidence" || entry.confidenceScore != null)
      .map((entry) => ({
        at: entry.at,
        score: entry.confidenceScore,
        summary: entry.summary,
      })),
    decisionEvolution: listProvenanceForExplanation(explanationId),
    reviews: listReviewsForExplanation(explanationId),
    auditTrail: listTrustAuditForExplanation(explanationId),
  };
}
