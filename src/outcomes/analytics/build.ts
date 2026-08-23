/**
 * Per-tenant outcomes analytics (never cross-tenant business comparisons).
 */

import type { IntelligenceProfileId } from "@/profiles";
import { countRecommendationsByStatus } from "@/outcomes/recommendation-tracking";
import {
  countOutcomesByStatus,
  listExecutiveOutcomes,
} from "@/outcomes/business-outcomes";
import { measureDecisionImpact } from "@/outcomes/decision-impact";
import { measureValueRealisation } from "@/outcomes/value-realisation";
import type { OutcomesAnalytics } from "@/outcomes/framework/types";

const history = new Map<string, number[]>();

export function resetOutcomesAnalyticsState(): void {
  history.clear();
}

export function buildOutcomesAnalytics(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): OutcomesAnalytics {
  const asOf = input.asOf ?? new Date().toISOString();
  const outcomes = listExecutiveOutcomes(input.tenantId);
  const impact = measureDecisionImpact({ tenantId: input.tenantId, asOf });
  const value = measureValueRealisation(input);

  const scenarioMap = new Map<string, { outcomes: number; confirmed: number }>();
  const profileMap = new Map<
    IntelligenceProfileId,
    { outcomes: number; confirmed: number }
  >();

  for (const o of outcomes) {
    if (o.scenarioId) {
      const cur = scenarioMap.get(o.scenarioId) ?? { outcomes: 0, confirmed: 0 };
      cur.outcomes += 1;
      if (o.status === "confirmed") cur.confirmed += 1;
      scenarioMap.set(o.scenarioId, cur);
    }
    const p = profileMap.get(o.profileId) ?? { outcomes: 0, confirmed: 0 };
    p.outcomes += 1;
    if (o.status === "confirmed") p.confirmed += 1;
    profileMap.set(o.profileId, p);
  }

  const series = history.get(input.tenantId) ?? [];
  series.push(impact.influenceScore);
  history.set(input.tenantId, series.slice(-14));
  const prev = series.length > 1 ? series[series.length - 2]! : impact.influenceScore;
  const learningTrend =
    impact.influenceScore > prev + 2
      ? ("up" as const)
      : impact.influenceScore < prev - 2
        ? ("down" as const)
        : ("flat" as const);

  return {
    tenantId: input.tenantId,
    asOf,
    recommendationsByStatus: countRecommendationsByStatus(input.tenantId),
    outcomesByStatus: countOutcomesByStatus(input.tenantId),
    decisionInfluence: impact.influenceScore,
    estimatedValueMid: value.businessValueCreated.mid,
    estimatedValueConfidence: value.businessValueCreated.confidence,
    scenarioContribution: [...scenarioMap.entries()].map(([scenarioId, v]) => ({
      scenarioId,
      ...v,
    })),
    profileContribution: [...profileMap.entries()].map(([profileId, v]) => ({
      profileId,
      ...v,
    })),
    learningTrend,
    explanation: `Analytics for tenant ${input.tenantId} only — influence ${impact.influenceScore}, value mid ${value.businessValueCreated.mid}, trend ${learningTrend}.`,
  };
}
