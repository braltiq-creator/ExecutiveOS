import { completeActivationStep } from "@/growth/activation/store";
import { recordGrowthTelemetry } from "@/growth/telemetry";

export type GrowthProviderId = "microsoft365" | "simpro" | "salesforce";

const connections = new Map<string, Set<GrowthProviderId>>();

export function resetProviderSetup(): void {
  connections.clear();
}

export function markProviderConnected(input: {
  organizationId: string;
  providerId: GrowthProviderId;
}): GrowthProviderId[] {
  const set = connections.get(input.organizationId) ?? new Set();
  set.add(input.providerId);
  connections.set(input.organizationId, set);

  if (input.providerId === "microsoft365") {
    completeActivationStep({
      organizationId: input.organizationId,
      stepId: "microsoft_connected",
      detail: "Microsoft 365 connected",
    });
  }
  if (input.providerId === "simpro" || input.providerId === "salesforce") {
    completeActivationStep({
      organizationId: input.organizationId,
      stepId: "provider_connected",
      detail: `${input.providerId} connected`,
    });
  }

  recordGrowthTelemetry({
    organizationId: input.organizationId,
    name: "provider_connected",
    properties: { providerId: input.providerId },
  });

  return [...set];
}

export function listConnectedProviders(
  organizationId: string,
): GrowthProviderId[] {
  return [...(connections.get(organizationId) ?? [])];
}

export function hasMinimumProviders(
  organizationId: string,
  profileId: "operations_executive" | "commercial_executive",
): boolean {
  const connected = listConnectedProviders(organizationId);
  const hasM365 = connected.includes("microsoft365");
  const hasSecondary =
    profileId === "operations_executive"
      ? connected.includes("simpro")
      : connected.includes("salesforce");
  return hasM365 && hasSecondary;
}
