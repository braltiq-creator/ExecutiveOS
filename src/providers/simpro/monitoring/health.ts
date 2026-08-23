import type { SimproTelemetryEvent } from "@/providers/simpro/api";
import type { SimproAdminStatus } from "@/providers/simpro/connection";

export type SimproMonitorEvent = {
  name:
    | "api_usage"
    | "rate_limit"
    | "latency"
    | "synchronisation"
    | "webhook_delivery"
    | "business_event_produced"
    | "executive_context_generated"
    | "authentication";
  at: string;
  tenantId: string;
  detail: string;
  metrics?: Record<string, number>;
};

export type SimproMonitor = {
  record(event: SimproMonitorEvent): void;
  fromApiTelemetry(tenantId: string, events: SimproTelemetryEvent[]): void;
  fromAdminStatus(tenantId: string, status: SimproAdminStatus): void;
  list(tenantId?: string): SimproMonitorEvent[];
  summary(tenantId: string): {
    apiCalls: number;
    throttles: number;
    avgLatencyMs: number;
    syncEvents: number;
    contextGenerations: number;
    businessEvents: number;
  };
};

export function createSimproMonitor(): SimproMonitor {
  const events: SimproMonitorEvent[] = [];
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
      if (status.dataQuality.briefPresent) {
        events.push({
          name: "executive_context_generated",
          at: status.lastSynchronisation ?? new Date().toISOString(),
          tenantId,
          detail: "OperationalContextBrief generated",
          metrics: {
            openJobs: status.dataQuality.openJobs,
            signals: status.dataQuality.signals,
            recommendations: status.dataQuality.recommendations,
          },
        });
      }
      if (status.webhookStatus.lastDeliveryAt) {
        events.push({
          name: "webhook_delivery",
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
      };
    },
  };
}
