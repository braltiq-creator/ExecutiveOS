import type { SalesforceTelemetryEvent } from "@/providers/salesforce/api";
import type { SalesforceAdminStatus } from "@/providers/salesforce/connection";

export type SalesforceMonitorEvent = {
  name:
    | "api_usage"
    | "rate_limit"
    | "latency"
    | "synchronisation"
    | "platform_event"
    | "change_data_capture"
    | "business_event_produced"
    | "executive_context_generated"
    | "authentication"
    | "connector_health";
  at: string;
  tenantId: string;
  detail: string;
  metrics?: Record<string, number>;
};

export type SalesforceMonitor = {
  record(event: SalesforceMonitorEvent): void;
  fromApiTelemetry(tenantId: string, events: SalesforceTelemetryEvent[]): void;
  fromAdminStatus(tenantId: string, status: SalesforceAdminStatus): void;
  list(tenantId?: string): SalesforceMonitorEvent[];
  summary(tenantId: string): {
    apiCalls: number;
    throttles: number;
    avgLatencyMs: number;
    syncEvents: number;
    contextGenerations: number;
    businessEvents: number;
    cdcEvents: number;
    platformEvents: number;
  };
};

export function createSalesforceMonitor(): SalesforceMonitor {
  const events: SalesforceMonitorEvent[] = [];
  return {
    record(event) {
      events.push(event);
    },
    fromApiTelemetry(tenantId, telemetry) {
      for (const t of telemetry) {
        events.push({
          name: t.throttled ? "rate_limit" : "api_usage",
          at: t.at,
          tenantId,
          detail: `${t.path} → ${t.status}`,
          metrics: {
            latencyMs: t.durationMs,
            retries: t.retries,
            status: t.status,
          },
        });
        events.push({
          name: "latency",
          at: t.at,
          tenantId,
          detail: t.path,
          metrics: { latencyMs: t.durationMs },
        });
      }
    },
    fromAdminStatus(tenantId, status) {
      events.push({
        name: "synchronisation",
        at: status.lastSynchronisation ?? new Date().toISOString(),
        tenantId,
        detail: `${status.tenantStatus}/${status.syncHealth}`,
      });
      events.push({
        name: "connector_health",
        at: status.lastSynchronisation ?? new Date().toISOString(),
        tenantId,
        detail: status.tenantStatus,
      });
      if (status.dataQuality.briefPresent) {
        events.push({
          name: "executive_context_generated",
          at: status.lastSynchronisation ?? new Date().toISOString(),
          tenantId,
          detail: "CommercialContextBrief generated",
          metrics: {
            openDeals: status.dataQuality.openDeals,
            signals: status.dataQuality.signals,
            recommendations: status.dataQuality.recommendations,
          },
        });
      }
      if (status.cdcStatus.lastCommitAt) {
        events.push({
          name: "change_data_capture",
          at: status.cdcStatus.lastCommitAt,
          tenantId,
          detail: `active=${status.cdcStatus.active} gaps=${status.cdcStatus.gaps}`,
        });
      }
      if (status.webhookStatus.lastDeliveryAt) {
        events.push({
          name: "platform_event",
          at: status.webhookStatus.lastDeliveryAt,
          tenantId,
          detail: `active=${status.webhookStatus.active}`,
        });
      }
    },
    list(tenantId) {
      return tenantId
        ? events.filter((e) => e.tenantId === tenantId)
        : [...events];
    },
    summary(tenantId) {
      const scoped = events.filter((e) => e.tenantId === tenantId);
      const latencies = scoped
        .filter((e) => e.name === "latency")
        .map((e) => e.metrics?.latencyMs ?? 0);
      return {
        apiCalls: scoped.filter((e) => e.name === "api_usage").length,
        throttles: scoped.filter((e) => e.name === "rate_limit").length,
        avgLatencyMs:
          latencies.length === 0
            ? 0
            : Math.round(
                latencies.reduce((a, b) => a + b, 0) / latencies.length,
              ),
        syncEvents: scoped.filter((e) => e.name === "synchronisation").length,
        contextGenerations: scoped.filter(
          (e) => e.name === "executive_context_generated",
        ).length,
        businessEvents: scoped.filter(
          (e) => e.name === "business_event_produced",
        ).length,
        cdcEvents: scoped.filter((e) => e.name === "change_data_capture").length,
        platformEvents: scoped.filter((e) => e.name === "platform_event")
          .length,
      };
    },
  };
}
