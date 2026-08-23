/**
 * Connector configuration — admin-controlled Microsoft 365 connection.
 */

export const M365_SERVICES = [
  "calendar",
  "mail",
  "teams",
  "sharepoint",
  "planner",
  "contacts",
  "presence",
  "onedrive",
] as const;

export type M365ServiceId = (typeof M365_SERVICES)[number];

export type SyncFrequency =
  | "realtime"
  | "every_5_minutes"
  | "every_15_minutes"
  | "hourly"
  | "daily";

export type M365ConnectorConfiguration = {
  executiveosTenantId: string;
  microsoftTenantId: string | null;
  displayName: string;
  connected: boolean;
  consentedScopes: string[];
  enabledServices: M365ServiceId[];
  organisationalScope: "user" | "executive_team" | "organisation";
  syncFrequency: SyncFrequency;
  webhooksEnabled: boolean;
  connectedAt: string | null;
  connectedByUserId: string | null;
};

export function createDefaultConnectorConfiguration(
  executiveosTenantId: string,
): M365ConnectorConfiguration {
  return {
    executiveosTenantId,
    microsoftTenantId: null,
    displayName: "Microsoft 365",
    connected: false,
    consentedScopes: [],
    enabledServices: [
      "calendar",
      "mail",
      "teams",
      "sharepoint",
      "planner",
      "contacts",
      "presence",
      "onedrive",
    ],
    organisationalScope: "executive_team",
    syncFrequency: "every_15_minutes",
    webhooksEnabled: true,
    connectedAt: null,
    connectedByUserId: null,
  };
}

export function markConnected(
  config: M365ConnectorConfiguration,
  input: {
    microsoftTenantId: string;
    scopes: string[];
    userId: string;
    asOf: string;
  },
): M365ConnectorConfiguration {
  return {
    ...config,
    connected: true,
    microsoftTenantId: input.microsoftTenantId,
    consentedScopes: input.scopes,
    connectedAt: input.asOf,
    connectedByUserId: input.userId,
  };
}

export function markDisconnected(
  config: M365ConnectorConfiguration,
): M365ConnectorConfiguration {
  return {
    ...config,
    connected: false,
    microsoftTenantId: null,
    consentedScopes: [],
    connectedAt: null,
    connectedByUserId: null,
  };
}

export function updateEnabledServices(
  config: M365ConnectorConfiguration,
  services: M365ServiceId[],
): M365ConnectorConfiguration {
  return { ...config, enabledServices: [...services] };
}
