export const SIMPRO_SERVICES = [
  "jobs",
  "quotes",
  "customers",
  "sites",
  "assets",
  "technicians",
  "projects",
  "workorders",
  "purchase_orders",
  "invoices",
  "scheduling",
  "timesheets",
] as const;

export type SimproServiceId = (typeof SIMPRO_SERVICES)[number];

export type SimproSyncFrequency =
  | "realtime"
  | "every_5_minutes"
  | "every_15_minutes"
  | "hourly"
  | "daily";

export type SimproConnectorConfiguration = {
  executiveosTenantId: string;
  companyId: string | null;
  displayName: string;
  connected: boolean;
  authStrategy: "oauth2" | "api_key" | null;
  consentedScopes: string[];
  enabledServices: SimproServiceId[];
  syncFrequency: SimproSyncFrequency;
  webhooksEnabled: boolean;
  connectedAt: string | null;
  connectedByUserId: string | null;
};

export function createDefaultSimproConfiguration(
  executiveosTenantId: string,
): SimproConnectorConfiguration {
  return {
    executiveosTenantId,
    companyId: null,
    displayName: "Field Service Operations",
    connected: false,
    authStrategy: null,
    consentedScopes: [],
    enabledServices: [...SIMPRO_SERVICES],
    syncFrequency: "every_15_minutes",
    webhooksEnabled: true,
    connectedAt: null,
    connectedByUserId: null,
  };
}

export function markSimproConnected(
  config: SimproConnectorConfiguration,
  input: {
    companyId: string;
    authStrategy: "oauth2" | "api_key";
    scopes: string[];
    userId: string;
    asOf: string;
  },
): SimproConnectorConfiguration {
  return {
    ...config,
    connected: true,
    companyId: input.companyId,
    authStrategy: input.authStrategy,
    consentedScopes: input.scopes,
    connectedAt: input.asOf,
    connectedByUserId: input.userId,
  };
}

export function markSimproDisconnected(
  config: SimproConnectorConfiguration,
): SimproConnectorConfiguration {
  return {
    ...config,
    connected: false,
    companyId: null,
    authStrategy: null,
    consentedScopes: [],
    connectedAt: null,
    connectedByUserId: null,
  };
}
