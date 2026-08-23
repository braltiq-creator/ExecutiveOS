/**
 * Operational Excellence dashboard — Braltiq-only composite view.
 */

import type { OperationalExcellenceDashboard } from "@/operations/observability/types";
import { collectPlatformHealth } from "@/operations/monitoring/collect";
import { monitorProviderHealth } from "@/operations/provider-health/monitor";
import { buildCommercialHealth } from "@/operations/analytics/commercial";
import { buildCustomerHealthPortfolio } from "@/operations/health/customer";
import { monitorValueHealth } from "@/operations/value-health/monitor";
import { monitorBillingHealth } from "@/operations/billing-health/monitor";
import { monitorAdoptionHealth } from "@/operations/adoption-health/monitor";
import { monitorSecurityHealth } from "@/operations/security-health/monitor";
import { collectPerformanceMetrics } from "@/operations/performance/metrics";
import { runPlatformDiagnostics } from "@/operations/diagnostics/run";
import { buildReleaseManagementSnapshot } from "@/operations/release-management/store";
import { listOpenIncidents } from "@/operations/incident-management/store";
import {
  evaluatePlatformAlerts,
  listCriticalPlatformAlerts,
} from "@/operations/alerts/platform";

export function buildOperationalExcellenceDashboard(
  asOf = new Date().toISOString(),
): OperationalExcellenceDashboard {
  const platform = collectPlatformHealth(asOf);
  const providers = monitorProviderHealth(asOf);
  const commercial = buildCommercialHealth(asOf);
  const customerHealth = buildCustomerHealthPortfolio(asOf);
  const valueHealth = monitorValueHealth(asOf);
  const billingHealth = monitorBillingHealth(asOf);
  const adoptionHealth = monitorAdoptionHealth(asOf);
  const securityHealth = monitorSecurityHealth(asOf);
  const performance = collectPerformanceMetrics(asOf);
  const diagnostics = runPlatformDiagnostics(asOf);
  const releases = buildReleaseManagementSnapshot(asOf);

  evaluatePlatformAlerts({
    asOf,
    platform,
    providers,
    customer: customerHealth,
    commercial,
    value: valueHealth,
    security: securityHealth,
    performance,
  });

  return {
    asOf,
    platform,
    providers,
    commercial,
    customerHealth,
    valueHealth,
    billingHealth,
    adoptionHealth,
    securityHealth,
    performance,
    diagnostics,
    releases,
    openIncidents: listOpenIncidents(),
    criticalAlerts: listCriticalPlatformAlerts(),
    deploymentStatus: {
      version: releases.currentVersion,
      rollbackReady: releases.rollbackReady,
      lastDeployAt: releases.history[0]?.deployedAt ?? asOf,
      state: platform.overall,
    },
  };
}
