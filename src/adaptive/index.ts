/**
 * Continuous Intelligence & Adaptive Learning Platform
 *
 * Refines presentation, prioritisation, confidence and recommendations
 * using explainable adaptive learning. Core intelligence unchanged.
 */

export type * from "@/adaptive/framework/types";
export { attachAdaptiveLearningToTodayActions } from "@/adaptive/framework/attach-today";
export { resetAdaptivePlatform } from "@/adaptive/reset";

export {
  ensureAdaptiveProfile,
  getAdaptiveProfile,
  listAdaptiveProfiles,
  updateAdaptiveProfile,
  preferencesFromProfile,
} from "@/adaptive/preferences/store";

export {
  recordAdaptiveBehaviour,
  listAdaptiveBehaviour,
} from "@/adaptive/behaviour/store";

export {
  learnRecommendationDisposition,
  getRecommendationLearning,
  listRecommendationLearning,
} from "@/adaptive/recommendation-learning/store";

export { rankRecommendationsForExecutive } from "@/adaptive/ranking/order";

export {
  buildPersonalisationPlan,
  getPersonalisationStatus,
} from "@/adaptive/personalisation/plan";

export {
  recordConfidenceEvolution,
  improveValueEstimation,
  listValueLearning,
  getConfidenceTrend,
} from "@/adaptive/confidence/evolve";

export { captureExecutiveFeedback } from "@/adaptive/feedback/capture";

export {
  identifyImprovementOpportunities,
  feedImprovementsToProductIntelligence,
} from "@/adaptive/optimisation/improve";

export { computeBenchmarkPercentiles } from "@/adaptive/benchmarking/compare";

export { runAdaptiveLearningCycle } from "@/adaptive/learning/loop";

export {
  viewLearnedPreferences,
  disableAdaptiveLearning,
  enableAdaptiveLearning,
  resetAdaptiveProfile,
  isAdaptiveEnabled,
} from "@/adaptive/governance/controls";

export { listLearningHistory } from "@/adaptive/governance/history";

export { buildAdaptiveDashboard } from "@/adaptive/dashboard/build";
