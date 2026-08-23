import type { DiagnosticReport } from "@/operations/observability/types";
import { collectPlatformHealth } from "@/operations/monitoring/collect";
import { monitorProviderHealth } from "@/operations/provider-health/monitor";
import { monitorSecurityHealth } from "@/operations/security-health/monitor";
import { collectPerformanceMetrics } from "@/operations/performance/metrics";

export function runPlatformDiagnostics(
  asOf = new Date().toISOString(),
): DiagnosticReport {
  const platform = collectPlatformHealth(asOf);
  const providers = monitorProviderHealth(asOf);
  const security = monitorSecurityHealth(asOf);
  const performance = collectPerformanceMetrics(asOf);
  const findings: DiagnosticReport["findings"] = [];

  for (const c of platform.components) {
    if (c.state === "healthy") continue;
    findings.push({
      id: `diag-${c.id}`,
      area: c.label,
      severity: c.state === "critical" ? "critical" : "warning",
      summary: c.message,
      recommendation: `Investigate ${c.label.toLowerCase()} before customer impact.`,
    });
  }

  for (const p of providers) {
    if (!p.notifyBeforeImpact) continue;
    findings.push({
      id: `diag-provider-${p.providerId}`,
      area: p.label,
      severity: p.state === "critical" ? "critical" : "warning",
      summary: p.explanation,
      recommendation: "Open provider admin and verify credentials/sync.",
    });
  }

  if (security.state !== "healthy") {
    findings.push({
      id: "diag-security",
      area: "Security",
      severity: security.state === "critical" ? "critical" : "warning",
      summary: security.explanation,
      recommendation: "Review auth failures and rate-limit breaches.",
    });
  }

  if (performance.state !== "healthy") {
    findings.push({
      id: "diag-performance",
      area: "Performance",
      severity: performance.state === "critical" ? "critical" : "warning",
      summary: performance.explanation,
      recommendation: "Check API latency and memory trends.",
    });
  }

  if (findings.length === 0) {
    findings.push({
      id: "diag-ok",
      area: "Platform",
      severity: "info",
      summary: "No critical diagnostic findings.",
      recommendation: "Continue routine monitoring.",
    });
  }

  const overall =
    findings.some((f) => f.severity === "critical")
      ? "critical"
      : findings.some((f) => f.severity === "warning")
        ? "degraded"
        : "healthy";

  return { asOf, findings, overall };
}
