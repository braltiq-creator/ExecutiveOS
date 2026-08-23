/**
 * Connector observability — auth, API usage, rate limits, sync, webhooks, context.
 */

import type { GraphTelemetryEvent } from "@/providers/microsoft365/graph/production-client";
import type { M365AdminStatus } from "@/providers/microsoft365/connection";

export type M365MonitorEvent = {
  name:
    | "authentication"
    | "api_usage"
    | "rate_limit"
    | "latency"
    | "webhook_delivery"
    | "delta_sync"
    | "connector_health"
    | "context_generation"
    | "business_event_produced";
  at: string;
  tenantId: string;
  detail: string;
  metrics?: Record<string, number>;
};

export type M365Monitor = {
  record(event: M365MonitorEvent): void;
  fromGraphTelemetry(
    tenantId: string,
    events: GraphTelemetryEvent[],
  ): void;
  fromAdminStatus(tenantId: string, status: M365AdminStatus): void;
  list(tenantId?: string): M365MonitorEvent[];
  summary(tenantId: string): {
    authEvents: number;
    apiCalls: number;
    throttles: number;
    avgLatencyMs: number;
    contextGenerations: number;
    businessEvents: number;
  };
};

export function createM365Monitor(): M365Monitor {
  const events: M365MonitorEvent[] = [];

  return {
    record(event) {
      events.push(event);
    },
    fromGraphTelemetry(tenantId, telemetry) {
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
        if (t.durationMs > 0) {
          events.push({
            name: "latency",
            at: t.at,
            tenantId,
            detail: t.path,
            metrics: { latencyMs: t.durationMs },
          });
        }
      }
    },
    fromAdminStatus(tenantId, status) {
      events.push({
        name: "connector_health",
        at: status.lastSynchronisation ?? new Date().toISOString(),
        tenantId,
        detail: `${status.tenantStatus}/${status.syncHealth}`,
        metrics: {
          retryQueue: status.retryQueue,
          rateLimitRemaining: status.rateLimits.remaining ?? -1,
        },
      });
      if (status.webhookStatus.lastDeliveryAt) {
        events.push({
          name: "webhook_delivery",
          at: status.webhookStatus.lastDeliveryAt,
          tenantId,
          detail: `active=${status.webhookStatus.active}`,
        });
      }
      if (status.dataQuality.briefPresent) {
        events.push({
          name: "context_generation",
          at: status.lastSynchronisation ?? new Date().toISOString(),
          tenantId,
          detail: "ExecutiveContextBrief generated",
          metrics: {
            commitments: status.dataQuality.commitments,
            signals: status.dataQuality.signals,
            documents: status.dataQuality.documents,
          },
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
        authEvents: scoped.filter((e) => e.name === "authentication").length,
        apiCalls: scoped.filter((e) => e.name === "api_usage").length,
        throttles: scoped.filter((e) => e.name === "rate_limit").length,
        avgLatencyMs:
          latencies.length === 0
            ? 0
            : Math.round(
                latencies.reduce((a, b) => a + b, 0) / latencies.length,
              ),
        contextGenerations: scoped.filter(
          (e) => e.name === "context_generation",
        ).length,
        businessEvents: scoped.filter(
          (e) => e.name === "business_event_produced",
        ).length,
      };
    },
  };
}
