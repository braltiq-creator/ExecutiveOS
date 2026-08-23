/**
 * Pilot Intelligence & Experimentation Platform
 *
 * Braltiq-internal learning programme for Design Partner engagements.
 * Strict tenant isolation — anonymised aggregate telemetry only.
 * Not visible to Design Partners.
 */

export type * from "@/experiments/framework/types";
export {
  assertExperimentsPayload,
  anonymiseExperimentTelemetry,
  partnerLabelFromTenantId,
} from "@/experiments/framework";

export { resetExperimentationPlatform } from "@/experiments/reset";

export {
  createHypothesis,
  getHypothesis,
  listHypotheses,
  resetHypotheses,
} from "@/experiments/hypotheses";

export {
  createExperiment,
  updateExperimentStatus,
  getExperiment,
  listExperiments,
  listExperimentsForTenant,
  listExperimentsForProfile,
  startExperiment,
  pauseExperiment,
  completeExperiment,
  resetExperiments,
} from "@/experiments/experiments";

export { measurePilotIntelligence } from "@/experiments/pilot-intelligence";
export { measureFeatureAdoption } from "@/experiments/feature-adoption";

export {
  recordBehaviourEvent,
  listBehaviourEvents,
  countBehaviourEvents,
  resetBehaviourEvents,
} from "@/experiments/behaviour";

export {
  recordInterview,
  listInterviews,
  listInterviewsForExperiment,
  resetInterviews,
} from "@/experiments/interviews";

export {
  recordProductFeedback,
  listProductFeedback,
  resetProductFeedback,
} from "@/experiments/feedback";

export {
  generateProductInsights,
  listCachedInsights,
  resetProductInsights,
} from "@/experiments/insights";

export {
  measureRecommendationEffectiveness,
  type RecommendationEffectiveness,
} from "@/experiments/recommendations";

export { buildCohortAnalytics } from "@/experiments/cohorts";
export {
  buildPortfolioExperimentAnalytics,
  buildProfileAnalytics,
} from "@/experiments/analytics";

export {
  recommendRoadmapPriorities,
  resetRoadmapRecommendations,
} from "@/experiments/roadmap";

export { buildExperimentationDashboard } from "@/experiments/dashboard/build";
