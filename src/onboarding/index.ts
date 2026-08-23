/**
 * Executive Discovery Engine & Intelligent Onboarding
 *
 * Learns the organisation from connected systems.
 * Asks only what cannot be inferred.
 */

export type * from "@/onboarding/types";
export {
  TARGET_ONBOARDING_MINUTES,
  LEARNING_BANNER_DAYS,
  DEFAULT_MATURITY_HIDE_THRESHOLD,
} from "@/onboarding/types";

export {
  WELCOME_HEADLINE,
  WELCOME_BODY,
  WELCOME_PROMISE,
} from "@/onboarding/welcome";

export { discoverOrganisation, averageDiscoveryConfidence } from "@/onboarding/discovery";
export { inferOrganisation } from "@/onboarding/organisation";
export { extractPeople } from "@/onboarding/people";
export {
  learnExecutiveProfile,
  correctExecutiveProfile,
} from "@/onboarding/executive-profile";
export { inferIndustry } from "@/onboarding/industry";
export { recommendProviders } from "@/onboarding/providers";
export { bootstrapKnowledgeGraph } from "@/onboarding/knowledge-bootstrap";
export { scoreConfidence, buildLearningMaturity } from "@/onboarding/confidence";
export {
  applyValidationAction,
  validationCandidates,
  accuracyFromValidations,
} from "@/onboarding/validation";
export {
  createProgress,
  advanceProgress,
  estimateRemainingMinutes,
} from "@/onboarding/progress";
export { generateFirstExecutiveBrief } from "@/onboarding/experience";
export { buildOnboardingRecommendations } from "@/onboarding/recommendations";
export { measureOnboarding } from "@/onboarding/metrics";
export {
  assertDiscoveryTenantIsolation,
  assertGraphTenantIsolation,
  assertRecommendationIsolation,
  filterDiscoveriesForTenant,
} from "@/onboarding/isolation";

export {
  createDiscoverySession,
  submitMinimumQuestions,
  runDiscovery,
  validateDiscovery,
  completeDiscovery,
  selectDiscoveryIntelligenceProfile,
  getValidationQueue,
  getProviderRecommendations,
  saveDiscoverySession,
  loadDiscoverySession,
  resetDiscoverySessions,
} from "@/onboarding/session";
export type { DiscoverySession } from "@/onboarding/session";
