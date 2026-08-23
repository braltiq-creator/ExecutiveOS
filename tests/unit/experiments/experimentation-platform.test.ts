import { describe, expect, it, beforeEach } from "vitest";
import {
  resetExperimentationPlatform,
  createHypothesis,
  createExperiment,
  startExperiment,
  completeExperiment,
  measurePilotIntelligence,
  measureFeatureAdoption,
  recordBehaviourEvent,
  recordInterview,
  recordProductFeedback,
  generateProductInsights,
  recommendRoadmapPriorities,
  buildExperimentationDashboard,
  buildCohortAnalytics,
  buildProfileAnalytics,
  measureRecommendationEffectiveness,
  assertExperimentsPayload,
  anonymiseExperimentTelemetry,
  listExperiments,
} from "@/experiments";
import {
  provisionDesignPartner,
  resetPilotRegistry,
  resetReadinessHistory,
  updatePilotStage,
} from "@/pilot";
import { resetOperationsCentre, syncPartnersFromPilots } from "@/operations";
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

describe("Pilot Intelligence & Experimentation Platform", () => {
  beforeEach(() => {
    resetExperimentationPlatform();
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
      partnerName: "Ops Partner",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "admin@ops-partner.test",
      region: "au",
      environment: "pilot",
    });
    const com = provisionDesignPartner({
      partnerName: "Commercial Partner",
      industry: "B2B Services",
      intelligenceProfileId: "commercial_executive",
      administratorEmail: "admin@com-partner.test",
      region: "au",
      environment: "pilot",
    });
    syncPartnersFromPilots();
    updatePilotStage({ pilotId: ops.pilot.id, stage: "active_pilot" });
    updatePilotStage({ pilotId: com.pilot.id, stage: "active_pilot" });
    return { ops, com };
  }

  it("creates reusable experiments from hypotheses", () => {
    const { ops } = provisionPair();
    const hypothesis = createHypothesis({
      statement:
        "Displaying strategic outcomes first will increase recommendation acceptance by 15%.",
      objective: "Validate hierarchy",
      targetProfileId: "all",
      expectedBehaviourChange: "Higher acceptance",
      successMetrics: ["recommendation_acceptance"],
    });
    const experiment = createExperiment({
      hypothesisId: hypothesis.id,
      targetPartnerTenantIds: [ops.tenantId],
    });
    expect(experiment.status).toBe("draft");
    expect(startExperiment(experiment.id)?.status).toBe("running");
    const done = completeExperiment({
      id: experiment.id,
      result: "validated",
      learning: "Hierarchy improved scan-to-action",
      recommendedAction: "Keep outcomes-first brief",
    });
    expect(done?.result).toBe("validated");
    expect(listExperiments()).toHaveLength(1);
  });

  it("measures explained pilot intelligence metrics per partner", () => {
    const { ops } = provisionPair();
    recordBehaviourEvent({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
      kind: "brief_open",
      featureKey: "today_brief",
      value: 4,
    });
    recordBehaviourEvent({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
      kind: "recommendation_accept",
      featureKey: "recommendation",
      value: 2,
    });

    const snap = measurePilotIntelligence({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
    });

    expect(snap.partnerLabel).toMatch(/^Partner /);
    expect(snap.metrics.executiveAdoption.explanation.length).toBeGreaterThan(20);
    expect(snap.metrics.recommendationAcceptance.value).toBeGreaterThanOrEqual(0);
    expect(snap.metrics.successProbability.unit).toBe("percent");
    assertExperimentsPayload({
      tenantId: snap.tenantId,
      adoption: snap.metrics.executiveAdoption.value,
      success: snap.metrics.successProbability.value,
    });
  });

  it("tracks feature adoption trends without business payloads", () => {
    const { com } = provisionPair();
    recordBehaviourEvent({
      tenantId: com.tenantId,
      profileId: "commercial_executive",
      kind: "strategy_view",
      featureKey: "strategy_page",
    });
    recordBehaviourEvent({
      tenantId: com.tenantId,
      profileId: "commercial_executive",
      kind: "trust_panel_open",
      featureKey: "trust_panel",
    });

    const adoption = measureFeatureAdoption({
      tenantId: com.tenantId,
      profileId: "commercial_executive",
    });

    const ids = adoption.series.map((s) => s.metricId);
    expect(ids).toContain("executive_brief_opens");
    expect(ids).toContain("trust_panel_usage");
    expect(ids).toContain("strategy_page_usage");
    expect(
      adoption.series.find((s) => s.metricId === "strategy_page_usage")?.total,
    ).toBeGreaterThan(0);

    const dirty = anonymiseExperimentTelemetry({
      tenantId: com.tenantId,
      score: 12,
      opportunities: [{ name: "secret deal" }],
    } as Record<string, unknown>);
    expect(dirty).not.toHaveProperty("opportunities");
  });

  it("records interviews and generates prioritised insights + roadmap", () => {
    const { ops, com } = provisionPair();
    const hyp = createHypothesis({
      statement: "Trust prompts lift review completion",
      objective: "Learning loop",
      targetProfileId: "operations_executive",
      expectedBehaviourChange: "More reviews",
      successMetrics: ["review_completion"],
    });
    const exp = createExperiment({
      hypothesisId: hyp.id,
      targetPartnerTenantIds: [ops.tenantId],
    });
    startExperiment(exp.id);
    completeExperiment({
      id: exp.id,
      result: "validated",
      learning: "Reviews increase when adjacent to confidence",
      recommendedAction: "Keep review controls in Trust panel",
    });

    recordBehaviourEvent({
      tenantId: com.tenantId,
      profileId: "commercial_executive",
      kind: "recommendation_ignore",
      featureKey: "recommendation",
      value: 4,
    });
    recordBehaviourEvent({
      tenantId: com.tenantId,
      profileId: "commercial_executive",
      kind: "recommendation_accept",
      featureKey: "recommendation",
      value: 1,
    });

    recordInterview({
      tenantId: ops.tenantId,
      executiveRole: "CEO",
      executiveLabel: "Exec CEO",
      questionsAsked: ["Why this?"],
      positiveFeedback: ["Calm brief"],
      negativeFeedback: ["Trust hard to find"],
      featureRequests: ["Board export"],
      painPoints: ["Mobile trust panel"],
      suggestedImprovements: ["Earlier confidence"],
      overallSatisfaction: 7,
      experimentIds: [exp.id],
      recordedAt: new Date().toISOString(),
      recordedBy: "braltiq",
    });
    recordProductFeedback({
      tenantId: ops.tenantId,
      profileId: "operations_executive",
      source: "interview",
      theme: "Mobile trust panel",
      sentiment: "negative",
      experimentId: exp.id,
    });

    const insights = generateProductInsights({
      tenantId: com.tenantId,
      profileId: "commercial_executive",
    });
    expect(insights.some((i) => i.kind === "frequently_ignored_recommendation")).toBe(
      true,
    );
    expect(insights[0]?.priority).toMatch(/^p[0-3]$/);

    const roadmap = recommendRoadmapPriorities();
    expect(roadmap.length).toBeGreaterThan(0);
    expect(roadmap[0]?.confidence).toBeGreaterThan(0);
    expect(roadmap.some((r) => r.sources.includes("experiment"))).toBe(true);
  });

  it(
    "builds portfolio, profile, and cohort analytics with isolation",
    () => {
      provisionPair();
      const dashboard = buildExperimentationDashboard();
      expect(dashboard.portfolio.partnerCount).toBe(2);
      expect(dashboard.profiles).toHaveLength(2);
      expect(dashboard.cohorts.length).toBeGreaterThan(0);
      expect(
        buildProfileAnalytics({
          intelligence: dashboard.pilotIntelligence,
          insights: dashboard.insights,
        })[0]?.explanation,
      ).toMatch(/anonymised/i);
      expect(
        buildCohortAnalytics(
          dashboard.asOf,
          dashboard.pilotIntelligence,
        )[0]?.label,
      ).toBeTruthy();

      const eff = measureRecommendationEffectiveness({
        tenantId: dashboard.pilotIntelligence[0]!.tenantId,
        profileId: dashboard.pilotIntelligence[0]!.profileId,
      });
      expect(eff.explanation).toMatch(/anonymised/i);

      expect(() =>
        assertExperimentsPayload({
          discoveries: [],
        } as unknown as Record<string, unknown>),
      ).toThrow(/isolation/i);
    },
    15000,
  );
});
