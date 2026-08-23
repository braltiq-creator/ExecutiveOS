/**
 * Executive Validation Suite
 *
 * Continuously measures how accurately ExecutiveOS understands the organisation.
 * Customer-facing trust + internal Design Partner / CS quality system.
 */

export type * from "@/validation/types";

export { buildExecutiveMaturity } from "@/validation/maturity";
export { measureDiscoveryCoverage } from "@/validation/coverage";
export {
  assessKnowledgeGraphHealth,
  assessExecutiveProfileHealth,
  assessContextProviderHealth,
  registerProviderHealthAdapter,
} from "@/validation/quality";
export {
  measureRecommendationQuality,
  recordRecommendation,
  resetRecommendationStore,
} from "@/validation/recommendations";
export {
  submitExecutiveFeedback,
  listExecutiveFeedback,
  feedbackConfidenceDelta,
  resetFeedbackStore,
} from "@/validation/feedback";
export { adjustScoreWithFeedback, confidenceBand } from "@/validation/confidence";
export { assessLearning } from "@/validation/learning";
export { measureDiscoveryAccuracy } from "@/validation/accuracy";
export { buildTenantHealth } from "@/validation/tenant-health";
export {
  buildValidationHistory,
  recordHistoryPoint,
  resetValidationHistory,
} from "@/validation/history";
export { benchmarkTenant } from "@/validation/benchmarking";
export { measureValidationSuccess } from "@/validation/metrics";
export { buildValidationSuite } from "@/validation/dashboard";
