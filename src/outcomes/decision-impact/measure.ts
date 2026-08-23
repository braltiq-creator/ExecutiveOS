/**
 * Decision influence — did recommendations change executive behaviour?
 */

import { listRecommendationTracks } from "@/outcomes/recommendation-tracking";
import { listExecutiveActions } from "@/outcomes/executive-actions";
import { listExecutiveOutcomes } from "@/outcomes/business-outcomes";
import type { DecisionImpactSnapshot } from "@/outcomes/framework/types";

export function measureDecisionImpact(input: {
  tenantId: string;
  asOf?: string;
}): DecisionImpactSnapshot {
  const asOf = input.asOf ?? new Date().toISOString();
  const recs = listRecommendationTracks(input.tenantId);
  const actions = listExecutiveActions(input.tenantId);
  const outcomes = listExecutiveOutcomes(input.tenantId);

  const influencing = recs.filter((r) =>
    ["accepted", "implemented", "observed", "confirmed"].includes(r.status),
  ).length;
  const confirmed = outcomes.filter((o) => o.status === "confirmed").length;
  const linkedActions = actions.filter((a) => a.recommendationId != null).length;

  const influenceScore = Math.min(
    100,
    Math.round(
      (recs.length === 0 ? 0 : (influencing / recs.length) * 50) +
        Math.min(30, actions.length * 5) +
        Math.min(20, confirmed * 8),
    ),
  );

  return {
    tenantId: input.tenantId,
    asOf,
    recommendationsInfluencingDecisions: influencing,
    actionsTaken: actions.length,
    outcomesConfirmed: confirmed,
    influenceScore,
    explanation: `Decision influence ${influenceScore}/100 — ${influencing} influencing recommendation(s), ${actions.length} action(s), ${confirmed} confirmed outcome(s).`,
    evidence: [
      `${linkedActions} actions linked to recommendations`,
      `${outcomes.filter((o) => o.recommendationId).length} outcomes linked to recommendations`,
    ],
  };
}
