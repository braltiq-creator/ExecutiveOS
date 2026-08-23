/**
 * Monitoring — aggregate connector metrics for the platform.
 */

import type { ConnectorHealthReport } from "@/connectivity/health";

export type ConnectivityMetrics = {
  asOf: string;
  connectorCount: number;
  healthy: number;
  degraded: number;
  errors: number;
  disconnected: number;
  totalEvents: number;
  totalErrors: number;
  totalRetries: number;
  averageLatencyMs: number | null;
  averageDataQuality: number;
};

export function aggregateConnectivityMetrics(
  reports: ConnectorHealthReport[],
  asOf = new Date().toISOString(),
): ConnectivityMetrics {
  const latencyValues = reports
    .map((r) => r.latencyMs)
    .filter((v): v is number => typeof v === "number");

  return {
    asOf,
    connectorCount: reports.length,
    healthy: reports.filter((r) => r.connectionHealth === "connected").length,
    degraded: reports.filter((r) => r.connectionHealth === "degraded").length,
    errors: reports.filter((r) => r.connectionHealth === "error").length,
    disconnected: reports.filter((r) => r.connectionHealth === "disconnected")
      .length,
    totalEvents: reports.reduce((s, r) => s + r.businessEventsGenerated, 0),
    totalErrors: reports.reduce((s, r) => s + r.errorCount, 0),
    totalRetries: reports.reduce((s, r) => s + r.retryCount, 0),
    averageLatencyMs:
      latencyValues.length === 0
        ? null
        : Math.round(
            latencyValues.reduce((s, v) => s + v, 0) / latencyValues.length,
          ),
    averageDataQuality:
      reports.length === 0
        ? 0
        : Math.round(
            reports.reduce((s, r) => s + r.dataQuality, 0) / reports.length,
          ),
  };
}
