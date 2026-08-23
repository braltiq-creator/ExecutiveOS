/**
 * Confidence model for outcomes evidence quality.
 */

import { listExecutiveOutcomes } from "@/outcomes/business-outcomes";
import { listRecommendationTracks } from "@/outcomes/recommendation-tracking";
import { listExecutiveActions } from "@/outcomes/executive-actions";
import type { OutcomesConfidenceModel } from "@/outcomes/framework/types";

export function assessOutcomesConfidence(input: {
  tenantId: string;
  asOf?: string;
}): OutcomesConfidenceModel {
  const asOf = input.asOf ?? new Date().toISOString();
  const outcomes = listExecutiveOutcomes(input.tenantId);
  const recs = listRecommendationTracks(input.tenantId);
  const actions = listExecutiveActions(input.tenantId);

  if (outcomes.length === 0) {
    return {
      tenantId: input.tenantId,
      asOf,
      overall: 20,
      evidenceStrength: 10,
      confirmationRate: 0,
      recommendationLinkage: recs.length > 0 ? 30 : 10,
      explanation:
        "Low confidence — no outcomes recorded yet. Capture observed outcomes to strengthen evidence.",
    };
  }

  const confirmed = outcomes.filter((o) => o.status === "confirmed").length;
  const withEvidence = outcomes.filter((o) => o.evidence.length > 0).length;
  const linked = outcomes.filter((o) => o.recommendationId != null).length;
  const confirmationRate = Math.round((confirmed / outcomes.length) * 100);
  const evidenceStrength = Math.round((withEvidence / outcomes.length) * 100);
  const recommendationLinkage = Math.round((linked / outcomes.length) * 100);
  const actionBoost = Math.min(15, actions.length * 3);

  const overall = Math.round(
    confirmationRate * 0.35 +
      evidenceStrength * 0.3 +
      recommendationLinkage * 0.25 +
      actionBoost,
  );

  return {
    tenantId: input.tenantId,
    asOf,
    overall: Math.min(100, overall),
    evidenceStrength,
    confirmationRate,
    recommendationLinkage,
    explanation: `Outcomes confidence ${Math.min(100, overall)}/100 — confirmation ${confirmationRate}%, evidence ${evidenceStrength}%, linkage ${recommendationLinkage}%.`,
  };
}
