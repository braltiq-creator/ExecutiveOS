/**
 * Attach strategic outcome alignment to Today recommendations.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import { listStrategicOutcomes } from "@/strategy/outcomes";
import { alignRecommendationToOutcomes } from "@/strategy/alignment";

export function attachStrategicOutcomesToTodayActions(
  snapshot: ExecutiveSnapshot,
  tenantId: string,
  _profileId?: IntelligenceProfileId,
): ExecutiveSnapshot {
  if (listStrategicOutcomes(tenantId).length === 0) {
    return snapshot;
  }

  const recommendedActions = snapshot.recommendedActions.map((action) => {
    const links = alignRecommendationToOutcomes({
      tenantId,
      recommendationId: action.id,
      title: action.title,
      detail: `${action.why} ${action.businessQuestion ?? ""} ${action.expectedOutcome}`,
    });
    const primary = links[0];
    if (!primary) return action;
    return {
      ...action,
      supportsOutcome: primary.outcomeName,
      supportsOutcomeId: primary.outcomeId,
      expectedImpact: primary.expectedImpact,
      strategyConfidence: primary.confidence,
      strategyEvidence: primary.evidence,
      potentialRisk: primary.potentialRisk,
      estimatedContribution: primary.estimatedContribution,
    };
  });

  return { ...snapshot, recommendedActions };
}
