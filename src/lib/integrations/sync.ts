import {
  logSyncCompleted,
  logSyncFailed,
  logSyncStarted,
  logWebhookReceived,
} from "@/lib/integrations/events";
import {
  insertSyncJob,
  updateOrganizationIntegration,
  updateSyncJob,
} from "@/lib/integrations/mutations";
import { getIntegrationProvider } from "@/lib/integrations/registry";
import { buildProviderRuntimeContext } from "@/lib/integrations/runtime";
import {
  fetchOrganizationIntegrationById,
  fetchRecentSyncJobs,
  fetchSyncJobById,
} from "@/lib/integrations/queries";
import type {
  IntegrationSyncJobRecord,
  OrganizationIntegrationRecord,
  SyncTriggerType,
} from "@/lib/integrations/types";
import { IntegrationError } from "@/lib/integrations/types";

const DEFAULT_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;
const DEFAULT_MAX_RETRIES = 3;

export function calculateNextSyncAt(from = new Date()): string {
  return new Date(from.getTime() + DEFAULT_SYNC_INTERVAL_MS).toISOString();
}

export async function runIntegrationSync(input: {
  integrationId: string;
  triggerType: SyncTriggerType;
}): Promise<IntegrationSyncJobRecord> {
  const integration = await fetchOrganizationIntegrationById(input.integrationId);

  if (!integration) {
    throw new IntegrationError("Integration not found.", "NOT_FOUND");
  }

  if (integration.status !== "connected" && input.triggerType !== "manual") {
    throw new IntegrationError(
      "Integration must be connected before syncing.",
      "NOT_CONNECTED",
    );
  }

  const job = await insertSyncJob({
    integrationId: integration.id,
    triggerType: input.triggerType,
    status: "running",
    cursorBefore: integration.sync_cursor,
  });

  await updateOrganizationIntegration(integration.id, {
    status: "syncing",
    health_status: "syncing",
    health_message: "Synchronization in progress.",
  });

  await logSyncStarted(integration.id, job.id, input.triggerType);

  try {
    const ctx = await buildProviderRuntimeContext(integration);
    const provider = getIntegrationProvider(integration.provider_id);
    const result = await provider.sync(ctx, {
      triggerType: input.triggerType,
      cursor: integration.sync_cursor,
    });

    const completedAt = new Date().toISOString();

    await updateSyncJob(job.id, {
      status: "completed",
      started_at: job.started_at ?? completedAt,
      completed_at: completedAt,
      records_processed: result.recordsProcessed,
      cursor_after: result.cursorAfter,
    });

    const configJson = {
      ...integration.config_json,
      lastContextPayload: result.contextPayload ?? {},
    };

    await updateOrganizationIntegration(integration.id, {
      status: "connected",
      health_status: "connected",
      health_message: null,
      sync_cursor: result.cursorAfter,
      config_json: configJson,
      last_sync_at: completedAt,
      next_sync_at: calculateNextSyncAt(new Date(completedAt)),
      last_error_at: null,
      last_error_message: null,
    });

    await logSyncCompleted(integration.id, job.id, result.recordsProcessed);

    const updatedJobs = await fetchRecentSyncJobs(integration.id, 1);
    return updatedJobs[0] ?? job;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Synchronization failed.";

    await updateSyncJob(job.id, {
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: message,
    });

    await updateOrganizationIntegration(integration.id, {
      status: "error",
      health_status: "error",
      health_message: message,
      last_error_at: new Date().toISOString(),
      last_error_message: message,
    });

    await logSyncFailed(integration.id, job.id, message);

    throw error;
  }
}

export async function retryFailedSyncJob(jobId: string): Promise<void> {
  const supabaseJob = await fetchSyncJobById(jobId);

  if (!supabaseJob) {
    throw new IntegrationError("Sync job not found.", "NOT_FOUND");
  }

  if (supabaseJob.retry_count >= supabaseJob.max_retries) {
    throw new IntegrationError("Maximum retry attempts reached.", "RETRY_EXHAUSTED");
  }

  await updateSyncJob(jobId, {
    status: "retrying",
    retry_count: supabaseJob.retry_count + 1,
    error_message: null,
  });

  await runIntegrationSync({
    integrationId: supabaseJob.organization_integration_id,
    triggerType: "incremental",
  });
}

export async function processIntegrationWebhook(input: {
  integrationId: string;
  payload: Record<string, unknown>;
}): Promise<IntegrationSyncJobRecord> {
  await logWebhookReceived(input.integrationId, input.payload);
  return runIntegrationSync({
    integrationId: input.integrationId,
    triggerType: "webhook",
  });
}

export async function runDueScheduledSyncs(): Promise<number> {
  const { fetchDueScheduledIntegrations } = await import(
    "@/lib/integrations/queries"
  );
  const dueIntegrations = await fetchDueScheduledIntegrations();
  let processed = 0;

  for (const integration of dueIntegrations) {
    try {
      await runIntegrationSync({
        integrationId: integration.id,
        triggerType: "scheduled",
      });
      processed += 1;
    } catch {
      // Continue processing remaining integrations.
    }
  }

  return processed;
}

export async function retryFailedSyncJobs(): Promise<number> {
  const { fetchFailedRetryableSyncJobs } = await import(
    "@/lib/integrations/queries"
  );
  const jobs = await fetchFailedRetryableSyncJobs();
  let retried = 0;

  for (const job of jobs) {
    if (job.retry_count >= DEFAULT_MAX_RETRIES) {
      continue;
    }

    try {
      await retryFailedSyncJob(job.id);
      retried += 1;
    } catch {
      // Continue retrying remaining jobs.
    }
  }

  return retried;
}

export async function getSyncHistory(
  integration: OrganizationIntegrationRecord,
  limit = 10,
): Promise<IntegrationSyncJobRecord[]> {
  return fetchRecentSyncJobs(integration.id, limit);
}
