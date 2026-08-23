/**
 * Product-Led Growth & Executive Value Platform
 *
 * Customer self-service purchase, activation, and measurable value.
 * Extends commercial experience. Core intelligence unchanged.
 */

export type * from "@/growth/framework/types";
export { assertGrowthPayload } from "@/growth/framework/isolation";
export { resetGrowthPlatform } from "@/growth/reset";

export {
  GROWTH_AUTH_METHODS,
  resolveAuthMethod,
} from "@/growth/authentication";

export { GROWTH_PLANS, beginSelfServiceCheckout } from "@/growth/checkout";

export {
  startTrialSubscription,
  activatePaidSubscription,
  changeSubscriptionPlan,
  cancelSubscription,
  getSubscriptionForOrganization,
  listInvoices,
  listSubscriptions,
} from "@/growth/subscriptions";

export { buildUsageDashboard } from "@/growth/billing";

export {
  ACTIVATION_STEP_ORDER,
  createActivationSteps,
  activationProgressPct,
  startCustomerJourney,
  completeActivationStep,
  getCustomerJourney,
  listCustomerJourneys,
  runFiveMinuteActivationPath,
} from "@/growth/activation";

export {
  markProviderConnected,
  listConnectedProviders,
  hasMinimumProviders,
} from "@/growth/provider-setup";

export { getTrialStatus } from "@/growth/trial";
export { recommendUpgrades } from "@/growth/upgrades";
export { assessCustomerHealth } from "@/growth/customer-journey";

export {
  recordValueEstimate,
  listValueEstimates,
  synthesiseValueEstimates,
  computeExecutiveValueScore,
} from "@/growth/executive-value";

export {
  generateExecutiveValueReport,
  listGrowthRoiReports,
} from "@/growth/roi";

export {
  pushGrowthNotification,
  generateValueNotifications,
  listGrowthNotifications,
} from "@/growth/notifications";

export {
  recordGrowthTelemetry,
  listGrowthTelemetry,
} from "@/growth/telemetry";
