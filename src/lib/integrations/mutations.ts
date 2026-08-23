import { createClient } from "@/lib/supabase/server";
import type {
  IntegrationEventType,
  IntegrationHealthStatus,
  IntegrationStatus,
  IntegrationSyncJobRecord,
  ProviderId,
  SyncJobStatus,
  SyncTriggerType,
} from "@/lib/integrations/types";

export async function upsertOrganizationIntegration(input: {
  organizationId: string;
  providerId: ProviderId;
  connectedBy?: string | null;
  status?: IntegrationStatus;
  healthStatus?: IntegrationHealthStatus;
  healthMessage?: string | null;
  config?: Record<string, unknown>;
  syncCursor?: Record<string, unknown>;
  lastSyncAt?: string | null;
  nextSyncAt?: string | null;
  lastErrorAt?: string | null;
  lastErrorMessage?: string | null;
}): Promise<string> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("organization_integrations")
    .upsert(
      {
        organization_id: input.organizationId,
        provider_id: input.providerId,
        connected_by: input.connectedBy ?? null,
        status: input.status ?? "disconnected",
        health_status: input.healthStatus ?? input.status ?? "disconnected",
        health_message: input.healthMessage ?? null,
        config_json: input.config ?? {},
        sync_cursor: input.syncCursor ?? {},
        last_sync_at: input.lastSyncAt ?? null,
        next_sync_at: input.nextSyncAt ?? null,
        last_error_at: input.lastErrorAt ?? null,
        last_error_message: input.lastErrorMessage ?? null,
        updated_at: now,
      },
      { onConflict: "organization_id,provider_id" },
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id as string;
}

export async function updateOrganizationIntegration(
  integrationId: string,
  updates: Partial<{
    status: IntegrationStatus;
    health_status: IntegrationHealthStatus;
    health_message: string | null;
    config_json: Record<string, unknown>;
    sync_cursor: Record<string, unknown>;
    last_sync_at: string | null;
    next_sync_at: string | null;
    last_error_at: string | null;
    last_error_message: string | null;
    connected_by: string | null;
  }>,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_integrations")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", integrationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteOrganizationIntegration(
  integrationId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_integrations")
    .delete()
    .eq("id", integrationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function insertSyncJob(input: {
  integrationId: string;
  triggerType: SyncTriggerType;
  status?: SyncJobStatus;
  cursorBefore?: Record<string, unknown>;
}): Promise<IntegrationSyncJobRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("integration_sync_jobs")
    .insert({
      organization_integration_id: input.integrationId,
      trigger_type: input.triggerType,
      status: input.status ?? "pending",
      cursor_before: input.cursorBefore ?? {},
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as IntegrationSyncJobRecord;
}

export async function updateSyncJob(
  jobId: string,
  updates: Partial<{
    status: SyncJobStatus;
    started_at: string | null;
    completed_at: string | null;
    records_processed: number;
    error_message: string | null;
    retry_count: number;
    cursor_after: Record<string, unknown>;
  }>,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("integration_sync_jobs")
    .update(updates)
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function insertIntegrationEvent(input: {
  integrationId: string;
  eventType: IntegrationEventType;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("integration_events").insert({
    organization_integration_id: input.integrationId,
    event_type: input.eventType,
    payload_json: input.payload ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertOAuthTokens(input: {
  integrationId: string;
  accessTokenEncrypted: string;
  refreshTokenEncrypted?: string | null;
  tokenType?: string;
  expiresAt?: string | null;
  scopes?: string[];
}): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("oauth_tokens").upsert(
    {
      organization_integration_id: input.integrationId,
      access_token_encrypted: input.accessTokenEncrypted,
      refresh_token_encrypted: input.refreshTokenEncrypted ?? null,
      token_type: input.tokenType ?? "Bearer",
      expires_at: input.expiresAt ?? null,
      scopes: input.scopes ?? [],
      updated_at: now,
    },
    { onConflict: "organization_integration_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteOAuthTokens(integrationId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("oauth_tokens")
    .delete()
    .eq("organization_integration_id", integrationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function insertOAuthState(input: {
  stateToken: string;
  organizationId: string;
  providerId: ProviderId;
  userId: string;
  redirectPath?: string;
  expiresAt: string;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("integration_oauth_states").insert({
    state_token: input.stateToken,
    organization_id: input.organizationId,
    provider_id: input.providerId,
    user_id: input.userId,
    redirect_path: input.redirectPath ?? "/settings/integrations",
    expires_at: input.expiresAt,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function consumeOAuthState(stateToken: string): Promise<{
  organization_id: string;
  provider_id: ProviderId;
  user_id: string;
  redirect_path: string;
} | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("integration_oauth_states")
    .select("organization_id, provider_id, user_id, redirect_path, expires_at")
    .eq("state_token", stateToken)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.expires_at < now) {
    return null;
  }

  const { error: deleteError } = await supabase
    .from("integration_oauth_states")
    .delete()
    .eq("state_token", stateToken);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return {
    organization_id: data.organization_id,
    provider_id: data.provider_id as ProviderId,
    user_id: data.user_id,
    redirect_path: data.redirect_path,
  };
}
