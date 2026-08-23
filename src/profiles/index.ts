/**
 * Executive Intelligence Profiles
 *
 * Packages ExecutiveOS into role-specific executive experiences.
 * Customers select the outcome; connectors remain implementation details.
 */

export type * from "@/profiles/framework/types";
export {
  listIntelligenceProfiles,
  getIntelligenceProfile,
  isIntelligenceProfileId,
} from "@/profiles/catalog";
export { OPERATIONS_EXECUTIVE_PROFILE } from "@/profiles/operations";
export { COMMERCIAL_EXECUTIVE_PROFILE } from "@/profiles/commercial";
export { recommendIntelligenceProfile } from "@/profiles/recommendations";
export {
  resolveBriefLayout,
  primaryContextLabel,
} from "@/profiles/briefings";
export type { BriefSectionDescriptor } from "@/profiles/briefings";
export {
  getTenantProfileSelection,
  selectTenantIntelligenceProfile,
  applyRecommendedProfile,
  resetTenantProfileSelections,
  listTenantProfileSelections,
  resolveTenantIntelligenceProfile,
  projectProfileExperience,
} from "@/profiles/experience";
export type { ProfileExperienceProjection } from "@/profiles/experience";
export { runProfileValidationScenarios } from "@/profiles/validation";
export type {
  ProfileScenarioResult,
  ProfileValidationReport,
} from "@/profiles/validation";
