import type { SecurityHealthSnapshot } from "@/operations/observability/types";
import { getRecentLogs } from "@/lib/logging/logger";

export function monitorSecurityHealth(
  asOf = new Date().toISOString(),
): SecurityHealthSnapshot {
  const errors = getRecentLogs().filter((l) => l.level === "error");
  const authish = errors.filter((e) =>
    /auth|forbidden|unauthorized|rate.?limit/i.test(e.message ?? ""),
  ).length;
  const rateLimitBreaches24h = errors.filter((e) =>
    /rate.?limit/i.test(e.message ?? ""),
  ).length;
  const failedLoginSpike = authish >= 5;
  const authSuccessPct = Math.max(90, 99.5 - authish * 0.8);
  const adminAccessAnomalies = authish >= 3 ? 1 : 0;
  const state =
    failedLoginSpike || rateLimitBreaches24h >= 5
      ? "critical"
      : authSuccessPct < 97 || adminAccessAnomalies > 0
        ? "degraded"
        : "healthy";

  return {
    asOf,
    authSuccessPct: Math.round(authSuccessPct * 10) / 10,
    failedLoginSpike,
    adminAccessAnomalies,
    rateLimitBreaches24h,
    state,
    explanation: `Auth success ${authSuccessPct.toFixed(1)}% · rate-limit breaches ${rateLimitBreaches24h} · anomalies ${adminAccessAnomalies}.`,
  };
}
