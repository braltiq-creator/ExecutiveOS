import { describe, expect, it, beforeEach } from "vitest";
import {
  resetOutcomesEngine,
  trackRecommendation,
  advanceRecommendation,
  recordExecutiveAction,
  createExecutiveOutcome,
  updateExecutiveOutcomeStatus,
  defineBusinessOutcomeType,
  listBusinessOutcomeTypes,
  measureDecisionImpact,
  measureValueRealisation,
  estimateOutcomesRoi,
  assessOutcomesConfidence,
  buildOutcomesDashboard,
  generatePilotSuccessReport,
  applyConfirmedOutcomesLearning,
  getLearningFeedbackWeights,
  scenarioConfidenceWithLearning,
  benchmarkTenantOutcomes,
  buildAnonymisedPortfolioOutcomes,
  assertOutcomesPayload,
  RECOMMENDATION_LIFECYCLE,
} from "@/outcomes";
import { resetScenarioCentre, runScenarioPack } from "@/scenarios";

describe("Executive Outcomes Engine", () => {
  beforeEach(() => {
    resetOutcomesEngine();
    resetScenarioCentre();
  });

  const tenantId = "tenant-outcomes-a";
  const otherTenant = "tenant-outcomes-b";

  it("tracks recommendation lifecycle with timestamps and evidence", () => {
    const rec = trackRecommendation({
      tenantId,
      profileId: "operations_executive",
      title: "Rebalance overloaded crew",
      businessQuestion: "Which technicians are overloaded?",
      scenarioId: "ops-technicians-overloaded",
      evidence: ["Utilisation signal"],
      asOf: "2026-07-26T08:00:00.000Z",
    });

    expect(rec.status).toBe("generated");
    expect(rec.timestamps.generated).toBeTruthy();

    let next = advanceRecommendation({
      id: rec.id,
      status: "viewed",
      asOf: "2026-07-26T08:05:00.000Z",
    });
    next = advanceRecommendation({
      id: rec.id,
      status: "accepted",
      evidence: ["Executive acknowledged"],
      asOf: "2026-07-26T08:10:00.000Z",
    });
    next = advanceRecommendation({
      id: rec.id,
      status: "implemented",
      asOf: "2026-07-26T09:00:00.000Z",
    });

    expect(next?.status).toBe("implemented");
    expect(next?.timestamps.accepted).toBeTruthy();
    expect(next?.evidence).toContain("Executive acknowledged");
    expect(RECOMMENDATION_LIFECYCLE).toContain("confirmed");
  });

  it("links executive actions and business outcomes to recommendations", () => {
    const rec = trackRecommendation({
      tenantId,
      profileId: "commercial_executive",
      title: "Contact strategic account",
      businessQuestion: "Which customers should I contact?",
      scenarioId: "com-customers-contact",
    });
    advanceRecommendation({ id: rec.id, status: "accepted" });

    const action = recordExecutiveAction({
      tenantId,
      kind: "contacted_strategic_customer",
      recommendationId: rec.id,
      detail: "Called account sponsor",
    });

    const outcome = createExecutiveOutcome({
      tenantId,
      profileId: "commercial_executive",
      name: "Strategic account engagement restored",
      businessQuestion: rec.businessQuestion,
      recommendation: rec.title,
      recommendationId: rec.id,
      executiveActionId: action.id,
      scenarioId: rec.scenarioId,
      businessOutcomeKind: "customer_retention_improved",
      observedOutcome: "Account sponsor meeting booked",
      evidence: ["Call logged", action.label],
      confidence: 70,
    });

    expect(outcome.status).toBe("open");
    const confirmed = updateExecutiveOutcomeStatus({
      id: outcome.id,
      status: "confirmed",
      asOf: "2026-07-26T12:00:00.000Z",
    });
    expect(confirmed?.status).toBe("confirmed");
    expect(confirmed?.confirmedAt).toBeTruthy();

    const impact = measureDecisionImpact({ tenantId });
    expect(impact.actionsTaken).toBe(1);
    expect(impact.outcomesConfirmed).toBe(1);
    expect(impact.influenceScore).toBeGreaterThan(0);
  });

  it("supports custom outcome types without Core changes", () => {
    const before = listBusinessOutcomeTypes(tenantId).length;
    defineBusinessOutcomeType({
      tenantId,
      label: "Board readiness improved",
      description: "Board pack confidence increased",
      defaultUnit: "score",
    });
    expect(listBusinessOutcomeTypes(tenantId).length).toBe(before + 1);
  });

  it("estimates value and ROI as ranges with confidence", () => {
    const rec = trackRecommendation({
      tenantId,
      profileId: "operations_executive",
      title: "Clear bottleneck",
      businessQuestion: "Where is operational capacity constrained?",
      scenarioId: "ops-capacity-constrained",
    });
    advanceRecommendation({ id: rec.id, status: "accepted" });
    createExecutiveOutcome({
      tenantId,
      profileId: "operations_executive",
      name: "Bottleneck cleared",
      businessQuestion: rec.businessQuestion,
      recommendation: rec.title,
      recommendationId: rec.id,
      scenarioId: rec.scenarioId,
      businessOutcomeKind: "operational_bottleneck_resolved",
      confidence: 60,
    });
    updateExecutiveOutcomeStatus({
      id: createExecutiveOutcome({
        tenantId,
        profileId: "operations_executive",
        name: "Time saved",
        businessQuestion: "What should I focus on today?",
        recommendation: "Focus list",
        businessOutcomeKind: "executive_time_saved",
        confidence: 65,
      }).id,
      status: "confirmed",
    });

    const value = measureValueRealisation({
      tenantId,
      profileId: "operations_executive",
    });
    expect(value.executiveTimeSavedHours.low).toBeLessThanOrEqual(
      value.executiveTimeSavedHours.mid,
    );
    expect(value.executiveTimeSavedHours.mid).toBeLessThanOrEqual(
      value.executiveTimeSavedHours.high,
    );
    expect(value.businessValueCreated.confidence).toBeLessThanOrEqual(70);
    expect(value.explanation).toContain("ranges");

    const roi = estimateOutcomesRoi({
      tenantId,
      profileId: "operations_executive",
    });
    expect(roi.assumptions.length).toBeGreaterThan(0);
    expect(roi.estimatedRoi.explanation).toContain("indicative");
  });

  it("builds dashboard, pilot reports, and within-tenant benchmarks", () => {
    const rec = trackRecommendation({
      tenantId,
      profileId: "operations_executive",
      title: "Escalate safety",
      businessQuestion: "What safety issues require escalation?",
      scenarioId: "ops-safety-escalation",
    });
    advanceRecommendation({ id: rec.id, status: "accepted" });
    recordExecutiveAction({
      tenantId,
      kind: "escalated_delivery_risk",
      recommendationId: rec.id,
    });
    const outcome = createExecutiveOutcome({
      tenantId,
      profileId: "operations_executive",
      name: "Safety contained",
      businessQuestion: rec.businessQuestion,
      recommendation: rec.title,
      recommendationId: rec.id,
      scenarioId: rec.scenarioId,
      businessOutcomeKind: "safety_risk_mitigated",
      observedOutcome: "Hazard contained same day",
      evidence: ["Escalation logged"],
      confidence: 75,
    });
    updateExecutiveOutcomeStatus({ id: outcome.id, status: "confirmed" });

    const dashboard = buildOutcomesDashboard({
      tenantId,
      profileId: "operations_executive",
    });
    expect(dashboard.decisionImpact.outcomesConfirmed).toBe(1);
    expect(dashboard.analytics.outcomesByStatus.confirmed).toBe(1);
    expect(dashboard.confidence.overall).toBeGreaterThan(0);

    const report = generatePilotSuccessReport({
      tenantId,
      profileId: "operations_executive",
      kind: "day_90",
      testimonials: ["Today replaced my morning inbox triage."],
    });
    expect(report.markdown).toContain("90-Day Pilot Success Report");
    expect(report.executiveTestimonials).toHaveLength(1);
    expect(report.supportingEvidence.length).toBeGreaterThan(0);

    const bench = benchmarkTenantOutcomes({
      tenantId,
      profileId: "operations_executive",
    });
    expect(bench.explanation).toContain("never compared across tenants");
  });

  it("feeds confirmed outcomes into learning overlays for scenarios", () => {
    const outcome = createExecutiveOutcome({
      tenantId,
      profileId: "operations_executive",
      name: "Focus improved",
      businessQuestion: "What should I focus on today?",
      recommendation: "Top action",
      scenarioId: "ops-focus-today",
      businessOutcomeKind: "executive_time_saved",
      confidence: 70,
    });
    updateExecutiveOutcomeStatus({ id: outcome.id, status: "confirmed" });

    const weights = applyConfirmedOutcomesLearning({ tenantId });
    expect(weights.scenarioConfidenceBoost["ops-focus-today"]).toBeGreaterThan(
      0,
    );
    expect(getLearningFeedbackWeights(tenantId)?.validationBoost).toBeGreaterThan(
      0,
    );

    const boosted = scenarioConfidenceWithLearning(
      tenantId,
      "ops-focus-today",
      60,
    );
    expect(boosted).toBeGreaterThan(60);

    const run = runScenarioPack({
      tenantId,
      profileId: "operations_executive",
    });
    const focus = run.results.find((r) => r.scenarioId === "ops-focus-today");
    expect(focus).toBeTruthy();
  });

  it("preserves tenant isolation and anonymises portfolio telemetry", () => {
    createExecutiveOutcome({
      tenantId,
      profileId: "operations_executive",
      name: "A value",
      businessQuestion: "q",
      recommendation: "r",
      businessOutcomeKind: "revenue_risk_reduced",
      estimatedBusinessValue: {
        low: 1000,
        mid: 5000,
        high: 10000,
        unit: "usd",
        confidence: 40,
        explanation: "range",
      },
    });
    createExecutiveOutcome({
      tenantId: otherTenant,
      profileId: "commercial_executive",
      name: "B value",
      businessQuestion: "q",
      recommendation: "r",
      businessOutcomeKind: "revenue_risk_reduced",
    });

    const impactA = measureDecisionImpact({ tenantId });
    const impactB = measureDecisionImpact({ tenantId: otherTenant });
    expect(impactA.tenantId).toBe(tenantId);
    expect(impactB.tenantId).toBe(otherTenant);

    assertOutcomesPayload(impactA as unknown as Record<string, unknown>);

    const portfolio = buildAnonymisedPortfolioOutcomes({
      tenants: [
        { tenantId, profileId: "operations_executive" },
        { tenantId: otherTenant, profileId: "commercial_executive" },
      ],
    });
    expect(portfolio.partnerCount).toBe(2);
    expect(portfolio.explanation.toLowerCase()).toContain("anonymised");
    expect(
      JSON.stringify(portfolio).includes("A value") ||
        JSON.stringify(portfolio).includes("B value"),
    ).toBe(false);
  });
});
