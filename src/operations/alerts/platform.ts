/**
 * Platform-level alerting with configurable thresholds.
 * Complements partner OpsAlert engine — Braltiq-only.
 */

import type {
  PlatformAlert,
  PlatformHealthSnapshot,
  ProviderHealthRecord,
  CustomerHealthPortfolio,
  CommercialHealthSnapshot,
  ValueHealthSnapshot,
  SecurityHealthSnapshot,
  PerformanceSnapshot,
} from "@/operations/observability/types";
import { getAlertThresholds } from "@/operations/alerts/thresholds";
import { collectPlatformHealth } from "@/operations/monitoring/collect";
import { monitorProviderHealth } from "@/operations/provider-health/monitor";
import { buildCustomerHealthPortfolio } from "@/operations/health/customer";
import { buildCommercialHealth } from "@/operations/analytics/commercial";
import { monitorValueHealth } from "@/operations/value-health/monitor";
import { monitorSecurityHealth } from "@/operations/security-health/monitor";
import { collectPerformanceMetrics } from "@/operations/performance/metrics";

const alerts = new Map<string, PlatformAlert>();
let priorEvs: number | null = null;
let priorMrr: number | null = null;

export function resetPlatformAlerts(): void {
  alerts.clear();
  priorEvs = null;
  priorMrr = null;
}

export function listPlatformAlerts(): PlatformAlert[] {
  return [...alerts.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function listCriticalPlatformAlerts(): PlatformAlert[] {
  return listPlatformAlerts().filter(
    (a) =>
      a.status === "open" &&
      (a.severity === "critical" || a.severity === "high"),
  );
}

export function acknowledgePlatformAlert(id: string): PlatformAlert | null {
  const current = alerts.get(id);
  if (!current) return null;
  const next = { ...current, status: "acknowledged" as const };
  alerts.set(id, next);
  return next;
}

function upsert(alert: PlatformAlert): void {
  const existing = alerts.get(alert.id);
  if (existing && existing.status !== "resolved") return;
  alerts.set(alert.id, alert);
}

export type PlatformAlertContext = {
  asOf?: string;
  platform?: PlatformHealthSnapshot;
  providers?: ProviderHealthRecord[];
  customer?: CustomerHealthPortfolio;
  commercial?: CommercialHealthSnapshot;
  value?: ValueHealthSnapshot;
  security?: SecurityHealthSnapshot;
  performance?: PerformanceSnapshot;
};

export function evaluatePlatformAlerts(
  input: string | PlatformAlertContext = {},
): PlatformAlert[] {
  const ctx: PlatformAlertContext =
    typeof input === "string" ? { asOf: input } : input;
  const asOf = ctx.asOf ?? new Date().toISOString();
  const t = getAlertThresholds();
  const platform = ctx.platform ?? collectPlatformHealth(asOf);
  const providers = ctx.providers ?? monitorProviderHealth(asOf);
  const customer = ctx.customer ?? buildCustomerHealthPortfolio(asOf);
  const commercial = ctx.commercial ?? buildCommercialHealth(asOf);
  const value = ctx.value ?? monitorValueHealth(asOf);
  const security = ctx.security ?? monitorSecurityHealth(asOf);
  const performance = ctx.performance ?? collectPerformanceMetrics(asOf);
  const created: PlatformAlert[] = [];

  const push = (alert: PlatformAlert) => {
    upsert(alert);
    created.push(alert);
  };

  if (
    platform.overall !== "healthy" ||
    platform.errorRatePct >= t.platformErrorRatePct
  ) {
    push({
      id: "platform_degradation",
      kind: "platform_degradation",
      severity: platform.overall === "critical" ? "critical" : "high",
      title: "Platform degradation detected",
      detail: platform.explanation,
      createdAt: asOf,
      status: "open",
      tenantId: null,
      providerId: null,
    });
  }

  for (const p of providers) {
    if (p.availabilityPct < t.providerAvailabilityPct || p.state === "critical") {
      push({
        id: `provider_outage_${p.providerId}`,
        kind: "provider_outage",
        severity: p.state === "critical" ? "critical" : "high",
        title: `${p.label} provider issue`,
        detail: p.explanation,
        createdAt: asOf,
        status: "open",
        tenantId: null,
        providerId: p.providerId,
      });
    }
  }

  if (priorEvs != null && value.portfolioEvs <= priorEvs - t.evsDeclinePoints) {
    push({
      id: "executive_value_decline",
      kind: "executive_value_decline",
      severity: "high",
      title: "Executive Value declined significantly",
      detail: `EVS ${priorEvs} → ${value.portfolioEvs}`,
      createdAt: asOf,
      status: "open",
      tenantId: null,
      providerId: null,
    });
  }
  priorEvs = value.portfolioEvs;

  if (customer.activationSuccessPct < t.activationRateFloorPct) {
    push({
      id: "activation_drop",
      kind: "activation_drop",
      severity: "high",
      title: "Activation rate below threshold",
      detail: `Activation ${customer.activationSuccessPct}% < ${t.activationRateFloorPct}%`,
      createdAt: asOf,
      status: "open",
      tenantId: null,
      providerId: null,
    });
  }

  if (customer.trialConversionPct < t.trialConversionFloorPct) {
    push({
      id: "trial_conversion_fall",
      kind: "trial_conversion_fall",
      severity: "moderate",
      title: "Trial conversion below threshold",
      detail: `Conversion ${customer.trialConversionPct}% < ${t.trialConversionFloorPct}%`,
      createdAt: asOf,
      status: "open",
      tenantId: null,
      providerId: null,
    });
  }

  if (customer.renewalRiskCount >= t.renewalRiskCount) {
    push({
      id: "renewal_risk",
      kind: "renewal_risk",
      severity: "high",
      title: "Renewal risk elevated",
      detail: `${customer.renewalRiskCount} customers require intervention`,
      createdAt: asOf,
      status: "open",
      tenantId: null,
      providerId: null,
    });
  }

  if (commercial.churnPct >= t.churnPct) {
    push({
      id: "commercial_kpi_churn",
      kind: "commercial_kpi",
      severity: "high",
      title: "Churn outside expected threshold",
      detail: `Churn ${commercial.churnPct}% ≥ ${t.churnPct}%`,
      createdAt: asOf,
      status: "open",
      tenantId: null,
      providerId: null,
    });
  }

  if (
    priorMrr != null &&
    priorMrr > 0 &&
    ((priorMrr - commercial.mrr) / priorMrr) * 100 >= t.mrrDropPct
  ) {
    push({
      id: "commercial_kpi_mrr",
      kind: "commercial_kpi",
      severity: "critical",
      title: "MRR dropped outside threshold",
      detail: `MRR ${priorMrr} → ${commercial.mrr}`,
      createdAt: asOf,
      status: "open",
      tenantId: null,
      providerId: null,
    });
  }
  priorMrr = commercial.mrr;

  if (security.state !== "healthy") {
    push({
      id: "security_anomaly",
      kind: "security_anomaly",
      severity: security.state === "critical" ? "critical" : "moderate",
      title: "Security health anomaly",
      detail: security.explanation,
      createdAt: asOf,
      status: "open",
      tenantId: null,
      providerId: null,
    });
  }

  if (
    performance.p95ApiLatencyMs >= t.apiP95LatencyMs ||
    performance.state !== "healthy"
  ) {
    push({
      id: "performance_degradation",
      kind: "performance_degradation",
      severity: performance.state === "critical" ? "critical" : "moderate",
      title: "Performance degradation",
      detail: performance.explanation,
      createdAt: asOf,
      status: "open",
      tenantId: null,
      providerId: null,
    });
  }

  return created;
}
