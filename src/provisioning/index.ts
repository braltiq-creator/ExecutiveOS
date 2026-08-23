/**
 * Customer Provisioning Platform — Phase 53
 * Self-service tenant creation for Design Partners and commercial customers.
 */

export type * from "@/provisioning/types";

export {
  startFreeTrial,
  retryProvisioning,
  getProvisioningJob,
  listProvisioningJobs,
} from "@/provisioning/provision";

export {
  createCustomerAccount,
  verifyCustomerEmail,
  authenticateCustomer,
} from "@/provisioning/identity/account";

export {
  listProvisioningProfiles,
  getProvisioningProfile,
  PROVISIONING_PROFILES,
} from "@/provisioning/executive-profile/catalog";

export {
  createThirtyDayTrial,
  refreshTrialStatus,
  getTrialDaysRemaining,
  shouldPromptUpgrade,
  recordTrialUsage,
  listAllTrials,
  TRIAL_DAYS,
} from "@/provisioning/trial/manage";

export {
  queueProvisioningEmail,
  listProvisioningEmails,
} from "@/provisioning/email/send";

export {
  EMAIL_TEMPLATES,
  listEmailTemplateIds,
} from "@/provisioning/email/templates";

export { buildOnboardingKickoff } from "@/provisioning/onboarding/bridge";

export { buildProvisioningAdminSnapshot } from "@/provisioning/admin/queries";

export {
  validateStartFreeTrialInput,
  validateProvisioningJobComplete,
  isUnderFiveMinutes,
} from "@/provisioning/validation/validate";

export { reviewCustomerProvisioning } from "@/provisioning/self-review";

export { resetCustomerProvisioning } from "@/provisioning/reset";

export { listBootstrapArtefacts } from "@/provisioning/bootstrap/resources";
