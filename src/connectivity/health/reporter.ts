/**
 * Connector health — platform-level observability beyond Core ConnectorHealth.
 */

import type { ConnectorHealth, ConnectorStatus } from "@/connectors/types";
import type { AuthSession } from "@/connectivity/authentication";

export type ConnectorHealthReport = {
  connectorId: string;
  system: string;
  connectionHealth: ConnectorStatus;
  authenticationStatus: AuthSession["status"] | "none";
  lastSync: string | null;
  syncDurationMs: number | null;
  errorCount: number;
  retryCount: number;
  businessEventsGenerated: number;
  latencyMs: number | null;
  dataQuality: number;
  message: string;
};

export function buildHealthReport(input: {
  core: ConnectorHealth;
  authStatus?: AuthSession["status"] | "none";
  syncDurationMs?: number | null;
  retryCount?: number;
  businessEventsGenerated?: number;
  latencyMs?: number | null;
  dataQuality?: number;
}): ConnectorHealthReport {
  return {
    connectorId: input.core.connectorId,
    system: input.core.system,
    connectionHealth: input.core.status,
    authenticationStatus: input.authStatus ?? "none",
    lastSync: input.core.lastSuccessfulSync,
    syncDurationMs: input.syncDurationMs ?? null,
    errorCount: input.core.errorCount,
    retryCount: input.retryCount ?? 0,
    businessEventsGenerated: input.businessEventsGenerated ?? 0,
    latencyMs: input.latencyMs ?? null,
    dataQuality: input.dataQuality ?? deriveDataQuality(input.core),
    message: input.core.message,
  };
}

function deriveDataQuality(core: ConnectorHealth): number {
  if (core.status === "error") return 20;
  if (core.status === "degraded") return 55;
  if (core.status === "disconnected") return 0;
  const penalty = Math.min(40, core.errorCount * 5 + core.warningCount * 2);
  return Math.max(40, 100 - penalty);
}
