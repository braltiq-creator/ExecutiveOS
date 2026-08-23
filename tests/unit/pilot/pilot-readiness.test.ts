import { describe, expect, it, beforeEach } from "vitest";
import {
  provisionDesignPartner,
  resetPilotRegistry,
  listPilots,
  updatePilotStage,
  getPilotByTenant,
  computePilotReadinessScore,
  diagnosePilot,
  buildPilotHealthSnapshot,
  buildProviderChecklists,
  measurePilotSuccess,
  resetReadinessHistory,
  exportPilotDocument,
  exportAllPilotDocuments,
  getPlaybook,
  listPlaybooks,
  lifecycleProgress,
  hoursBetweenStages,
  PILOT_LIFECYCLE_STAGES,
  getTenantTemplate,
  buildSupportGuidance,
} from "@/pilot";
import { clearTenantRegistry, getTenant } from "@/runtime/tenant";
import { resetTenantProfileSelections } from "@/profiles";
import {
  createDiscoverySession,
  submitMinimumQuestions,
  runDiscovery,
  validateDiscovery,
  completeDiscovery,
  getValidationQueue,
  resetDiscoverySessions,
  saveDiscoverySession,
} from "@/onboarding";
import {
  getM365ConnectionRegistry,
  resetM365ConnectionRegistry,
  PRODUCTION_GRAPH_SCOPES,
} from "@/providers/microsoft365";
import {
  getSimproConnectionRegistry,
  resetSimproConnectionRegistry,
  SIMPRO_OAUTH_SCOPES,
} from "@/providers/simpro";
import {
  getSalesforceConnectionRegistry,
  resetSalesforceConnectionRegistry,
} from "@/providers/salesforce";
import {
  resetFeedbackStore,
  resetRecommendationStore,
  resetValidationHistory,
} from "@/validation";

describe("Pilot Readiness Toolkit", () => {
  beforeEach(() => {
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
  });

  it("one-click provisions Operations and Commercial tenants from templates", () => {
    const ops = provisionDesignPartner({
      partnerName: "Harbour Field",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "cs@braltiq.com",
      region: "au",
      asOf: "2026-07-26T08:00:00.000Z",
    });
    const commercial = provisionDesignPartner({
      partnerName: "North Peak Sales",
      industry: "B2B Services",
      intelligenceProfileId: "commercial_executive",
      administratorEmail: "cs@braltiq.com",
      region: "us",
      asOf: "2026-07-26T08:01:00.000Z",
    });

    expect(ops.tenantId).toBe("tenant-harbour-field");
    expect(ops.pilot.stage).toBe("provisioning");
    expect(ops.pilot.stageTimestamps.prospect).toBeTruthy();
    expect(ops.pilot.stageTimestamps.invited).toBeTruthy();
    expect(ops.pilot.stageTimestamps.provisioning).toBeTruthy();
    expect(ops.playbookId).toBe("playbook-operations-executive");

    const tenant = getTenant(ops.tenantId);
    expect(tenant?.contextProviderIds).toEqual(["microsoft365", "simpro"]);
    expect(tenant?.licensing.planId).toBe("design-partner-pilot");

    expect(commercial.tenantId).toBe("tenant-north-peak-sales");
    expect(getTenant(commercial.tenantId)?.contextProviderIds).toEqual([
      "microsoft365",
      "salesforce",
    ]);
    expect(getTenantTemplate("commercial_executive").id).toBe(
      "template-commercial-executive",
    );
  });

  it("tracks lifecycle timestamps for every stage", () => {
    const { pilot: created } = provisionDesignPartner({
      partnerName: "Stage Co",
      industry: "Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "cs@braltiq.com",
      asOf: "2026-07-26T08:00:00.000Z",
    });

    let pilot = created;
    const asOf = "2026-07-26T10:00:00.000Z";
    for (const stage of PILOT_LIFECYCLE_STAGES.slice(3)) {
      const updated = updatePilotStage({
        pilotId: pilot.id,
        stage,
        asOf,
        note: `Entered ${stage}`,
      });
      expect(updated).toBeTruthy();
      pilot = updated!;
    }

    expect(pilot.stage).toBe("pilot_complete");
    for (const stage of PILOT_LIFECYCLE_STAGES) {
      expect(pilot.stageTimestamps[stage]).toBeTruthy();
    }
    const progress = lifecycleProgress(pilot);
    expect(progress.percent).toBe(100);
    expect(hoursBetweenStages(pilot, "provisioning", "active_pilot")).toBe(2);
  });

  it("builds profile-aware provider checklists", () => {
    const ops = provisionDesignPartner({
      partnerName: "Ops Check",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "cs@braltiq.com",
    });
    const commercial = provisionDesignPartner({
      partnerName: "Comm Check",
      industry: "B2B",
      intelligenceProfileId: "commercial_executive",
      administratorEmail: "cs@braltiq.com",
    });

    const opsLists = buildProviderChecklists({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
    });
    expect(opsLists.map((c) => c.providerId)).toEqual([
      "microsoft365",
      "simpro",
    ]);
    expect(opsLists.find((c) => c.providerId === "simpro")?.required).toBe(true);

    const commercialLists = buildProviderChecklists({
      tenantId: commercial.tenantId,
      profileId: "commercial_executive",
    });
    expect(commercialLists.map((c) => c.providerId)).toEqual([
      "microsoft365",
      "salesforce",
    ]);
    expect(
      commercialLists.find((c) => c.providerId === "salesforce")?.required,
    ).toBe(true);

    const sharedLabels = opsLists[0]!.items.map((i) => i.label);
    expect(sharedLabels).toContain("Discovery complete");
    expect(sharedLabels).toContain("Validation complete");
    expect(sharedLabels).toContain("First Executive Brief generated");
  });

  async function seedOpsProviders(tenantId: string) {
    getM365ConnectionRegistry().connect({
      executiveosTenantId: tenantId,
      microsoftTenantId: "m365-1",
      tokens: {
        accessToken: "a",
        refreshToken: "r",
        idToken: null,
        tokenType: "Bearer",
        expiresAt: "2026-07-26T12:00:00.000Z",
        scopes: [...PRODUCTION_GRAPH_SCOPES],
        tenantId: "m365-1",
      },
      userId: "admin",
      scopes: [...PRODUCTION_GRAPH_SCOPES],
      asOf: "2026-07-26T08:00:00.000Z",
    });
    await getM365ConnectionRegistry().sync({
      executiveosTenantId: tenantId,
      mode: "full",
      asOf: "2026-07-26T08:10:00.000Z",
    });

    getSimproConnectionRegistry().connect({
      executiveosTenantId: tenantId,
      companyId: "simpro-1",
      credentials: {
        strategy: "api_key",
        apiKeyRef: "vault:k",
        apiKey: "k",
      },
      userId: "admin",
      scopes: [...SIMPRO_OAUTH_SCOPES],
      asOf: "2026-07-26T08:00:00.000Z",
    });
    await getSimproConnectionRegistry().sync({
      executiveosTenantId: tenantId,
      mode: "full",
      asOf: "2026-07-26T08:10:00.000Z",
    });

    let session = createDiscoverySession({
      tenantId,
      userId: "user-1",
      asOf: "2026-07-26T08:00:00.000Z",
    });
    session = submitMinimumQuestions(session, {
      role: "CEO",
      primaryObjective: "Operational Excellence",
      briefingTime: "Morning",
    });
    session = runDiscovery(session, {
      connectedSystems: ["microsoft365", "simpro"],
      asOf: "2026-07-26T08:05:00.000Z",
    });
    const queue = getValidationQueue(session);
    for (const item of queue) {
      session = validateDiscovery(session, item.id, "confirm");
    }
    session = completeDiscovery(session, "2026-07-26T08:12:00.000Z");
    saveDiscoverySession(session);
  }

  it("scores readiness, diagnostics, health, and success objectively", async () => {
    const { tenantId } = provisionDesignPartner({
      partnerName: "Ready Co",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "cs@braltiq.com",
      asOf: "2026-07-26T08:00:00.000Z",
    });

    const before = computePilotReadinessScore({
      tenantId,
      profileId: "operations_executive",
      asOf: "2026-07-26T08:01:00.000Z",
    });
    expect(before.overall).toBeGreaterThanOrEqual(0);
    expect(before.overall).toBeLessThanOrEqual(100);
    expect(before.components.length).toBeGreaterThanOrEqual(7);
    expect(before.components.every((c) => c.explanation.length > 0)).toBe(true);

    const earlyDiagnostics = diagnosePilot({
      tenantId,
      profileId: "operations_executive",
    });
    expect(
      earlyDiagnostics.some((d) => d.id.includes("diag-connect")),
    ).toBe(true);
    expect(earlyDiagnostics[0]?.remediation.length).toBeGreaterThan(0);

    await seedOpsProviders(tenantId);
    updatePilotStage({
      pilotId: getPilotByTenant(tenantId)!.id,
      stage: "first_executive_brief",
      asOf: "2026-07-26T09:00:00.000Z",
    });

    const after = computePilotReadinessScore({
      tenantId,
      profileId: "operations_executive",
      asOf: "2026-07-26T09:05:00.000Z",
    });
    expect(after.overall).toBeGreaterThan(before.overall);

    const health = buildPilotHealthSnapshot({
      tenantId,
      profileId: "operations_executive",
    });
    expect(health.providersHealthy).toBe(2);
    expect(health.providersRequired).toBe(2);
    expect(health.lifecycleStage).toBe("first_executive_brief");

    const success = measurePilotSuccess({
      tenantId,
      profileId: "operations_executive",
    });
    expect(["up", "flat", "down"]).toContain(success.readinessTrend);
    expect(success.explanation.length).toBeGreaterThan(0);

    const support = buildSupportGuidance({
      tenantId,
      profileId: "operations_executive",
    });
    expect(support.summary.length).toBeGreaterThan(0);
  });

  it("exports partner-shareable reports", () => {
    const { tenantId, pilot } = provisionDesignPartner({
      partnerName: "Export Co",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "cs@braltiq.com",
    });

    const doc = exportPilotDocument({
      tenantId,
      profileId: "operations_executive",
      kind: "readiness_report",
    });
    expect(doc.title).toBe("Pilot Readiness Report");
    expect(doc.partnerName).toBe(pilot.partnerName);
    expect(doc.markdown).toContain("Readiness Score");

    const all = exportAllPilotDocuments({
      tenantId,
      profileId: "operations_executive",
    });
    expect(all.map((d) => d.kind)).toEqual([
      "readiness_report",
      "deployment_summary",
      "executive_adoption",
      "connector_health",
      "validation_summary",
    ]);
  });

  it("provides Operations and Commercial implementation playbooks", () => {
    const books = listPlaybooks();
    expect(books).toHaveLength(2);
    const ops = getPlaybook("operations_executive");
    expect(ops.preparation.length).toBeGreaterThan(0);
    expect(ops.deployment.length).toBeGreaterThan(0);
    expect(ops.validation.length).toBeGreaterThan(0);
    expect(ops.successCriteria.length).toBeGreaterThan(0);
    expect(ops.commonIssues.length).toBeGreaterThan(0);
    expect(ops.escalation.length).toBeGreaterThan(0);
    expect(getPlaybook("commercial_executive").id).toBe(
      "playbook-commercial-executive",
    );
  });

  it("isolates four Design Partner pilots without cross-tenant bleed", () => {
    const partners = [
      {
        partnerName: "Alpha Ops",
        intelligenceProfileId: "operations_executive" as const,
      },
      {
        partnerName: "Beta Ops",
        intelligenceProfileId: "operations_executive" as const,
      },
      {
        partnerName: "Gamma Commercial",
        intelligenceProfileId: "commercial_executive" as const,
      },
      {
        partnerName: "Delta Commercial",
        intelligenceProfileId: "commercial_executive" as const,
      },
    ];

    const results = partners.map((p, i) =>
      provisionDesignPartner({
        partnerName: p.partnerName,
        industry: "Services",
        intelligenceProfileId: p.intelligenceProfileId,
        administratorEmail: `admin${i}@braltiq.com`,
        asOf: `2026-07-26T08:0${i}:00.000Z`,
      }),
    );

    expect(listPilots()).toHaveLength(4);
    const tenantIds = new Set(results.map((r) => r.tenantId));
    expect(tenantIds.size).toBe(4);

    for (const result of results) {
      expect(getTenant(result.tenantId)?.id).toBe(result.tenantId);
      expect(getPilotByTenant(result.tenantId)?.partnerName).toBe(
        result.pilot.partnerName,
      );
    }

    updatePilotStage({
      pilotId: results[0]!.pilot.id,
      stage: "active_pilot",
      asOf: "2026-07-26T12:00:00.000Z",
    });
    expect(getPilotByTenant(results[1]!.tenantId)?.stage).toBe("provisioning");
    expect(getPilotByTenant(results[0]!.tenantId)?.stage).toBe("active_pilot");
  });
});
