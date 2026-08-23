/**
 * Executive Outcomes Engine
 *
 * Measures whether ExecutiveOS creates measurable business value by influencing
 * executive decisions and organisational outcomes.
 *
 * Distinct from src/lib/outcomes (strategic outcome portfolio on /outcomes).
 */

export type * from "@/outcomes/framework/types";
export {
  listBusinessOutcomeTypes,
  defineBusinessOutcomeType,
  getBusinessOutcomeType,
  resetBusinessOutcomeTypes,
} from "@/outcomes/framework";
export {
  assertOutcomesPayload,
  anonymisePortfolioTelemetry,
} from "@/outcomes/framework/isolation";

export {
  resetRecommendationTracks,
  listRecommendationTracks,
  getRecommendationTrack,
  trackRecommendation,
  advanceRecommendation,
  countRecommendationsByStatus,
  RECOMMENDATION_LIFECYCLE,
} from "@/outcomes/recommendation-tracking";

export {
  resetExecutiveActions,
  listExecutiveActions,
  recordExecutiveAction,
  linkActionToOutcome,
  ACTION_LABELS,
} from "@/outcomes/executive-actions";

export {
  resetExecutiveOutcomes,
  listExecutiveOutcomes,
  getExecutiveOutcome,
  createExecutiveOutcome,
  updateExecutiveOutcomeStatus,
  countOutcomesByStatus,
} from "@/outcomes/business-outcomes";

export { measureDecisionImpact } from "@/outcomes/decision-impact";
export { measureValueRealisation } from "@/outcomes/value-realisation";
export { estimateOutcomesRoi } from "@/outcomes/roi";
export { assessOutcomesConfidence } from "@/outcomes/confidence";

export {
  resetLearningWeights,
  getLearningFeedbackWeights,
  applyConfirmedOutcomesLearning,
  recommendationConfidenceWithLearning,
  scenarioConfidenceWithLearning,
} from "@/outcomes/learning";

export { generatePilotSuccessReport } from "@/outcomes/reports";
export {
  buildOutcomesAnalytics,
  resetOutcomesAnalyticsState,
} from "@/outcomes/analytics";
export {
  benchmarkTenantOutcomes,
  buildAnonymisedPortfolioOutcomes,
  resetOutcomesBenchmarking,
} from "@/outcomes/benchmarking";
export type { OutcomesBenchmark } from "@/outcomes/benchmarking";

export { buildOutcomesDashboard } from "@/outcomes/dashboard";
export { resetOutcomesEngine } from "@/outcomes/reset";
