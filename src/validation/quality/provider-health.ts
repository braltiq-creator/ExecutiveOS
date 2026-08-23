/**
 * Context provider health — Microsoft 365, Simpro, Salesforce, and future providers.
 */

import type { ContextProviderHealth, ProviderHealthCard } from "@/validation/types";
import { getM365ConnectionRegistry } from "@/providers/microsoft365";
import { getSimproConnectionRegistry } from "@/providers/simpro";
import { getSalesforceConnectionRegistry } from "@/providers/salesforce";

export type ProviderHealthAdapter = {
  providerId: string;
  label: string;
  assess(tenantId: string, asOf: string): ProviderHealthCard;
};

const builtInAdapters: ProviderHealthAdapter[] = [
  {
    providerId: "microsoft365",
    label: "Microsoft 365",
    assess(tenantId, asOf) {
      const status = getM365ConnectionRegistry().adminStatus(tenantId);
      const connected = status?.tenantStatus === "connected";
      const events =
        (status?.dataQuality.commitments ?? 0) +
        (status?.dataQuality.signals ?? 0) +
        (status?.dataQuality.documents ?? 0);
      const freshness =
        status?.lastSynchronisation == null
          ? null
          : Math.max(
              0,
              Math.round(
                (new Date(asOf).getTime() -
                  new Date(status.lastSynchronisation).getTime()) /
                  3_600_000,
              ),
            );
      return {
        providerId: "microsoft365",
        label: "Microsoft 365",
        connected,
        coveragePct: connected
          ? Math.min(100, 45 + events * 3)
          : 0,
        syncFreshnessHours: freshness,
        contextGenerated: Boolean(status?.dataQuality.briefPresent),
        businessEventsGenerated: events,
        explanation: connected
          ? `Connected — ${events} context signals, sync ${freshness ?? "—"}h ago.`
          : "Not connected — collaboration context unavailable.",
        status: !connected
          ? "disconnected"
          : status?.syncHealth === "failed"
            ? "degraded"
            : "healthy",
      };
    },
  },
  {
    providerId: "simpro",
    label: "Simpro",
    assess(tenantId, asOf) {
      const status = getSimproConnectionRegistry().adminStatus(tenantId);
      const connected = status?.tenantStatus === "connected";
      const events =
        (status?.dataQuality.openJobs ?? 0) +
        (status?.dataQuality.signals ?? 0) +
        (status?.dataQuality.recommendations ?? 0);
      const freshness =
        status?.lastSynchronisation == null
          ? null
          : Math.max(
              0,
              Math.round(
                (new Date(asOf).getTime() -
                  new Date(status.lastSynchronisation).getTime()) /
                  3_600_000,
              ),
            );
      return {
        providerId: "simpro",
        label: "Simpro",
        connected,
        coveragePct: connected
          ? Math.min(100, 40 + events * 4)
          : 0,
        syncFreshnessHours: freshness,
        contextGenerated: Boolean(status?.dataQuality.briefPresent),
        businessEventsGenerated: events,
        explanation: connected
          ? `Connected — ${events} operational signals, sync ${freshness ?? "—"}h ago.`
          : "Not connected — operational context unavailable.",
        status: !connected
          ? "disconnected"
          : status?.syncHealth === "failed"
            ? "degraded"
            : "healthy",
      };
    },
  },
  {
    providerId: "salesforce",
    label: "Salesforce",
    assess(tenantId, asOf) {
      const status = getSalesforceConnectionRegistry().adminStatus(tenantId);
      const connected = status?.tenantStatus === "connected";
      const events =
        (status?.dataQuality.openDeals ?? 0) +
        (status?.dataQuality.signals ?? 0) +
        (status?.dataQuality.recommendations ?? 0);
      const freshness =
        status?.lastSynchronisation == null
          ? null
          : Math.max(
              0,
              Math.round(
                (new Date(asOf).getTime() -
                  new Date(status.lastSynchronisation).getTime()) /
                  3_600_000,
              ),
            );
      return {
        providerId: "salesforce",
        label: "Salesforce",
        connected,
        coveragePct: connected
          ? Math.min(100, 40 + events * 4)
          : 0,
        syncFreshnessHours: freshness,
        contextGenerated: Boolean(status?.dataQuality.briefPresent),
        businessEventsGenerated: events,
        explanation: connected
          ? `Connected — ${events} commercial signals, sync ${freshness ?? "—"}h ago.`
          : "Not connected — commercial context unavailable.",
        status: !connected
          ? "disconnected"
          : status?.syncHealth === "failed"
            ? "degraded"
            : "healthy",
      };
    },
  },
];

const extraAdapters: ProviderHealthAdapter[] = [];

/** Future providers register here and automatically appear. */
export function registerProviderHealthAdapter(
  adapter: ProviderHealthAdapter,
): void {
  if (!extraAdapters.some((a) => a.providerId === adapter.providerId)) {
    extraAdapters.push(adapter);
  }
}

export function assessContextProviderHealth(input: {
  tenantId: string;
  asOf: string;
}): ContextProviderHealth {
  const adapters = [...builtInAdapters, ...extraAdapters];
  return {
    tenantId: input.tenantId,
    asOf: input.asOf,
    providers: adapters.map((a) => a.assess(input.tenantId, input.asOf)),
  };
}
