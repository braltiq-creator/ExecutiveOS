import { describe, expect, it, beforeEach } from "vitest";
import {
  resetStrategyFramework,
  seedStrategicOutcomesFromDiscovery,
  listStrategicOutcomes,
  upsertStrategicOutcome,
  linkStrategicInitiative,
  recordStrategicMetric,
  alignRecommendationToOutcomes,
  buildAlignmentSnapshot,
  measureStrategicProgress,
  validateStrategicAlignment,
  buildStrategyDashboard,
  attachStrategicOutcomesToTodayActions,
  attachStrategicOutcomesToCouncil,
  refineStrategicOutcomeFromSignals,
  assertStrategyPayload,
  linkOutcomeDependency,
} from "@/strategy";
import { submitMinimumQuestions, createDiscoverySession, resetDiscoverySessions } from "@/onboarding";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

describe("Strategic Outcomes Framework", () => {
  beforeEach(() => {
    resetStrategyFramework();
    resetDiscoverySessions();
  });

  const tenantId = "tenant-strategy-a";

  it("creates reusable strategic outcomes with owners, measures, and dependencies", () => {
    const a = upsertStrategicOutcome({
      tenantId,
      name: "Improve operational reliability",
      profileId: "operations_executive",
      description: "Fewer delivery misses and capacity shocks",
      executiveOwner: "COO",
      successMeasures: ["On-time delivery ≥ 95%"],
      supportingKpis: ["Utilisation", "Jobs at risk"],
      businessCapabilities: ["Field delivery"],
      strategicImportance: "critical",
      evidence: ["Discovery declaration"],
    });
    const b = upsertStrategicOutcome({
      tenantId,
      name: "Grow profitable revenue",
      profileId: "commercial_executive",
      executiveOwner: "CRO",
      strategicImportance: "high",
    });
    expect(linkOutcomeDependency({
      outcomeId: b.id,
      dependsOnOutcomeId: a.id,
    })).toBe(true);
    expect(listStrategicOutcomes(tenantId)).toHaveLength(2);
    expect(a.successMeasures.length).toBeGreaterThan(0);
  });

  it("links initiatives and aligns recommendations to outcomes", () => {
    const outcomes = seedStrategicOutcomesFromDiscovery({
      tenantId,
      profileId: "operations_executive",
      names: [
        "Improve operational reliability",
        "Strengthen strategic customer retention",
        "Grow profitable revenue",
      ],
      owner: "CEO",
    });
    expect(outcomes).toHaveLength(3);

    linkStrategicInitiative({
      tenantId,
      outcomeId: outcomes[0]!.id,
      name: "Capacity discipline",
      owner: "COO",
      progressPct: 40,
      scenarioIds: ["ops-capacity-constrained"],
      recommendationIds: ["rec-1"],
    });
    recordStrategicMetric({
      tenantId,
      outcomeId: outcomes[0]!.id,
      label: "On-time delivery",
      currentValue: 80,
      targetValue: 95,
      unit: "percent",
    });

    const links = alignRecommendationToOutcomes({
      tenantId,
      recommendationId: "rec-1",
      title: "Rebalance capacity for at-risk jobs",
      detail: "Operational reliability and delivery risk",
    });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]?.outcomeName).toBeTruthy();
    expect(links[0]?.estimatedContribution).toBeGreaterThan(0);
    expect(links[0]?.expectedImpact).toBeTruthy();
    expect(links[0]?.potentialRisk).toBeTruthy();

    const alignment = buildAlignmentSnapshot({
      tenantId,
      recommendations: [
        {
          id: "rec-1",
          title: "Rebalance capacity for at-risk jobs",
          detail: "operational reliability",
        },
      ],
      decisions: [
        {
          id: "dec-1",
          title: "Approve capacity reallocation",
          detail: "reliability",
        },
      ],
    });
    expect(alignment.recommendationAlignments.length).toBeGreaterThan(0);
    expect(alignment.decisionAlignments.length).toBeGreaterThan(0);
  });

  it("measures progress and validates strategic contribution", () => {
    seedStrategicOutcomesFromDiscovery({
      tenantId,
      profileId: "operations_executive",
      names: ["Improve operational reliability", "Grow profitable revenue"],
    });
    const progress = measureStrategicProgress({ tenantId });
    expect(progress.overallProgressPct).toBeGreaterThanOrEqual(0);
    const validation = validateStrategicAlignment({
      tenantId,
      recommendations: [
        { id: "r1", title: "Improve reliability via capacity", detail: "ops" },
      ],
    });
    expect(validation.explanation).toContain("progress");
    expect(validation.confidence).toBeGreaterThan(0);
  });

  it("seeds outcomes from Executive Discovery questions", () => {
    let session = createDiscoverySession({
      tenantId,
      userId: "user-1",
    });
    session = submitMinimumQuestions(session, {
      role: "CEO",
      primaryObjective: "Operational Excellence",
      briefingTime: "Morning",
      strategicOutcomes: [
        "Improve operational reliability",
        "Reduce delivery risk",
        "Build scalable capacity",
      ],
    });
    expect(session.questions?.strategicOutcomes).toHaveLength(3);
    expect(listStrategicOutcomes(tenantId)).toHaveLength(3);
  });

  it("attaches strategy fields to Today recommendations and Council", () => {
    seedStrategicOutcomesFromDiscovery({
      tenantId,
      profileId: "operations_executive",
      names: [
        "Improve operational reliability",
        "Strengthen strategic customer retention",
      ],
    });
    const snapshot = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    const withStrategy = attachStrategicOutcomesToTodayActions(
      snapshot,
      tenantId,
      "operations_executive",
    );
    expect(withStrategy.recommendedActions.length).toBeGreaterThan(0);
    for (const action of withStrategy.recommendedActions) {
      expect(action.supportsOutcome).toBeTruthy();
      expect(action.expectedImpact).toBeTruthy();
      expect(typeof action.strategyConfidence).toBe("number");
      expect(typeof action.estimatedContribution).toBe("number");
      expect(action.potentialRisk).toBeTruthy();
    }

    const withCouncil = attachStrategicOutcomesToCouncil(withStrategy, tenantId);
    if (withCouncil.executiveCouncil) {
      for (const p of withCouncil.executiveCouncil.perspectives) {
        expect(p.strategicOutcomeContributions?.length).toBeGreaterThan(0);
      }
    }
  });

  it("builds admin dashboard and refines outcomes without Core changes", () => {
    const seeded = seedStrategicOutcomesFromDiscovery({
      tenantId,
      profileId: "operations_executive",
      names: ["Improve operational reliability"],
    });
    refineStrategicOutcomeFromSignals({
      id: seeded[0]!.id,
      evidence: ["Observed capacity rebalance success"],
      health: "on_track",
      confidenceDelta: 5,
    });
    const dashboard = buildStrategyDashboard({
      tenantId,
      recommendations: [
        { id: "r1", title: "Capacity rebalance", detail: "reliability" },
      ],
    });
    expect(dashboard.outcomes[0]?.currentHealth).toBe("on_track");
    expect(dashboard.validation.outcomeProgress).toBeGreaterThanOrEqual(0);
    assertStrategyPayload(dashboard.progress as unknown as Record<string, unknown>);
  });

  it("adds new outcomes without Core changes", () => {
    upsertStrategicOutcome({
      tenantId,
      name: "Board-ready operating cadence",
      profileId: "operations_executive",
      source: "manual",
    });
    expect(
      listStrategicOutcomes(tenantId).some((o) =>
        o.name.includes("Board-ready"),
      ),
    ).toBe(true);
  });
});
