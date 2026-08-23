import { describe, expect, it, beforeEach } from "vitest";
import {
  resetOperationsCentre,
  syncPartnersFromPilots,
  upsertPartnerOpsRecord,
  buildOperationsCentreDashboard,
  buildPartnerDashboardRow,
  extractTenantTelemetry,
  assertOperationalPayload,
  computePilotOpsHealth,
  measureAdoption,
  measureEngagement,
  measureValueRealisation,
  getCustomerSuccessPlan,
  updateCustomerSuccessPlan,
  recordSupportIssue,
  detectSupportPatterns,
  evaluateOpsAlerts,
  acknowledgeOpsAlert,
  listOpenOpsAlerts,
  addOpsNote,
  createOpsTask,
  recordPartnerReview,
  getReview,
  addRoadmapItem,
  buildPortfolioAnalytics,
  trafficLightFromScore,
} from "@/operations";
import {
  provisionDesignPartner,
  resetPilotRegistry,
  updatePilotStage,
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

describe("Design Partner Operations Centre", () => {
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
  });

  function provisionPair() {
    const ops = provisionDesignPartner({
      partnerName: "Harbour Field",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "admin@harbour.test",
      asOf: "2026-07-26T08:00:00.000Z",
    });
    const commercial = provisionDesignPartner({
      partnerName: "North Peak",
      industry: "B2B Services",
      intelligenceProfileId: "commercial_executive",
      administratorEmail: "admin@northpeak.test",
      asOf: "2026-07-26T08:01:00.000Z",
    });
    syncPartnersFromPilots("2026-07-26T08:02:00.000Z");
    return { ops, commercial };
  }

  it(
    "syncs partners and builds portfolio dashboard with traffic lights",
    () => {
    const { ops, commercial } = provisionPair();
    const dashboard = buildOperationsCentreDashboard("2026-07-26T09:00:00.000Z");

    expect(dashboard.partners).toHaveLength(2);
    const harbour = dashboard.partners.find(
      (p) => p.tenantId === ops.tenantId,
    );
    expect(harbour?.companyName).toBe("Harbour Field");
    expect(harbour?.intelligenceProfileId).toBe("operations_executive");
    expect(harbour?.industry).toBe("Field Services");
    expect(harbour?.pilotStage).toBe("provisioning");
    expect(harbour?.readinessScore).toBeGreaterThanOrEqual(0);
    expect(["green", "amber", "red"]).toContain(harbour?.overallHealth);
    expect(harbour?.trafficLights.overall).toBe(harbour?.overallHealth);

    expect(
      dashboard.partners.find((p) => p.tenantId === commercial.tenantId)
        ?.intelligenceProfileId,
    ).toBe("commercial_executive");

    expect(dashboard.analytics.partnerCount).toBe(2);
    expect(dashboard.analytics.explanation.length).toBeGreaterThan(0);
    },
    15_000,
  );

  it("explains every pilot health score component", () => {
    const { ops } = provisionPair();
    const health = computePilotOpsHealth({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
    });

    expect(health.overall.explanation.length).toBeGreaterThan(0);
    expect(health.successProbability.score).toBeGreaterThanOrEqual(0);
    for (const component of [
      health.adoption,
      health.engagement,
      health.learningProgress,
      health.recommendationAcceptance,
      health.providerHealth,
      health.knowledgeGraphMaturity,
      health.supportLoad,
      health.executiveSatisfaction,
    ]) {
      expect(component.explanation.length).toBeGreaterThan(0);
      expect(component.score).toBeGreaterThanOrEqual(0);
      expect(component.score).toBeLessThanOrEqual(100);
      expect(component.trafficLight).toBe(trafficLightFromScore(component.score));
    }
  });

  it("measures engagement, adoption, and value realisation objectively", () => {
    const { ops } = provisionPair();
    const engagement = measureEngagement({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
      asOf: "2026-07-26T10:00:00.000Z",
    });
    expect(engagement.dailyActiveExecutives).toBeGreaterThanOrEqual(0);
    expect(engagement.weeklyActiveExecutives).toBeGreaterThanOrEqual(
      engagement.dailyActiveExecutives,
    );
    expect(engagement.history.length).toBeGreaterThan(0);
    expect(["up", "flat", "down"]).toContain(engagement.trend);

    const adoption = measureAdoption({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
    });
    expect(adoption.explanation).toContain("Adoption");

    const value = measureValueRealisation({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
    });
    expect(value.pilotRoiEstimate).toBeGreaterThanOrEqual(0);
    expect(value.evidence.length).toBeGreaterThan(0);
  });

  it("tracks customer success plans, notes, tasks, and reviews", () => {
    const { ops } = provisionPair();
    updateCustomerSuccessPlan({
      tenantId: ops.tenantId,
      customerSuccessManager: "Ava Chen",
      implementationOwner: "Marcus Lee",
      executiveSponsor: "CEO Harbour",
      nextReviewDate: "2026-08-26",
      successPlan: "Reach Active Pilot with readiness ≥ 70",
      outstandingRisks: ["Simpro consent pending"],
    });

    addOpsNote({
      tenantId: ops.tenantId,
      author: "Ava Chen",
      body: "Kickoff complete; waiting on M365 admin",
      kind: "meeting",
    });
    createOpsTask({
      tenantId: ops.tenantId,
      title: "Schedule discovery workshop",
      owner: "Marcus Lee",
      dueAt: "2026-07-28",
    });

    const plan = getCustomerSuccessPlan(ops.tenantId);
    expect(plan?.customerSuccessManager).toBe("Ava Chen");
    expect(plan?.meetingNotes).toHaveLength(1);
    expect(plan?.followUpTasks).toHaveLength(1);
    expect(plan?.actionsRequired[0]).toContain("discovery");

    const review = recordPartnerReview({
      tenantId: ops.tenantId,
      milestone: "day_30",
      conductedBy: "Ava Chen",
      achievements: ["First brief delivered"],
      challenges: ["Low morning opens"],
      featureRequests: ["Mobile brief"],
      executiveFeedback: "Useful but still learning the rhythm",
      businessOutcomes: ["Faster Monday prioritisation"],
      nextActions: ["Coach brief habit"],
      asOf: "2026-08-26T09:00:00.000Z",
    });
    expect(getReview(ops.tenantId, "day_30")?.id).toBe(review.id);
    expect(review.milestone).toBe("day_30");
  });

  it("records support issues, surfaces recurring patterns, and alerts", () => {
    const { ops, commercial } = provisionPair();

    recordSupportIssue({
      tenantId: ops.tenantId,
      title: "Simpro sync empty",
      severity: "high",
      owner: "Support",
      category: "provider_sync",
    });
    recordSupportIssue({
      tenantId: commercial.tenantId,
      title: "Salesforce CDC gap",
      severity: "high",
      owner: "Support",
      category: "provider_sync",
    });
    recordSupportIssue({
      tenantId: ops.tenantId,
      title: "M365 consent blocked",
      severity: "critical",
      owner: "Support",
      category: "provider_auth",
    });
    recordSupportIssue({
      tenantId: ops.tenantId,
      title: "Retry auth",
      severity: "critical",
      owner: "Support",
      category: "provider_auth",
    });

    const patterns = detectSupportPatterns();
    expect(patterns.some((p) => p.category === "provider_sync")).toBe(true);
    expect(patterns.some((p) => p.tenantIds.length >= 2)).toBe(true);

    // First evaluation seeds baselines
    evaluateOpsAlerts({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
      companyName: "Harbour Field",
      asOf: "2026-07-26T11:00:00.000Z",
    });
    // Provider disconnected should alert immediately
    const open = listOpenOpsAlerts().filter((a) => a.tenantId === ops.tenantId);
    expect(open.some((a) => a.kind === "provider_disconnected")).toBe(true);

    const alert = open[0]!;
    const acked = acknowledgeOpsAlert({ id: alert.id, by: "cs-lead" });
    expect(acked?.status).toBe("acknowledged");
  });

  it("preserves tenant isolation — telemetry has no business payloads", () => {
    const { ops, commercial } = provisionPair();
    const t1 = extractTenantTelemetry({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
    });
    const t2 = extractTenantTelemetry({
      tenantId: commercial.tenantId,
      profileId: "commercial_executive",
    });

    expect(t1.tenantId).toBe(ops.tenantId);
    expect(t2.tenantId).toBe(commercial.tenantId);
    assertOperationalPayload(t1 as unknown as Record<string, unknown>);
    assertOperationalPayload(t2 as unknown as Record<string, unknown>);

    const row = buildPartnerDashboardRow({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
      companyName: "Harbour Field",
      industry: "Field Services",
      pilotStage: "provisioning",
    });
    assertOperationalPayload(row as unknown as Record<string, unknown>);

    // Updating one partner CS plan does not alter the other
    upsertPartnerOpsRecord({
      tenantId: ops.tenantId,
      companyName: "Harbour Field",
      intelligenceProfileId: "operations_executive",
      industry: "Field Services",
      customerSuccessManager: "Only Harbour",
    });
    expect(
      getCustomerSuccessPlan(commercial.tenantId)?.customerSuccessManager,
    ).not.toBe("Only Harbour");
  });

  it("identifies struggling partners in portfolio analytics", () => {
    const { ops, commercial } = provisionPair();
    updatePilotStage({
      pilotId: commercial.pilot.id,
      stage: "active_pilot",
      asOf: "2026-07-26T12:00:00.000Z",
    });
    addRoadmapItem({
      tenantId: ops.tenantId,
      title: "Simpro capacity heat map",
      requestedBy: "Harbour CEO",
      priority: "high",
    });

    const analytics = buildPortfolioAnalytics("2026-07-26T12:30:00.000Z");
    expect(analytics.partnerCount).toBe(2);
    expect(analytics.customerHealthTrends).toHaveLength(2);
    // Freshly provisioned partners without providers should struggle
    expect(
      analytics.strugglingPartners.length +
        analytics.customerHealthTrends.filter((h) => h.trafficLight !== "green")
          .length,
    ).toBeGreaterThan(0);
  });
});
