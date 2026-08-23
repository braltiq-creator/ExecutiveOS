/**
 * Confidence in strategic outcome understanding.
 */

import { listStrategicOutcomes } from "@/strategy/outcomes";
import { listStrategicInitiatives } from "@/strategy/initiatives";
import { listStrategicMetrics } from "@/strategy/metrics";

export type StrategyConfidenceModel = {
  tenantId: string;
  asOf: string;
  overall: number;
  evidenceCoverage: number;
  initiativeCoverage: number;
  metricCoverage: number;
  explanation: string;
};

export function assessStrategyConfidence(input: {
  tenantId: string;
  asOf?: string;
}): StrategyConfidenceModel {
  const asOf = input.asOf ?? new Date().toISOString();
  const outcomes = listStrategicOutcomes(input.tenantId);
  if (outcomes.length === 0) {
    return {
      tenantId: input.tenantId,
      asOf,
      overall: 15,
      evidenceCoverage: 0,
      initiativeCoverage: 0,
      metricCoverage: 0,
      explanation:
        "Low confidence — no strategic outcomes declared. Capture three outcomes in Discovery.",
    };
  }

  const withEvidence = outcomes.filter((o) => o.evidence.length > 0).length;
  const initiatives = listStrategicInitiatives(input.tenantId);
  const withInitiatives = outcomes.filter((o) =>
    initiatives.some((i) => i.outcomeId === o.id),
  ).length;
  const metrics = listStrategicMetrics(input.tenantId);
  const withMetrics = outcomes.filter((o) =>
    metrics.some((m) => m.outcomeId === o.id),
  ).length;

  const evidenceCoverage = Math.round((withEvidence / outcomes.length) * 100);
  const initiativeCoverage = Math.round(
    (withInitiatives / outcomes.length) * 100,
  );
  const metricCoverage = Math.round((withMetrics / outcomes.length) * 100);
  const avgOutcomeConfidence = Math.round(
    outcomes.reduce((s, o) => s + o.confidence, 0) / outcomes.length,
  );
  const overall = Math.round(
    avgOutcomeConfidence * 0.4 +
      evidenceCoverage * 0.25 +
      initiativeCoverage * 0.2 +
      metricCoverage * 0.15,
  );

  return {
    tenantId: input.tenantId,
    asOf,
    overall,
    evidenceCoverage,
    initiativeCoverage,
    metricCoverage,
    explanation: `Strategy confidence ${overall}/100 — evidence ${evidenceCoverage}%, initiatives ${initiativeCoverage}%, metrics ${metricCoverage}%.`,
  };
}
