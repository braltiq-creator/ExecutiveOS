export const SALESFORCE_SERVICES = [
  "accounts",
  "opportunities",
  "contacts",
  "activities",
  "cases",
  "campaigns",
  "products",
  "quotes",
  "forecasts",
] as const;

export type SalesforceServiceId = (typeof SALESFORCE_SERVICES)[number];

export type SalesforceSyncFrequency =
  | "realtime"
  | "every_5_minutes"
  | "every_15_minutes"
  | "hourly"
  | "daily";

export type SalesforceConnectorConfiguration = {
  executiveosTenantId: string;
  orgId: string | null;
  instanceUrl: string | null;
  displayName: string;
  connected: boolean;
  authStrategy: "oauth2" | null;
  consentedScopes: string[];
  enabledServices: SalesforceServiceId[];
  syncFrequency: SalesforceSyncFrequency;
  cdcEnabled: boolean;
  platformEventsEnabled: boolean;
  webhooksEnabled: boolean;
  connectedAt: string | null;
  connectedByUserId: string | null;
};

export function createDefaultSalesforceConfiguration(
  executiveosTenantId: string,
): SalesforceConnectorConfiguration {
  return {
    executiveosTenantId,
    orgId: null,
    instanceUrl: null,
    displayName: "Commercial Intelligence",
    connected: false,
    authStrategy: null,
    consentedScopes: [],
    enabledServices: [...SALESFORCE_SERVICES],
    syncFrequency: "every_15_minutes",
    cdcEnabled: true,
    platformEventsEnabled: true,
    webhooksEnabled: true,
    connectedAt: null,
    connectedByUserId: null,
  };
}

export function markSalesforceConnected(
  config: SalesforceConnectorConfiguration,
  input: {
    orgId: string;
    instanceUrl: string;
    scopes: string[];
    userId: string;
    asOf: string;
  },
): SalesforceConnectorConfiguration {
  return {
    ...config,
    connected: true,
    orgId: input.orgId,
    instanceUrl: input.instanceUrl,
    authStrategy: "oauth2",
    consentedScopes: input.scopes,
    connectedAt: input.asOf,
    connectedByUserId: input.userId,
  };
}

export function markSalesforceDisconnected(
  config: SalesforceConnectorConfiguration,
): SalesforceConnectorConfiguration {
  return {
    ...config,
    connected: false,
    orgId: null,
    instanceUrl: null,
    authStrategy: null,
    consentedScopes: [],
    connectedAt: null,
    connectedByUserId: null,
  };
}
