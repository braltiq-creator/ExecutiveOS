import { insertIntegrationEvent } from "@/lib/integrations/mutations";
import type { IntegrationEventType } from "@/lib/integrations/types";

export async function logIntegrationEvent(input: {
  integrationId: string;
  eventType: IntegrationEventType;
  payload?: Record<string, unknown>;
}): Promise<void> {
  await insertIntegrationEvent({
    integrationId: input.integrationId,
    eventType: input.eventType,
    payload: input.payload,
  });
}

export async function logIntegrationConnected(
  integrationId: string,
  providerId: string,
): Promise<void> {
  await logIntegrationEvent({
    integrationId,
    eventType: "connected",
    payload: { providerId },
  });
}

export async function logIntegrationDisconnected(
  integrationId: string,
  providerId: string,
): Promise<void> {
  await logIntegrationEvent({
    integrationId,
    eventType: "disconnected",
    payload: { providerId },
  });
}

export async function logSyncStarted(
  integrationId: string,
  jobId: string,
  triggerType: string,
): Promise<void> {
  await logIntegrationEvent({
    integrationId,
    eventType: "sync_started",
    payload: { jobId, triggerType },
  });
}

export async function logSyncCompleted(
  integrationId: string,
  jobId: string,
  recordsProcessed: number,
): Promise<void> {
  await logIntegrationEvent({
    integrationId,
    eventType: "sync_completed",
    payload: { jobId, recordsProcessed },
  });
}

export async function logSyncFailed(
  integrationId: string,
  jobId: string,
  errorMessage: string,
): Promise<void> {
  await logIntegrationEvent({
    integrationId,
    eventType: "sync_failed",
    payload: { jobId, errorMessage },
  });
}

export async function logTokenRefreshed(
  integrationId: string,
  providerId: string,
): Promise<void> {
  await logIntegrationEvent({
    integrationId,
    eventType: "token_refreshed",
    payload: { providerId },
  });
}

export async function logWebhookReceived(
  integrationId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await logIntegrationEvent({
    integrationId,
    eventType: "webhook_received",
    payload,
  });
}

export async function logIntegrationError(
  integrationId: string,
  message: string,
  details?: Record<string, unknown>,
): Promise<void> {
  await logIntegrationEvent({
    integrationId,
    eventType: "error",
    payload: { message, ...details },
  });
}
