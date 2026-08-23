/**
 * Salesforce / CRM Commercial Executive Context Provider
 *
 * Transforms commercial CRM activity into portable executive context.
 * Vendor objects never escape this package.
 */

export {
  createSalesforceApiClient,
  createMockSalesforceHttpTransport,
  createSalesforceRateLimitTransport,
} from "@/providers/salesforce/api";
export type {
  SalesforceApiClient,
  SalesforceTelemetryEvent,
} from "@/providers/salesforce/api";
export { simulateLargeCrmPortfolio } from "@/providers/salesforce/api/mapping";

export {
  SALESFORCE_OAUTH_SCOPES,
  createSalesforceTokenVault,
  validateSalesforceCredentials,
  createSalesforceAuthSession,
  logoutSalesforceSession,
  refreshSalesforceOAuth,
} from "@/providers/salesforce/auth";
export type {
  SalesforceOAuthCredentials,
  EncryptedSalesforceCredentials,
  SalesforceAuthSession,
} from "@/providers/salesforce/auth";

export {
  syncSalesforceExecutiveContext,
  buildCommercialContextBriefFromMock,
} from "@/providers/salesforce/provider";
export type {
  SalesforceProviderOptions,
  SalesforceProviderResult,
} from "@/providers/salesforce/provider";

export {
  applySalesforceExecutiveContext,
  applySalesforceExecutiveContextAsync,
} from "@/providers/salesforce/apply";

export { toCommercialContextView } from "@/providers/salesforce/to-view";

export type * from "@/providers/salesforce/executive-context/types";
export {
  COMMERCIAL_SIGNAL_IDS,
  deriveCommercialSignals,
  commercialHealthFromSignals,
} from "@/providers/salesforce/executive-context";

export { enrichCommercialGraph } from "@/providers/salesforce/relationships";

export {
  SALESFORCE_SECURITY_CONTROLS,
  SALESFORCE_LEAST_PRIVILEGE_SCOPES,
  createSalesforceSecurityContext,
  assertSalesforceTenantIsolation,
  assertSalesforceLeastPrivilege,
  assertNoPlaintextSalesforceCredentials,
  recordSalesforceAudit,
  rotateSalesforceSecret,
} from "@/providers/salesforce/security";

export {
  SALESFORCE_SERVICES,
  createDefaultSalesforceConfiguration,
  markSalesforceConnected,
  markSalesforceDisconnected,
} from "@/providers/salesforce/configuration";

export {
  createSalesforceLiveSyncEngine,
  createSalesforceCheckpointStore,
} from "@/providers/salesforce/sync";

export { createSalesforceWebhookStore } from "@/providers/salesforce/webhooks";
export { createSalesforceCdcStore } from "@/providers/salesforce/cdc";

export {
  createSalesforceConnectionRegistry,
  getSalesforceConnectionRegistry,
  resetSalesforceConnectionRegistry,
} from "@/providers/salesforce/connection";
export type { SalesforceAdminStatus } from "@/providers/salesforce/connection";

export { createSalesforceMonitor } from "@/providers/salesforce/monitoring";
