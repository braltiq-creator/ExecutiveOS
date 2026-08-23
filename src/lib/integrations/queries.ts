import { createClient } from "@/lib/supabase/server";
import type {
  IntegrationEventRecord,
  IntegrationProviderRecord,
  IntegrationSyncJobRecord,
  OAuthTokenRecord,
  OrganizationIntegrationRecord,
  ProviderId,
} from "@/lib/integrations/types";

export async function fetchIntegrationProviders(): Promise<
  IntegrationProviderRecord[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("integration_providers")
    .select("*")
    .eq("is_available", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as IntegrationProviderRecord[];
}

export async function fetchIntegrationProviderById(
  providerId: ProviderId,
): Promise<IntegrationProviderRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("integration_providers")
    .select("*")
    .eq("id", providerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as IntegrationProviderRecord | null) ?? null;
}

export async function fetchOrganizationIntegrations(
  organizationId: string,
): Promise<OrganizationIntegrationRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_integrations")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as OrganizationIntegrationRecord[];
}

export async function fetchOrganizationIntegrationById(
  integrationId: string,
): Promise<OrganizationIntegrationRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_integrations")
    .select("*")
    .eq("id", integrationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as OrganizationIntegrationRecord | null) ?? null;
}

export async function fetchOrganizationIntegrationByProvider(
  organizationId: string,
  providerId: ProviderId,
): Promise<OrganizationIntegrationRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_integrations")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("provider_id", providerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as OrganizationIntegrationRecord | null) ?? null;
}

export async function fetchRecentSyncJobs(
  integrationId: string,
  limit = 5,
): Promise<IntegrationSyncJobRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("integration_sync_jobs")
    .select("*")
    .eq("organization_integration_id", integrationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as IntegrationSyncJobRecord[];
}

export async function fetchIntegrationEvents(
  integrationId: string,
  limit = 20,
): Promise<IntegrationEventRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("integration_events")
    .select("*")
    .eq("organization_integration_id", integrationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as IntegrationEventRecord[];
}

export async function fetchOAuthTokens(
  integrationId: string,
): Promise<OAuthTokenRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("*")
    .eq("organization_integration_id", integrationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as OAuthTokenRecord | null) ?? null;
}

export async function fetchDueScheduledIntegrations(): Promise<
  OrganizationIntegrationRecord[]
> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("organization_integrations")
    .select("*")
    .eq("status", "connected")
    .not("next_sync_at", "is", null)
    .lte("next_sync_at", now);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as OrganizationIntegrationRecord[];
}

export async function fetchFailedRetryableSyncJobs(): Promise<
  IntegrationSyncJobRecord[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("integration_sync_jobs")
    .select("*")
    .eq("status", "failed")
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as IntegrationSyncJobRecord[]).filter(
    (job) => job.retry_count < job.max_retries,
  );
}

export async function fetchSyncJobById(
  jobId: string,
): Promise<IntegrationSyncJobRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("integration_sync_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as IntegrationSyncJobRecord | null) ?? null;
}
