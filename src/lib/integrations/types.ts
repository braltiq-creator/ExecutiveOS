export const INTEGRATION_CATEGORIES = [
  "productivity",
  "calendar",
  "email",
  "communication",
  "crm",
  "project",
  "documentation",
  "development",
  "storage",
] as const;

export const INTEGRATION_VENDORS = [
  "microsoft",
  "google",
  "slack",
  "salesforce",
  "hubspot",
  "atlassian",
  "notion",
  "github",
  "asana",
  "monday",
  "executiveos",
] as const;

export const INTEGRATION_STATUSES = [
  "connected",
  "disconnected",
  "error",
  "syncing",
] as const;

export const INTEGRATION_HEALTH_STATUSES = [
  "connected",
  "disconnected",
  "error",
  "syncing",
] as const;

export const SYNC_TRIGGER_TYPES = [
  "manual",
  "scheduled",
  "webhook",
  "incremental",
] as const;

export const SYNC_JOB_STATUSES = [
  "pending",
  "running",
  "completed",
  "failed",
  "retrying",
] as const;

export const INTEGRATION_EVENT_TYPES = [
  "connected",
  "disconnected",
  "sync_started",
  "sync_completed",
  "sync_failed",
  "token_refreshed",
  "webhook_received",
  "error",
] as const;

export const CONTEXT_DOMAINS = [
  "calendar",
  "email",
  "crm",
  "meetings",
  "tasks",
  "documents",
  "knowledgeGraph",
  "communication",
] as const;

export const PROVIDER_IDS = [
  "microsoft_365",
  "google_workspace",
  "google_calendar",
  "outlook_calendar",
  "microsoft_teams",
  "slack",
  "salesforce",
  "hubspot",
  "jira",
  "confluence",
  "sharepoint",
  "notion",
  "github",
  "asana",
  "monday",
] as const;

export type IntegrationCategory = (typeof INTEGRATION_CATEGORIES)[number];
export type IntegrationVendor = (typeof INTEGRATION_VENDORS)[number];
export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number];
export type IntegrationHealthStatus = (typeof INTEGRATION_HEALTH_STATUSES)[number];
export type SyncTriggerType = (typeof SYNC_TRIGGER_TYPES)[number];
export type SyncJobStatus = (typeof SYNC_JOB_STATUSES)[number];
export type IntegrationEventType = (typeof INTEGRATION_EVENT_TYPES)[number];
export type ContextDomain = (typeof CONTEXT_DOMAINS)[number];
export type ProviderId = (typeof PROVIDER_IDS)[number];

export type IntegrationCapabilities = {
  sync?: boolean;
  webhooks?: boolean;
  incremental?: boolean;
};

export type IntegrationProviderRecord = {
  id: ProviderId;
  name: string;
  description: string;
  category: IntegrationCategory;
  vendor: IntegrationVendor;
  auth_type: "oauth2" | "api_key" | "webhook" | "none";
  context_domains: string[];
  capabilities_json: IntegrationCapabilities;
  display_order: number;
  is_available: boolean;
  created_at: string;
};

export type OrganizationIntegrationRecord = {
  id: string;
  organization_id: string;
  provider_id: ProviderId;
  status: IntegrationStatus;
  connected_by: string | null;
  config_json: Record<string, unknown>;
  sync_cursor: Record<string, unknown>;
  health_status: IntegrationHealthStatus;
  health_message: string | null;
  last_sync_at: string | null;
  next_sync_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type IntegrationSyncJobRecord = {
  id: string;
  organization_integration_id: string;
  trigger_type: SyncTriggerType;
  status: SyncJobStatus;
  started_at: string | null;
  completed_at: string | null;
  records_processed: number;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  cursor_before: Record<string, unknown>;
  cursor_after: Record<string, unknown>;
  created_at: string;
};

export type IntegrationEventRecord = {
  id: string;
  organization_integration_id: string;
  event_type: IntegrationEventType;
  payload_json: Record<string, unknown>;
  created_at: string;
};

export type OAuthTokenRecord = {
  id: string;
  organization_integration_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_type: string;
  expires_at: string | null;
  scopes: string[];
  created_at: string;
  updated_at: string;
};

export type IntegrationView = {
  provider: IntegrationProviderRecord;
  integration: OrganizationIntegrationRecord | null;
  health: IntegrationHealthSnapshot;
  recentSyncJobs: IntegrationSyncJobRecord[];
};

export type IntegrationHealthSnapshot = {
  status: IntegrationHealthStatus;
  message: string | null;
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  isConnected: boolean;
  isSyncing: boolean;
  hasError: boolean;
};

export type IntegrationsPageData = {
  integrations: IntegrationView[];
  canManage: boolean;
  hasIntegrationsFeature: boolean;
};

export type ConnectIntegrationInput = {
  providerId: ProviderId;
};

export type SyncIntegrationInput = {
  integrationId: string;
  triggerType?: SyncTriggerType;
};

export type DisconnectIntegrationInput = {
  integrationId: string;
};

export type IntegrationOAuthStateRecord = {
  id: string;
  state_token: string;
  organization_id: string;
  provider_id: ProviderId;
  user_id: string;
  redirect_path: string;
  expires_at: string;
  created_at: string;
};

export type DecryptedOAuthTokens = {
  accessToken: string;
  refreshToken: string | null;
  tokenType: string;
  expiresAt: string | null;
  scopes: string[];
};

export class IntegrationError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "IntegrationError";
    this.code = code;
  }
}

export function formatIntegrationStatus(status: IntegrationStatus): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "disconnected":
      return "Disconnected";
    case "error":
      return "Error";
    case "syncing":
      return "Syncing";
    default:
      return status;
  }
}

export function formatHealthStatus(status: IntegrationHealthStatus): string {
  return formatIntegrationStatus(status);
}

export function formatRelativeTime(isoDate: string | null): string {
  if (!isoDate) {
    return "Never";
  }

  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function buildHealthSnapshot(
  integration: OrganizationIntegrationRecord | null,
): IntegrationHealthSnapshot {
  if (!integration) {
    return {
      status: "disconnected",
      message: null,
      lastSyncAt: null,
      nextSyncAt: null,
      isConnected: false,
      isSyncing: false,
      hasError: false,
    };
  }

  return {
    status: integration.health_status,
    message: integration.health_message,
    lastSyncAt: integration.last_sync_at,
    nextSyncAt: integration.next_sync_at,
    isConnected: integration.status === "connected",
    isSyncing: integration.status === "syncing",
    hasError: integration.status === "error" || integration.health_status === "error",
  };
}
