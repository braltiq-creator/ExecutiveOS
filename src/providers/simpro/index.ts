/**
 * Simpro / Field Service Executive Context Provider
 *
 * Transforms field operations into portable executive context.
 * Vendor objects never escape this package.
 */

export {
  createSimproApiClient,
  createMockSimproHttpTransport,
  createRateLimitTransport,
} from "@/providers/simpro/api";
export type {
  SimproApiClient,
  SimproTelemetryEvent,
} from "@/providers/simpro/api";
export { simulateLargeCustomerPortfolio } from "@/providers/simpro/api/mapping";

export {
  SIMPRO_OAUTH_SCOPES,
  createSimproTokenVault,
  validateSimproCredentials,
  createSimproAuthSession,
  logoutSimproSession,
  refreshSimproOAuth,
} from "@/providers/simpro/auth";
export type {
  SimproCredentials,
  EncryptedSimproCredentials,
  SimproAuthSession,
} from "@/providers/simpro/auth";

export {
  syncSimproExecutiveContext,
  buildOperationalContextBriefFromMock,
} from "@/providers/simpro/provider";
export type {
  SimproProviderOptions,
  SimproProviderResult,
} from "@/providers/simpro/provider";

export {
  applySimproExecutiveContext,
  applySimproExecutiveContextAsync,
} from "@/providers/simpro/apply";

export { toOperationalContextView } from "@/providers/simpro/to-view";

export type * from "@/providers/simpro/executive-context/types";
export {
  OPERATIONAL_SIGNAL_IDS,
  deriveOperationalSignals,
  operationalHealthFromSignals,
} from "@/providers/simpro/executive-context";

export { enrichOperationalGraph } from "@/providers/simpro/relationships";

export {
  SIMPRO_SECURITY_CONTROLS,
  SIMPRO_LEAST_PRIVILEGE_SCOPES,
  createSimproSecurityContext,
  assertSimproTenantIsolation,
  assertSimproLeastPrivilege,
  assertNoPlaintextSimproCredentials,
  recordSimproAudit,
  rotateSimproSecret,
} from "@/providers/simpro/security";

export {
  SIMPRO_SERVICES,
  createDefaultSimproConfiguration,
  markSimproConnected,
  markSimproDisconnected,
} from "@/providers/simpro/configuration";

export {
  createSimproLiveSyncEngine,
  createSimproCheckpointStore,
} from "@/providers/simpro/sync";

export { createSimproWebhookStore } from "@/providers/simpro/webhooks";

export {
  createSimproConnectionRegistry,
  getSimproConnectionRegistry,
  resetSimproConnectionRegistry,
} from "@/providers/simpro/connection";
export type { SimproAdminStatus } from "@/providers/simpro/connection";

export { createSimproMonitor } from "@/providers/simpro/monitoring";

export {
  computeFieldProductivity,
  computeServicePerformance,
  computeOperationalOpportunities,
} from "@/providers/simpro/analytics";

export { syncTimesheets } from "@/providers/simpro/timesheets";
