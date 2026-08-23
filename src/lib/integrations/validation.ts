import { PROVIDER_IDS, type ProviderId } from "@/lib/integrations/types";
import { IntegrationError } from "@/lib/integrations/types";

export function isProviderId(value: string): value is ProviderId {
  return (PROVIDER_IDS as readonly string[]).includes(value);
}

export function validateConnectInput(input: {
  providerId: string;
}): { providerId: ProviderId } {
  if (!isProviderId(input.providerId)) {
    throw new IntegrationError("Invalid integration provider.", "VALIDATION_ERROR");
  }

  return { providerId: input.providerId };
}

export function validateIntegrationId(integrationId: string): string {
  const trimmed = integrationId.trim();

  if (!trimmed) {
    throw new IntegrationError("Integration ID is required.", "VALIDATION_ERROR");
  }

  return trimmed;
}

export function validateSyncInput(input: {
  integrationId: string;
  triggerType?: string;
}): {
  integrationId: string;
  triggerType: "manual" | "scheduled" | "webhook" | "incremental";
} {
  const integrationId = validateIntegrationId(input.integrationId);

  if (
    input.triggerType &&
    !["manual", "scheduled", "webhook", "incremental"].includes(input.triggerType)
  ) {
    throw new IntegrationError("Invalid sync trigger type.", "VALIDATION_ERROR");
  }

  return {
    integrationId,
    triggerType: (input.triggerType ?? "manual") as
      | "manual"
      | "scheduled"
      | "webhook"
      | "incremental",
  };
}

export function validateDisconnectInput(input: {
  integrationId: string;
}): { integrationId: string } {
  return { integrationId: validateIntegrationId(input.integrationId) };
}
