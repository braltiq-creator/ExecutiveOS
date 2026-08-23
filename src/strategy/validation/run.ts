/**
 * Strategy validation — outcome progress & contribution tracking.
 */

import { measureStrategicProgress } from "@/strategy/progress";
import { assessStrategyConfidence } from "@/strategy/confidence";
import { buildAlignmentSnapshot } from "@/strategy/alignment";
import { listStrategicInitiatives } from "@/strategy/initiatives";
import type { StrategyValidationSnapshot } from "@/strategy/framework/types";

export function validateStrategicAlignment(input: {
  tenantId: string;
  recommendations?: Array<{ id: string; title: string; detail?: string }>;
  decisions?: Array<{ id: string; title: string; detail?: string }>;
  asOf?: string;
}): StrategyValidationSnapshot {
  const asOf = input.asOf ?? new Date().toISOString();
  const progress = measureStrategicProgress({
    tenantId: input.tenantId,
    asOf,
  });
  const confidence = assessStrategyConfidence({
    tenantId: input.tenantId,
    asOf,
  });
  const alignment = buildAlignmentSnapshot({
    tenantId: input.tenantId,
    recommendations: input.recommendations,
    decisions: input.decisions,
    asOf,
  });
  const initiatives = listStrategicInitiatives(input.tenantId);
  const healthyInitiatives = initiatives.filter(
    (i) =>
      i.status === "active" ||
      i.status === "completed" ||
      (i.status === "planned" && i.progressPct >= 0),
  );
  const initiativeHealth =
    initiatives.length === 0
      ? 40
      : Math.round(
          (healthyInitiatives.filter((i) => i.status !== "drifting" && i.status !== "blocked")
            .length /
            initiatives.length) *
            100,
        );

  const recommendationContribution =
    alignment.recommendationAlignments.length === 0
      ? 0
      : Math.round(
          alignment.recommendationAlignments.reduce(
            (s, a) => s + a.estimatedContribution,
            0,
          ) / alignment.recommendationAlignments.length,
        );

  return {
    tenantId: input.tenantId,
    asOf,
    outcomeProgress: progress.overallProgressPct,
    recommendationContribution,
    executiveDecisionsLinked: alignment.decisionAlignments.length,
    businessOutcomesLinked: initiatives.reduce(
      (s, i) => s + i.businessOutcomeIds.length,
      0,
    ),
    initiativeHealth,
    confidence: confidence.overall,
    explanation: `Strategy validation — progress ${progress.overallProgressPct}%, recommendation contribution ${recommendationContribution}%, initiative health ${initiativeHealth}%, confidence ${confidence.overall}%.`,
  };
}
