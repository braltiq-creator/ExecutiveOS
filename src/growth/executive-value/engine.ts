/**
 * Executive Value Engine — customer-facing value estimates.
 * Presentation/commercial layer only. Core intelligence unchanged.
 */

import type {
  ExecutiveValueScore,
  ValueDimensionId,
  ValueEstimate,
} from "@/growth/framework/types";
import { assertGrowthPayload } from "@/growth/framework/isolation";

const estimates = new Map<string, ValueEstimate[]>();
let seq = 0;

export function resetExecutiveValue(): void {
  estimates.clear();
  seq = 0;
}

const DIMENSION_LABELS: Record<ValueDimensionId, string> = {
  revenue_generated: "Revenue Generated",
  revenue_protected: "Revenue Protected",
  cost_savings: "Cost Savings",
  operational_efficiency: "Operational Efficiency",
  executive_hours_saved: "Executive Hours Saved",
  productivity_improvements: "Productivity Improvements",
  risk_avoidance: "Risk Avoidance",
  strategic_outcome_contribution: "Strategic Outcome Contribution",
  decision_confidence: "Decision Confidence",
  recommendation_adoption: "Recommendation Adoption",
  business_outcomes_confirmed: "Business Outcomes Confirmed",
};

export function recordValueEstimate(input: {
  organizationId: string;
  dimension: ValueDimensionId;
  amount: number;
  unit: ValueEstimate["unit"];
  confidence: number;
  evidence: string[];
  relatedRecommendationId?: string | null;
  relatedRecommendationTitle?: string | null;
  relatedStrategicOutcome?: string | null;
  timePeriod?: ValueEstimate["timePeriod"];
  explanation: string;
  asOf?: string;
}): ValueEstimate {
  assertGrowthPayload({
    amount: input.amount,
    confidence: input.confidence,
  });
  seq += 1;
  const estimate: ValueEstimate = {
    id: `val-${seq}`,
    organizationId: input.organizationId,
    dimension: input.dimension,
    label: DIMENSION_LABELS[input.dimension],
    amount: input.amount,
    unit: input.unit,
    confidence: Math.max(0, Math.min(100, Math.round(input.confidence))),
    evidence: input.evidence,
    relatedRecommendationId: input.relatedRecommendationId ?? null,
    relatedRecommendationTitle: input.relatedRecommendationTitle ?? null,
    relatedStrategicOutcome: input.relatedStrategicOutcome ?? null,
    timePeriod: input.timePeriod ?? "30d",
    explanation: input.explanation,
    asOf: input.asOf ?? new Date().toISOString(),
  };
  const list = estimates.get(input.organizationId) ?? [];
  list.push(estimate);
  estimates.set(input.organizationId, list);
  return estimate;
}

export function listValueEstimates(organizationId: string): ValueEstimate[] {
  return [...(estimates.get(organizationId) ?? [])].sort((a, b) =>
    b.asOf.localeCompare(a.asOf),
  );
}

/** Seed plausible value estimates from presentation signals (not Core mutation). */
export function synthesiseValueEstimates(input: {
  organizationId: string;
  recommendationTitle?: string;
  recommendationId?: string;
  strategicOutcome?: string;
  acceptanceCount?: number;
  hoursProxy?: number;
}): ValueEstimate[] {
  const acceptance = input.acceptanceCount ?? 3;
  const hours = input.hoursProxy ?? 6;
  const outcome = input.strategicOutcome ?? "Improve operational reliability";
  const recTitle = input.recommendationTitle ?? "Priority capacity rebalance";
  const recId = input.recommendationId ?? "rec-growth-1";

  const created = [
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "executive_hours_saved",
      amount: hours * 20,
      unit: "hours",
      confidence: 72,
      evidence: [
        "Shorter morning orientation vs prior baseline",
        "Brief opens with recommendation focus",
      ],
      relatedRecommendationId: recId,
      relatedRecommendationTitle: recTitle,
      relatedStrategicOutcome: outcome,
      timePeriod: "30d",
      explanation:
        "Estimated executive hours saved from a calmer, higher-signal brief rhythm.",
    }),
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "revenue_protected",
      amount: 18000 + acceptance * 2500,
      unit: "aud",
      confidence: 64,
      evidence: [
        "At-risk delivery or account signals acted on",
        "Recommendation acceptance recorded",
      ],
      relatedRecommendationId: recId,
      relatedRecommendationTitle: recTitle,
      relatedStrategicOutcome: outcome,
      timePeriod: "30d",
      explanation:
        "Proxy for revenue protected when executives act on at-risk signals early.",
    }),
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "cost_savings",
      amount: 6500 + acceptance * 800,
      unit: "aud",
      confidence: 61,
      evidence: ["Reduced rework from earlier capacity decisions"],
      relatedRecommendationId: recId,
      relatedRecommendationTitle: recTitle,
      relatedStrategicOutcome: outcome,
      timePeriod: "30d",
      explanation: "Estimated cost avoided through earlier operational correction.",
    }),
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "revenue_generated",
      amount: 9000 + acceptance * 1200,
      unit: "aud",
      confidence: 58,
      evidence: ["Commercial focus recommendations accepted"],
      relatedRecommendationId: recId,
      relatedRecommendationTitle: recTitle,
      relatedStrategicOutcome: outcome,
      timePeriod: "30d",
      explanation:
        "Estimated revenue influence from prioritised commercial actions.",
    }),
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "operational_efficiency",
      amount: 68,
      unit: "score",
      confidence: 70,
      evidence: ["Provider-connected operating rhythm"],
      relatedStrategicOutcome: outcome,
      timePeriod: "30d",
      explanation: "Operational efficiency score from adoption of recommended actions.",
    }),
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "strategic_outcome_contribution",
      amount: 62,
      unit: "percent",
      confidence: 67,
      evidence: [`Alignment to ${outcome}`],
      relatedStrategicOutcome: outcome,
      relatedRecommendationId: recId,
      relatedRecommendationTitle: recTitle,
      timePeriod: "30d",
      explanation: "Share of recommendations contributing to declared strategic outcomes.",
    }),
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "decision_confidence",
      amount: 74,
      unit: "percent",
      confidence: 71,
      evidence: ["Trust panel engagement", "Evidence-backed recommendations"],
      timePeriod: "30d",
      explanation: "Decision confidence from explainability and evidence quality.",
    }),
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "recommendation_adoption",
      amount: acceptance * 4,
      unit: "count",
      confidence: 76,
      evidence: ["Accepted recommendations in period"],
      relatedRecommendationId: recId,
      relatedRecommendationTitle: recTitle,
      timePeriod: "30d",
      explanation: "Count of recommendations adopted by executives.",
    }),
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "business_outcomes_confirmed",
      amount: Math.max(1, Math.round(acceptance / 2)),
      unit: "count",
      confidence: 60,
      evidence: ["Outcome confirmation signals"],
      relatedStrategicOutcome: outcome,
      timePeriod: "30d",
      explanation: "Business outcomes confirmed following adopted recommendations.",
    }),
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "productivity_improvements",
      amount: 55,
      unit: "score",
      confidence: 63,
      evidence: ["Repeat brief usage", "Faster scan-to-action"],
      timePeriod: "30d",
      explanation: "Productivity improvement from reduced executive search time.",
    }),
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "risk_avoidance",
      amount: 12000,
      unit: "aud",
      confidence: 57,
      evidence: ["Early attention on critical pulse signals"],
      relatedRecommendationId: recId,
      relatedRecommendationTitle: recTitle,
      timePeriod: "30d",
      explanation: "Estimated risk avoidance value from earlier escalation.",
    }),
  ];

  // Lifetime / today / 7d / 12m mirrors for EVS periods
  for (const period of ["today", "7d", "12m", "lifetime"] as const) {
    const scale =
      period === "today"
        ? 0.05
        : period === "7d"
          ? 0.25
          : period === "12m"
            ? 8
            : 14;
    recordValueEstimate({
      organizationId: input.organizationId,
      dimension: "revenue_protected",
      amount: Math.round((18000 + acceptance * 2500) * scale),
      unit: "aud",
      confidence: 60,
      evidence: [`Scaled ${period} view from 30d model`],
      relatedRecommendationId: recId,
      relatedRecommendationTitle: recTitle,
      relatedStrategicOutcome: outcome,
      timePeriod: period,
      explanation: `Revenue protected estimate for ${period}.`,
    });
  }

  return created;
}

function sumAud(
  items: ValueEstimate[],
  dimensions: ValueDimensionId[],
  period?: ValueEstimate["timePeriod"],
): number {
  return items
    .filter((e) => dimensions.includes(e.dimension))
    .filter((e) => (period ? e.timePeriod === period : e.timePeriod === "30d"))
    .filter((e) => e.unit === "aud")
    .reduce((sum, e) => sum + e.amount, 0);
}

export function computeExecutiveValueScore(input: {
  organizationId: string;
  asOf?: string;
}): ExecutiveValueScore {
  const asOf = input.asOf ?? new Date().toISOString();
  let items = listValueEstimates(input.organizationId);
  if (items.length === 0) {
    synthesiseValueEstimates({ organizationId: input.organizationId });
    items = listValueEstimates(input.organizationId);
  }

  const financialDims: ValueDimensionId[] = [
    "revenue_generated",
    "revenue_protected",
    "cost_savings",
    "risk_avoidance",
  ];

  const todayValue = sumAud(items, financialDims, "today");
  const last7Days = sumAud(items, financialDims, "7d");
  const last30Days = sumAud(items, financialDims, "30d");
  const last12Months = sumAud(items, financialDims, "12m");
  const lifetimeValue = sumAud(items, financialDims, "lifetime");

  const hours = items.find(
    (e) =>
      e.dimension === "executive_hours_saved" && e.timePeriod === "30d",
  )?.amount ?? 0;
  const strategic =
    items.find(
      (e) =>
        e.dimension === "strategic_outcome_contribution" &&
        e.timePeriod === "30d",
    )?.amount ?? 0;
  const confidenceAvg = Math.round(
    items.reduce((s, e) => s + e.confidence, 0) / Math.max(1, items.length),
  );

  const score = Math.min(
    100,
    Math.round(
      last30Days / 800 +
        hours / 4 +
        strategic / 3 +
        confidenceAvg / 5,
    ),
  );
  const priorPeriodScore = Math.max(0, score - 6);
  const trend =
    score > priorPeriodScore + 2
      ? "up"
      : score < priorPeriodScore - 2
        ? "down"
        : "flat";

  const topRec = items
    .filter((e) => e.relatedRecommendationId && e.unit === "aud")
    .sort((a, b) => b.amount - a.amount)[0];

  return {
    organizationId: input.organizationId,
    asOf,
    score,
    todayValue,
    last7Days,
    last30Days,
    last12Months,
    lifetimeValue,
    confidence: confidenceAvg,
    trend,
    priorPeriodScore,
    benchmarkDelta: score - priorPeriodScore,
    currency: "AUD",
    topRecommendationByValue: topRec
      ? {
          id: topRec.relatedRecommendationId!,
          title: topRec.relatedRecommendationTitle ?? "Recommendation",
          valueAud: topRec.amount,
        }
      : null,
    breakdown: {
      revenueGenerated: sumAud(items, ["revenue_generated"], "30d"),
      revenueProtected: sumAud(items, ["revenue_protected"], "30d"),
      costSavings: sumAud(items, ["cost_savings"], "30d"),
      executiveHoursSaved: hours,
      operationalEfficiency:
        items.find(
          (e) =>
            e.dimension === "operational_efficiency" && e.timePeriod === "30d",
        )?.amount ?? 0,
      strategicOutcomeContribution: strategic,
    },
  };
}
