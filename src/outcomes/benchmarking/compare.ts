/**
 * Within-tenant outcomes benchmarking — never compares business outcomes across tenants.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { measureDecisionImpact } from "@/outcomes/decision-impact";
import { measureValueRealisation } from "@/outcomes/value-realisation";
import { assessOutcomesConfidence } from "@/outcomes/confidence";
import { anonymisePortfolioTelemetry } from "@/outcomes/framework/isolation";

export type OutcomesBenchmark = {
  tenantId: string;
  asOf: string;
  influenceScore: number;
  confirmationConfidence: number;
  valueMid: number;
  trend: "up" | "flat" | "down";
  history: Array<{ at: string; influence: number; valueMid: number }>;
  explanation: string;
};

const tenantHistory = new Map<
  string,
  Array<{ at: string; influence: number; valueMid: number }>
>();

export function resetOutcomesBenchmarking(): void {
  tenantHistory.clear();
}

export function benchmarkTenantOutcomes(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): OutcomesBenchmark {
  const asOf = input.asOf ?? new Date().toISOString();
  const impact = measureDecisionImpact({ tenantId: input.tenantId, asOf });
  const value = measureValueRealisation(input);
  const confidence = assessOutcomesConfidence({
    tenantId: input.tenantId,
    asOf,
  });

  const series = tenantHistory.get(input.tenantId) ?? [];
  series.push({
    at: asOf,
    influence: impact.influenceScore,
    valueMid: value.businessValueCreated.mid,
  });
  tenantHistory.set(input.tenantId, series.slice(-20));

  const prev = series.length > 1 ? series[series.length - 2]! : series[0]!;
  const trend =
    impact.influenceScore > prev.influence + 2
      ? ("up" as const)
      : impact.influenceScore < prev.influence - 2
        ? ("down" as const)
        : ("flat" as const);

  return {
    tenantId: input.tenantId,
    asOf,
    influenceScore: impact.influenceScore,
    confirmationConfidence: confidence.overall,
    valueMid: value.businessValueCreated.mid,
    trend,
    history: series,
    explanation: `Within-tenant outcomes trend ${trend}. Business outcomes are never compared across tenants.`,
  };
}

/** Braltiq portfolio view — anonymised aggregates only. */
export function buildAnonymisedPortfolioOutcomes(input: {
  tenants: Array<{
    tenantId: string;
    profileId: IntelligenceProfileId;
  }>;
  asOf?: string;
}) {
  const asOf = input.asOf ?? new Date().toISOString();
  const confirmationRates: number[] = [];
  const influenceScores: number[] = [];
  const roiMids: number[] = [];

  for (const t of input.tenants) {
    const impact = measureDecisionImpact({ tenantId: t.tenantId, asOf });
    const confidence = assessOutcomesConfidence({
      tenantId: t.tenantId,
      asOf,
    });
    const value = measureValueRealisation({
      tenantId: t.tenantId,
      profileId: t.profileId,
      asOf,
    });
    confirmationRates.push(confidence.confirmationRate);
    influenceScores.push(impact.influenceScore);
    roiMids.push(value.businessValueCreated.mid);
  }

  return anonymisePortfolioTelemetry({
    asOf,
    confirmationRates,
    influenceScores,
    roiMids,
  });
}
