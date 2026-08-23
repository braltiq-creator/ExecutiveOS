import { describe, expect, it, beforeEach } from "vitest";
import {
  resetOperationsCentre,
  syncPartnersFromPilots,
  buildOperationsCentreDashboard,
  collectPlatformHealth,
  monitorProviderHealth,
  buildCommercialHealth,
  buildCustomerHealthPortfolio,
  configureAlertThresholds,
  getAlertThresholds,
  evaluatePlatformAlerts,
  listCriticalPlatformAlerts,
  openIncident,
  updateIncident,
  listOpenIncidents,
  buildReleaseManagementSnapshot,
  setFeatureFlag,
  runPlatformDiagnostics,
  collectPerformanceMetrics,
  monitorSecurityHealth,
  monitorBillingHealth,
  monitorAdoptionHealth,
  monitorValueHealth,
} from "@/operations";
import {
  provisionDesignPartner,
  resetPilotRegistry,
  resetReadinessHistory,
} from "@/pilot";
import { clearTenantRegistry } from "@/runtime/tenant";
import { resetTenantProfileSelections } from "@/profiles";
import { resetDiscoverySessions } from "@/onboarding";
import {
  resetFeedbackStore,
  resetRecommendationStore,
  resetValidationHistory,
} from "@/validation";
import { resetM365ConnectionRegistry } from "@/providers/microsoft365";
import { resetSimproConnectionRegistry } from "@/providers/simpro";
import { resetSalesforceConnectionRegistry } from "@/providers/salesforce";
import {
  ensureDefaultEditions,
  issueLicense,
  resetLicenses,
} from "@/commercial";
import { resetGrowthPlatform, startTrialSubscription } from "@/growth";

describe("Operational Excellence & Observability Platform", () => {
  beforeEach(() => {
    resetOperationsCentre();
    resetPilotRegistry();
    resetReadinessHistory();
    clearTenantRegistry();
    resetTenantProfileSelections();
    resetDiscoverySessions();
    resetFeedbackStore();
    resetRecommendationStore();
    resetValidationHistory();
    resetM365ConnectionRegistry();
    resetSimproConnectionRegistry();
    resetSalesforceConnectionRegistry();
    resetLicenses();
    resetGrowthPlatform();
    ensureDefaultEditions();
  });

  function provision() {
    const ops = provisionDesignPartner({
      partnerName: "Harbour Field",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "admin@harbour.test",
      asOf: "2026-07-26T08:00:00.000Z",
    });
    issueLicense({
      tenantId: ops.tenantId,
      editionId: "operations_executive",
      tier: "pilot",
    });
    startTrialSubscription({
      organizationId: ops.tenantId,
      planId: "professional",
    });
    syncPartnersFromPilots("2026-07-26T08:02:00.000Z");
    return ops;
  }

  it("measures platform, provider, commercial, and customer health", () => {
    provision();
    const asOf = "2026-07-26T09:00:00.000Z";
    const platform = collectPlatformHealth(asOf);
    expect(platform.components.length).toBeGreaterThanOrEqual(6);
    expect(platform.uptimePct).toBeGreaterThan(90);

    const providers = monitorProviderHealth(asOf);
    expect(providers.map((p) => p.providerId).sort()).toEqual([
      "microsoft365",
      "salesforce",
      "simpro",
    ]);

    const commercial = buildCommercialHealth(asOf);
    expect(commercial.mrr).toBeGreaterThan(0);
    expect(commercial.arr).toBe(commercial.mrr * 12);

    const customer = buildCustomerHealthPortfolio(asOf);
    expect(customer.explanation).toMatch(/customers/);
    expect(monitorAdoptionHealth(asOf).state).toBeTruthy();
    expect(monitorValueHealth(asOf).portfolioEvs).toBeGreaterThanOrEqual(0);
    expect(monitorBillingHealth(asOf).state).toBeTruthy();
    expect(monitorSecurityHealth(asOf).state).toBeTruthy();
    expect(collectPerformanceMetrics(asOf).p95ApiLatencyMs).toBeGreaterThan(0);
    expect(runPlatformDiagnostics(asOf).findings.length).toBeGreaterThan(0);
  });

  it("supports configurable alerting, incidents, and releases", () => {
    provision();
    configureAlertThresholds({ activationRateFloorPct: 99 });
    expect(getAlertThresholds().activationRateFloorPct).toBe(99);

    evaluatePlatformAlerts("2026-07-26T10:00:00.000Z");
    const critical = listCriticalPlatformAlerts();
    expect(critical.some((a) => a.kind === "activation_drop")).toBe(true);

    const incident = openIncident({
      title: "M365 auth probe failed",
      severity: "sev2",
      providerId: "microsoft365",
      note: "Isolating provider",
    });
    updateIncident({
      id: incident.id,
      status: "mitigated",
      note: "Rotated credentials",
      rootCause: "Expired client secret",
      resolution: "Secret rotated",
      lessonsLearned: ["Monitor secret expiry 14d ahead"],
    });
    expect(listOpenIncidents().some((i) => i.id === incident.id)).toBe(true);

    const releases = buildReleaseManagementSnapshot();
    expect(releases.currentVersion).toBe("1.0.0");
    expect(releases.rollbackReady).toBe(true);
    expect(setFeatureFlag("ff-adaptive", false)?.enabled).toBe(false);
  });

  it(
    "composes excellence into the Operations admin dashboard",
    () => {
      provision();
      const dashboard = buildOperationsCentreDashboard(
        "2026-07-26T11:00:00.000Z",
      );
      expect(dashboard.excellence.platform.overall).toBeTruthy();
      expect(dashboard.excellence.deploymentStatus.version).toBeTruthy();
      expect(dashboard.excellence.providers.length).toBe(3);
      expect(dashboard.excellence.commercial.mrr).toBeGreaterThanOrEqual(0);
      expect(dashboard.partners.length).toBeGreaterThan(0);
    },
    20_000,
  );
});
