import type { AdaptiveDashboard } from "@/adaptive/framework/types";
import { listAdaptiveProfiles } from "@/adaptive/preferences/store";
import { listRecommendationLearning } from "@/adaptive/recommendation-learning/store";
import { identifyImprovementOpportunities } from "@/adaptive/optimisation/improve";
import { computeBenchmarkPercentiles } from "@/adaptive/benchmarking/compare";
import { listValueLearning } from "@/adaptive/confidence/evolve";

export function buildAdaptiveDashboard(input?: {
  asOf?: string;
}): AdaptiveDashboard {
  const asOf = input?.asOf ?? new Date().toISOString();
  const profiles = listAdaptiveProfiles();
  const recommendationEvolution = listRecommendationLearning();
  const improvements = identifyImprovementOpportunities();
  const valueLearning = listValueLearning();

  const learningHealth =
    profiles.length === 0
      ? 0
      : Math.round(
          profiles.reduce((s, p) => s + p.learningConfidence, 0) /
            profiles.length,
        );

  const adaptiveConfidence = Math.min(
    100,
    Math.round(
      learningHealth * 0.7 +
        Math.min(30, recommendationEvolution.length * 3),
    ),
  );

  const primaryTenant = profiles[0]?.tenantId;
  const benchmarks = primaryTenant
    ? computeBenchmarkPercentiles({ tenantId: primaryTenant })
    : [];

  return {
    asOf,
    learningHealth,
    adaptiveConfidence,
    personalisationActive: profiles.filter((p) => p.enabled).length,
    benchmarkParticipants: profiles.length,
    profiles,
    recommendationEvolution: recommendationEvolution.slice(0, 20),
    improvements: improvements.slice(0, 12),
    benchmarks,
    valueLearning,
  };
}
