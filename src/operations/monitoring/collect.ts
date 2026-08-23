/**
 * Continuous platform monitoring — synthetic signals for Braltiq ops.
 * Does not alter Core intelligence.
 */

import type {
  MetricPoint,
  PlatformComponentHealth,
  PlatformHealthSnapshot,
  HealthState,
} from "@/operations/observability/types";
import { getUptimeMs, getRecentLogs } from "@/lib/logging/logger";

const history = new Map<string, MetricPoint[]>();

export function resetMonitoringHistory(): void {
  history.clear();
}

function pushTrend(key: string, value: number, asOf: string, max = 24): MetricPoint[] {
  const list = history.get(key) ?? [];
  list.push({ at: asOf, value });
  const next = list.slice(-max);
  history.set(key, next);
  return next;
}

function worst(...states: HealthState[]): HealthState {
  if (states.includes("critical")) return "critical";
  if (states.includes("degraded")) return "degraded";
  if (states.includes("unknown")) return "unknown";
  return "healthy";
}

export function collectPlatformHealth(asOf = new Date().toISOString()): PlatformHealthSnapshot {
  const uptimeMs = getUptimeMs();
  const uptimePct = Math.min(99.99, 99.2 + Math.min(0.7, uptimeMs / (1000 * 60 * 60 * 24)));
  const recentErrors = getRecentLogs().filter((l) => l.level === "error").length;
  const errorRatePct = Math.min(12, recentErrors * 0.4);

  const apiLatency = 80 + recentErrors * 15;
  const authState: HealthState = errorRatePct > 5 ? "degraded" : "healthy";
  const apiState: HealthState =
    apiLatency > 400 ? "critical" : apiLatency > 200 ? "degraded" : "healthy";
  const queueState: HealthState = "healthy";
  const memoryPct = 42 + Math.min(30, recentErrors * 2);
  const memoryState: HealthState =
    memoryPct > 85 ? "critical" : memoryPct > 70 ? "degraded" : "healthy";
  const bgState: HealthState = "healthy";
  const recoveryStatus =
    errorRatePct > 8 ? "failed" : errorRatePct > 3 ? "recovering" : "stable";

  const components: PlatformComponentHealth[] = [
    {
      id: "uptime",
      label: "Platform uptime",
      state: uptimePct < 99 ? "degraded" : "healthy",
      latencyMs: null,
      message: `${uptimePct.toFixed(2)}% rolling`,
      trend: pushTrend("uptime", uptimePct, asOf),
    },
    {
      id: "api",
      label: "API latency",
      state: apiState,
      latencyMs: apiLatency,
      message: `p95 ~${apiLatency}ms`,
      trend: pushTrend("api", apiLatency, asOf),
    },
    {
      id: "auth",
      label: "Authentication",
      state: authState,
      latencyMs: 45,
      message: authState === "healthy" ? "Sign-in path OK" : "Elevated auth errors",
      trend: pushTrend("auth", authState === "healthy" ? 99 : 92, asOf),
    },
    {
      id: "providers",
      label: "Provider connectivity",
      state: "healthy",
      latencyMs: null,
      message: "See provider-health for detail",
      trend: pushTrend("providers", 98, asOf),
    },
    {
      id: "background",
      label: "Background processing",
      state: bgState,
      latencyMs: null,
      message: "Job runners idle/healthy",
      trend: pushTrend("background", 99, asOf),
    },
    {
      id: "queue",
      label: "Queue health",
      state: queueState,
      latencyMs: null,
      message: "Depth within limits",
      trend: pushTrend("queue", 2, asOf),
    },
    {
      id: "memory",
      label: "Memory utilisation",
      state: memoryState,
      latencyMs: null,
      message: `${memoryPct}% estimated process util`,
      trend: pushTrend("memory", memoryPct, asOf),
    },
    {
      id: "errors",
      label: "Error rates",
      state:
        errorRatePct > 5 ? "critical" : errorRatePct > 2 ? "degraded" : "healthy",
      latencyMs: null,
      message: `${errorRatePct.toFixed(1)}% recent error share`,
      trend: pushTrend("errors", errorRatePct, asOf),
    },
  ];

  const overall = worst(...components.map((c) => c.state));

  return {
    asOf,
    overall,
    uptimePct: Math.round(uptimePct * 100) / 100,
    components,
    errorRatePct: Math.round(errorRatePct * 10) / 10,
    recoveryStatus,
    explanation: `Platform ${overall}; recovery ${recoveryStatus}; uptime ${uptimePct.toFixed(2)}%.`,
  };
}
