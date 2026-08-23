/**
 * Operational Excellence & Observability Platform
 * (+ Design Partner Operations Centre)
 *
 * Braltiq-internal only. Monitors platform, providers, commercial
 * performance, customer health, releases, and incidents.
 * Strict tenant isolation: never cross-tenant business data.
 * Core intelligence unchanged. No customer-facing capabilities.
 */

export type * from "@/operations/types";
export type * from "@/operations/observability/types";

export { resetOperationsCentre } from "@/operations/reset";

export {
  extractTenantTelemetry,
  trafficLightFromScore,
  assertOperationalPayload,
} from "@/operations/isolation";

export {
  resetPartnerOpsRegistry,
  getPartnerOpsRecord,
  listPartnerOpsRecords,
  upsertPartnerOpsRecord,
  syncPartnersFromPilots,
  ensurePartnerForTenant,
} from "@/operations/partners";

export {
  buildPartnerDashboardRow,
  buildOperationsCentreDashboard,
} from "@/operations/dashboard";

export {
  computePilotOpsHealth,
  buildCustomerHealthPortfolio,
} from "@/operations/health";
export { measureAdoption } from "@/operations/adoption";
export {
  measureEngagement,
  recordEngagementSample,
  resetEngagementHistory,
} from "@/operations/engagement";

export {
  getCustomerSuccessPlan,
  updateCustomerSuccessPlan,
  measureValueRealisation,
} from "@/operations/success";

export {
  resetSupportIssues,
  listSupportIssues,
  listSupportIssuesForTenant,
  recordSupportIssue,
  updateSupportIssue,
  detectSupportPatterns,
} from "@/operations/support";

export {
  resetOpsAlerts,
  listOpsAlerts,
  listOpenOpsAlerts,
  acknowledgeOpsAlert,
  resolveOpsAlert,
  evaluateOpsAlerts,
  getAlertThresholds,
  configureAlertThresholds,
  resetAlertThresholds,
  resetPlatformAlerts,
  listPlatformAlerts,
  listCriticalPlatformAlerts,
  acknowledgePlatformAlert,
  evaluatePlatformAlerts,
} from "@/operations/alerts";

export { resetOpsNotes, listNotesForTenant, addOpsNote } from "@/operations/notes";
export {
  resetOpsTasks,
  listTasksForTenant,
  createOpsTask,
  completeOpsTask,
} from "@/operations/tasks";

export {
  resetPartnerReviews,
  listReviewsForTenant,
  recordPartnerReview,
  getReview,
} from "@/operations/reviews";

export {
  resetRoadmapItems,
  listRoadmapItems,
  addRoadmapItem,
  updateRoadmapItem,
} from "@/operations/roadmap";

export {
  buildPortfolioAnalytics,
  resetPortfolioAnalyticsState,
  buildCommercialHealth,
} from "@/operations/analytics";

export { buildOperationalExcellenceDashboard } from "@/operations/observability";
export { collectPlatformHealth, resetMonitoringHistory } from "@/operations/monitoring";
export { runPlatformDiagnostics } from "@/operations/diagnostics";
export { collectPerformanceMetrics } from "@/operations/performance";
export { monitorProviderHealth } from "@/operations/provider-health";
export { monitorBillingHealth } from "@/operations/billing-health";
export { monitorAdoptionHealth } from "@/operations/adoption-health";
export { monitorValueHealth } from "@/operations/value-health";
export { monitorSecurityHealth } from "@/operations/security-health";
export {
  resetReleaseManagement,
  ensureDefaultReleaseState,
  recordDeployment,
  setFeatureFlag,
  buildReleaseManagementSnapshot,
} from "@/operations/release-management";
export {
  resetIncidents,
  openIncident,
  updateIncident,
  listIncidents,
  listOpenIncidents,
} from "@/operations/incident-management";
