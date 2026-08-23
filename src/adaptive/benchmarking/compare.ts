import type { BenchmarkPercentile, BenchmarkMetricId } from "@/adaptive/framework/types";
import { listAdaptiveProfiles } from "@/adaptive/preferences/store";
import { listRecommendationLearning } from "@/adaptive/recommendation-learning/store";

/**
 * Anonymised portfolio benchmarking — percentile bands only.
 * Never exposes customer business data.
 */
export function computeBenchmarkPercentiles(input: {
  tenantId: string;
}): BenchmarkPercentile[] {
  const profiles = listAdaptiveProfiles();
  if (profiles.length === 0) {
    return emptyBenchmarks("No anonymised peer cohort available yet.");
  }

  const acceptance = profiles.map((p) => p.recommendationAcceptanceRate);
  const engagement = profiles.map(
    (p) => p.briefingBehaviour.opensPerWeek * 10 + p.reviewCompletionRate / 2,
  );
  const learning = profiles.map((p) => p.learningConfidence);
  const mine = profiles.find((p) => p.tenantId === input.tenantId);

  const myAcceptance = mine?.recommendationAcceptanceRate ?? median(acceptance);
  const myEngagement =
    (mine?.briefingBehaviour.opensPerWeek ?? 0) * 10 +
    (mine?.reviewCompletionRate ?? 0) / 2;
  const myLearning = mine?.learningConfidence ?? median(learning);

  const ignored = listRecommendationLearning(input.tenantId).filter(
    (r) => (r.dispositions.ignored ?? 0) + (r.dispositions.rejected ?? 0) > 2,
  ).length;

  return [
    band(
      "recommendation_acceptance",
      "Recommendation acceptance",
      percentileRank(acceptance, myAcceptance),
    ),
    band(
      "executive_engagement",
      "Executive engagement",
      percentileRank(engagement, myEngagement),
    ),
    band(
      "executive_value_score",
      "Executive Value Score (proxy)",
      percentileRank(learning, myLearning),
    ),
    band(
      "strategic_progress",
      "Strategic progress (proxy)",
      percentileRank(
        learning,
        Math.max(0, myLearning - ignored * 3),
      ),
    ),
    band(
      "time_to_first_value",
      "Time to first value",
      percentileRank(
        engagement,
        myEngagement,
      ),
    ),
    band(
      "adoption",
      "Adoption",
      percentileRank(
        profiles.map((p) => p.reviewCompletionRate),
        mine?.reviewCompletionRate ?? 0,
      ),
    ),
  ];
}

function emptyBenchmarks(explanation: string): BenchmarkPercentile[] {
  const ids: BenchmarkMetricId[] = [
    "recommendation_acceptance",
    "executive_engagement",
    "executive_value_score",
    "strategic_progress",
    "time_to_first_value",
    "adoption",
  ];
  return ids.map((metricId) => ({
    metricId,
    label: metricId.replace(/_/g, " "),
    percentile: 50,
    band: "above_median",
    explanation,
  }));
}

function band(
  metricId: BenchmarkMetricId,
  label: string,
  percentile: number,
): BenchmarkPercentile {
  const band =
    percentile < 25
      ? "bottom_quartile"
      : percentile < 50
        ? "below_median"
        : percentile < 75
          ? "above_median"
          : "top_quartile";
  return {
    metricId,
    label,
    percentile,
    band,
    explanation: `Anonymised peer percentile ${percentile} (${band.replace(/_/g, " ")}). No customer identities exposed.`,
  };
}

function percentileRank(values: number[], value: number): number {
  if (values.length === 0) return 50;
  const sorted = [...values].sort((a, b) => a - b);
  const below = sorted.filter((v) => v < value).length;
  return Math.round((below / sorted.length) * 100);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)]!;
}
