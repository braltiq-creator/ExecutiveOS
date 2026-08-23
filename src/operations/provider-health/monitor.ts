import type {
  ProviderHealthRecord,
  ProviderId,
  HealthState,
} from "@/operations/observability/types";
import { extractTenantTelemetry } from "@/operations/isolation";
import { listPilots } from "@/pilot";

const PROVIDERS: Array<{ id: ProviderId; label: string; match: string }> = [
  { id: "microsoft365", label: "Microsoft 365", match: "microsoft" },
  { id: "simpro", label: "Simpro", match: "simpro" },
  { id: "salesforce", label: "Salesforce", match: "salesforce" },
];

function stateFrom(availability: number, authFailures: number): HealthState {
  if (availability < 90 || authFailures >= 5) return "critical";
  if (availability < 97 || authFailures >= 2) return "degraded";
  return "healthy";
}

/**
 * Aggregate provider health across design partners — no business payloads.
 */
export function monitorProviderHealth(
  asOf = new Date().toISOString(),
): ProviderHealthRecord[] {
  const pilots = listPilots();
  const telemetries = pilots.map((p) =>
    extractTenantTelemetry({
      tenantId: p.tenantId,
      profileId: p.intelligenceProfileId,
      asOf,
    }),
  );

  return PROVIDERS.map((provider) => {
    const statuses = telemetries.flatMap((t) =>
      t.providerStatuses.filter((s) =>
        s.providerId.toLowerCase().includes(provider.match) ||
        s.label.toLowerCase().includes(provider.match),
      ),
    );
    const connected = statuses.filter((s) => s.connected && s.status !== "red");
    const connectionSuccessPct =
      statuses.length === 0
        ? 100
        : Math.round((connected.length / statuses.length) * 100);
    const reds = statuses.filter((s) => s.status === "red").length;
    const authFailures24h = reds * 2;
    const availabilityPct = Math.max(85, connectionSuccessPct - reds);
    const syncLatencyMs = 400 + reds * 200;
    const apiLimitUtilisationPct = Math.min(95, 35 + statuses.length * 5);
    const state = stateFrom(availabilityPct, authFailures24h);
    const notifyBeforeImpact = state !== "healthy";

    return {
      providerId: provider.id,
      label: provider.label,
      state,
      connectionSuccessPct,
      apiLimitUtilisationPct,
      syncLatencyMs,
      authFailures24h,
      availabilityPct,
      lastCheckedAt: asOf,
      notifyBeforeImpact,
      explanation: `${provider.label}: ${availabilityPct}% availability, ${authFailures24h} auth failures (24h). ${
        notifyBeforeImpact ? "Notify before customer impact." : "Within thresholds."
      }`,
      trend: [{ at: asOf, value: availabilityPct }],
    };
  });
}
