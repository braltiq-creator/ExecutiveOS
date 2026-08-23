import type { RecommendationEvaluation } from "@/evaluation";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { ScenarioCapture } from "@/simulation/types";
import { clampScore } from "@/intelligence/executive-intelligence/lib/helpers";

export type RunBenchmarks = {
  trustScore: number;
  evidenceCoverage: number;
  decisionReadiness: number;
  reasoningCompleteness: number;
  confidenceAccuracy: number;
  executiveAttentionEfficiency: number;
  /** Share of recommendations that passed evaluation gates */
  passRate: number;
  recommendationCount: number;
  blockedCount: number;
};

/**
 * Aggregate benchmark metrics for a Reality Lab run.
 */
export function computeRunBenchmarks(input: {
  evaluations: RecommendationEvaluation[];
  snapshot: IntelligentExecutiveSnapshot;
  capture: ScenarioCapture;
}): RunBenchmarks {
  const { evaluations, snapshot, capture } = input;
  const count = Math.max(1, evaluations.length);
  const passCount = evaluations.filter((item) => item.pass).length;

  const avg = (dimensionId: string) =>
    evaluations.reduce((sum, item) => {
      const dim = item.dimensions.find((d) => d.id === dimensionId);
      return sum + (dim?.score ?? 0);
    }, 0) / count;

  const trustScore = clampScore(
    evaluations.reduce((sum, item) => sum + item.overallScore, 0) / count,
  );
  const evidenceCoverage = clampScore(avg("evidence_quality"));
  const decisionReadiness = clampScore(
    (avg("completeness") + avg("decision_usefulness") + (passCount / count) * 100) /
      3,
  );
  const reasoningCompleteness = clampScore(
    (avg("explainability") + avg("completeness")) / 2,
  );
  const confidenceAccuracy = clampScore(avg("confidence_calibration"));

  const attentionBudget = snapshot.attention.budgetMinutes || 1;
  const selectedMinutes = snapshot.attention.selected.reduce(
    (sum, item) => sum + item.estimatedMinutes,
    0,
  );
  const usefulHighAttention = evaluations.filter(
    (item) =>
      item.pass &&
      (snapshot.recommendations.find((r) => r.id === item.recommendationId)
        ?.attentionValue ?? 0) >= 60,
  ).length;
  const executiveAttentionEfficiency = clampScore(
    (usefulHighAttention / count) * 55 +
      (selectedMinutes <= attentionBudget ? 25 : 10) +
      Math.min(20, capture.alternatives.length * 2),
  );

  return {
    trustScore,
    evidenceCoverage,
    decisionReadiness,
    reasoningCompleteness,
    confidenceAccuracy,
    executiveAttentionEfficiency,
    passRate: clampScore((passCount / count) * 100),
    recommendationCount: evaluations.length,
    blockedCount: evaluations.length - passCount,
  };
}
