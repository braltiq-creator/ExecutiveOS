import type {
  IntegrationHealthSnapshot,
  IntegrationProviderRecord,
  OrganizationIntegrationRecord,
  ProviderId,
  SyncTriggerType,
} from "@/lib/integrations/types";
import type { DecryptedOAuthTokens } from "@/lib/integrations/types";

export type ProviderRuntimeContext = {
  integration: OrganizationIntegrationRecord;
  provider: IntegrationProviderRecord;
  tokens: DecryptedOAuthTokens | null;
};

export type ConnectResult = {
  authorizationUrl?: string;
  connected?: boolean;
};

export type RefreshResult = {
  tokens: DecryptedOAuthTokens;
};

export type SyncResult = {
  recordsProcessed: number;
  cursorAfter: Record<string, unknown>;
  contextPayload?: Record<string, unknown>;
};

export type HealthResult = IntegrationHealthSnapshot;

export interface IntegrationProvider {
  readonly id: ProviderId;
  connect(ctx: ProviderRuntimeContext): Promise<ConnectResult>;
  disconnect(ctx: ProviderRuntimeContext): Promise<void>;
  refresh(ctx: ProviderRuntimeContext): Promise<RefreshResult | null>;
  sync(
    ctx: ProviderRuntimeContext,
    options: { triggerType: SyncTriggerType; cursor: Record<string, unknown> },
  ): Promise<SyncResult>;
  health(ctx: ProviderRuntimeContext): Promise<HealthResult>;
}

export type OAuthProviderConfig = {
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
};

export abstract class BaseIntegrationProvider implements IntegrationProvider {
  abstract readonly id: ProviderId;
  protected abstract readonly oauth: OAuthProviderConfig;

  async connect(ctx: ProviderRuntimeContext): Promise<ConnectResult> {
    if (ctx.tokens) {
      return { connected: true };
    }

    return { connected: false };
  }

  async disconnect(_ctx: ProviderRuntimeContext): Promise<void> {
    return;
  }

  async refresh(_ctx: ProviderRuntimeContext): Promise<RefreshResult | null> {
    return null;
  }

  async sync(
    ctx: ProviderRuntimeContext,
    options: { triggerType: SyncTriggerType; cursor: Record<string, unknown> },
  ): Promise<SyncResult> {
    const previousCount =
      typeof options.cursor.recordsProcessed === "number"
        ? options.cursor.recordsProcessed
        : 0;
    const increment = options.triggerType === "incremental" ? 1 : 3;

    return {
      recordsProcessed: previousCount + increment,
      cursorAfter: {
        ...options.cursor,
        recordsProcessed: previousCount + increment,
        lastSyncedAt: new Date().toISOString(),
        providerId: ctx.provider.id,
      },
      contextPayload: buildDefaultContextPayload(ctx.provider, previousCount + increment),
    };
  }

  async health(ctx: ProviderRuntimeContext): Promise<HealthResult> {
    const isConnected = ctx.integration.status === "connected";

    return {
      status: ctx.integration.health_status,
      message: ctx.integration.health_message,
      lastSyncAt: ctx.integration.last_sync_at,
      nextSyncAt: ctx.integration.next_sync_at,
      isConnected,
      isSyncing: ctx.integration.status === "syncing",
      hasError: ctx.integration.status === "error",
    };
  }

  getOAuthConfig(): OAuthProviderConfig {
    return this.oauth;
  }
}

function buildDefaultContextPayload(
  provider: IntegrationProviderRecord,
  recordsProcessed: number,
): Record<string, unknown> {
  return {
    providerId: provider.id,
    domains: provider.context_domains,
    recordsProcessed,
    syncedAt: new Date().toISOString(),
  };
}

export class OAuthIntegrationProvider extends BaseIntegrationProvider {
  readonly id: ProviderId;
  protected readonly oauth: OAuthProviderConfig;

  constructor(id: ProviderId, oauth: OAuthProviderConfig) {
    super();
    this.id = id;
    this.oauth = oauth;
  }
}

export class CalendarIntegrationProvider extends OAuthIntegrationProvider {
  override async sync(
    ctx: ProviderRuntimeContext,
    options: { triggerType: SyncTriggerType; cursor: Record<string, unknown> },
  ): Promise<SyncResult> {
    const base = await super.sync(ctx, options);
    const existingEvents = Array.isArray(options.cursor.events)
      ? (options.cursor.events as Array<Record<string, unknown>>)
      : [];

    const newEvent = {
      id: `${ctx.provider.id}-${Date.now()}`,
      title: "Executive sync placeholder event",
      startsAt: new Date(Date.now() + 86_400_000).toISOString(),
      endsAt: new Date(Date.now() + 90_000_000).toISOString(),
      source: ctx.provider.name,
    };

    const events =
      options.triggerType === "incremental"
        ? [...existingEvents, newEvent]
        : [newEvent];

    return {
      ...base,
      cursorAfter: {
        ...base.cursorAfter,
        events,
      },
      contextPayload: {
        domain: "calendar",
        events,
      },
    };
  }
}

export class CrmIntegrationProvider extends OAuthIntegrationProvider {
  override async sync(
    ctx: ProviderRuntimeContext,
    options: { triggerType: SyncTriggerType; cursor: Record<string, unknown> },
  ): Promise<SyncResult> {
    const base = await super.sync(ctx, options);

    const records = [
      {
        id: `${ctx.provider.id}-pipeline`,
        name: "Executive pipeline snapshot",
        stage: "Negotiation",
        source: ctx.provider.name,
      },
    ];

    return {
      ...base,
      contextPayload: {
        domain: "crm",
        records,
      },
    };
  }
}

export class TasksIntegrationProvider extends OAuthIntegrationProvider {
  override async sync(
    ctx: ProviderRuntimeContext,
    options: { triggerType: SyncTriggerType; cursor: Record<string, unknown> },
  ): Promise<SyncResult> {
    const base = await super.sync(ctx, options);

    const tasks = [
      {
        id: `${ctx.provider.id}-task-1`,
        title: "Review integration rollout",
        status: "open",
        source: ctx.provider.name,
      },
    ];

    return {
      ...base,
      contextPayload: {
        domain: "tasks",
        tasks,
      },
    };
  }
}

export class DocumentsIntegrationProvider extends OAuthIntegrationProvider {
  override async sync(
    ctx: ProviderRuntimeContext,
    options: { triggerType: SyncTriggerType; cursor: Record<string, unknown> },
  ): Promise<SyncResult> {
    const base = await super.sync(ctx, options);

    const documents = [
      {
        id: `${ctx.provider.id}-doc-1`,
        title: "Executive operating brief",
        source: ctx.provider.name,
      },
    ];

    return {
      ...base,
      contextPayload: {
        domain: "documents",
        documents,
      },
    };
  }
}
