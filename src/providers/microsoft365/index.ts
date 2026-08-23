/**
 * Microsoft 365 Executive Context Provider
 *
 * Transforms Microsoft 365 into portable executive context.
 * Vendor objects never escape this package.
 */

export {
  createMicrosoftGraphClient,
  createProductionGraphClient,
  createMockGraphHttpTransport,
} from "@/providers/microsoft365/graph";
export type {
  GraphClient,
  GraphClientOptions,
  ProductionGraphClient,
  GraphTelemetryEvent,
} from "@/providers/microsoft365/graph";

export {
  syncMicrosoft365ExecutiveContext,
  buildExecutiveContextBriefFromMock,
} from "@/providers/microsoft365/provider";
export type {
  Microsoft365ProviderOptions,
  Microsoft365ProviderResult,
} from "@/providers/microsoft365/provider";

export {
  applyMicrosoft365ExecutiveContext,
  applyMicrosoft365ExecutiveContextAsync,
} from "@/providers/microsoft365/apply";
export type { ApplyMicrosoft365Options } from "@/providers/microsoft365/apply";

export { toExecutiveContextView } from "@/providers/microsoft365/to-view";

export type * from "@/providers/microsoft365/executive-context/types";
export {
  EXECUTIVE_SIGNAL_IDS,
  deriveExecutiveSignals,
  boardReadinessFromSignals,
} from "@/providers/microsoft365/executive-context";

export { enrichRelationshipGraph } from "@/providers/microsoft365/relationships";

export {
  M365_SECURITY_CONTROLS,
  LEAST_PRIVILEGE_SCOPES,
  createSecurityContext,
  assertTenantIsolation,
  assertLeastPrivilege,
  assertNoPlaintextCredentials,
  recordAudit,
  rotateSecret,
} from "@/providers/microsoft365/security";

export {
  PRODUCTION_GRAPH_SCOPES,
  createPkcePair,
  buildAuthorizationRequest,
  exchangeAuthorizationCode,
  refreshAccessToken,
  validateAccessToken,
  createAuthSession,
  logoutSession,
  createTokenVault,
  createMockTokenTransport,
  discoverTenantFromIss,
} from "@/providers/microsoft365/auth";
export type {
  EntraAppRegistration,
  TokenSet,
  EncryptedTokenSet,
  AuthSession,
} from "@/providers/microsoft365/auth";

export {
  createDefaultConnectorConfiguration,
  markConnected,
  markDisconnected,
  updateEnabledServices,
  M365_SERVICES,
} from "@/providers/microsoft365/configuration";
export type {
  M365ConnectorConfiguration,
  M365ServiceId,
  SyncFrequency,
} from "@/providers/microsoft365/configuration";

export {
  createLiveSyncEngine,
  createCheckpointStore,
} from "@/providers/microsoft365/sync";
export type { SyncMode, SyncRunResult } from "@/providers/microsoft365/sync";

export {
  createDeltaState,
  applyDeltaPage,
  simulateLargeTenantDelta,
} from "@/providers/microsoft365/delta";

export { createWebhookStore } from "@/providers/microsoft365/webhooks";

export {
  createM365ConnectionRegistry,
  getM365ConnectionRegistry,
  resetM365ConnectionRegistry,
} from "@/providers/microsoft365/connection";
export type { M365AdminStatus, M365ConnectionRegistry } from "@/providers/microsoft365/connection";

export { createM365Monitor } from "@/providers/microsoft365/monitoring";

export { syncFilesContext } from "@/providers/microsoft365/files";
