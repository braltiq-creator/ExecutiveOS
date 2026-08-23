import { describe, expect, it } from "vitest";
import {
  allocateAttention,
  assessConfidence,
  buildExecutiveSnapshotForUi,
  deriveBusinessPulse,
  deriveDecisionIntelligence,
  deriveExecutiveCapacity,
  deriveOutcomeIntelligence,
  explainGraph,
  runExecutiveIntelligence,
} from "@/intelligence/executive-intelligence";
import { createMockEnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/mock-enterprise-data-provider";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { applyDecisionAct } from "@/lib/decisions/apply-decision-act";

describe("Executive Intelligence Engine", () => {
  it("builds an explainable intelligent snapshot", () => {
    const intelligent = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);

    expect(intelligent.pulse.narrative.length).toBeGreaterThan(20);
    expect(intelligent.pulse.contributingFactors.length).toBeGreaterThanOrEqual(4);
    expect(intelligent.pulse.reasoningGraph.systems.length).toBeGreaterThan(0);
    expect(intelligent.capacity.reasoning.length).toBeGreaterThan(20);
    expect(intelligent.outcomes.length).toBeGreaterThan(0);
    expect(intelligent.outcomes[0]?.confidence.drivers.length).toBeGreaterThan(0);
    expect(intelligent.decisions[0]?.executiveImportance).toBeGreaterThan(0);
    expect(intelligent.recommendations[0]?.expectedBenefit).toBeTruthy();
    expect(intelligent.recommendations[0]?.expectedDownside).toBeTruthy();
    expect(intelligent.narrative.tone).toBe("ceo");
    expect(intelligent.attention.selected.length).toBeGreaterThan(0);
    expect(intelligent.reasoningIndex.pulse).toBeTruthy();
  });

  it("never sorts Decisions purely by date — importance wins", () => {
    const provider = createMockEnterpriseDataProvider(MOCK_OUTCOME_PORTFOLIO);
    const signals = provider.getSignals();
    const decisions = deriveDecisionIntelligence(signals);
    const open = decisions.filter((d) => d.priority !== "resolved");

    expect(open[0]?.id).toBe("decision-residency");
    for (let i = 1; i < open.length; i += 1) {
      expect(open[i - 1]!.executiveImportance).toBeGreaterThanOrEqual(
        open[i]!.executiveImportance,
      );
    }
  });

  it("exposes reproducible confidence ceilings", () => {
    const first = assessConfidence({
      label: "Test",
      dataCompleteness: 80,
      freshnessHours: 6,
      sourceAgreement: 70,
      historicalReliability: 72,
      predictionCertainty: 60,
      aiReasoningConfidence: 66,
    });
    const second = assessConfidence({
      label: "Test",
      dataCompleteness: 80,
      freshnessHours: 6,
      sourceAgreement: 70,
      historicalReliability: 72,
      predictionCertainty: 60,
      aiReasoningConfidence: 66,
    });
    expect(first).toEqual(second);
    expect(first.value).toBeLessThanOrEqual(first.ceiling);
  });

  it("explains pulse after Helix approval", () => {
    const { portfolio } = applyDecisionAct(MOCK_OUTCOME_PORTFOLIO, {
      decisionId: "decision-residency",
      act: "approve",
      actor: "Alex Rivera, CEO",
    });
    const intelligent = runExecutiveIntelligence(portfolio);
    expect(intelligent.pulse.narrative).toMatch(/Helix judgement is recorded/i);
    expect(
      intelligent.decisions.find((d) => d.id === "decision-residency")?.priority,
    ).toBe("resolved");
    expect(explainGraph(intelligent.pulse.reasoningGraph)).toMatch(/Why:/);
  });

  it("presentation adapter keeps Today contract", () => {
    const snapshot = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    expect(snapshot.greeting).toMatch(/Good morning/i);
    expect(snapshot.pulse.why.endsWith(".")).toBe(true);
    expect(snapshot.compass.dimensions).toHaveLength(4);
    expect(snapshot.metrics.filter((m) => m.emphasis)).toHaveLength(1);
    expect(snapshot.priorityDecisions[0]?.title.length).toBeGreaterThan(40);
  });
});

describe("engine isolation", () => {
  it("runs pulse, capacity, outcomes independently", () => {
    const signals = createMockEnterpriseDataProvider(
      MOCK_OUTCOME_PORTFOLIO,
    ).getSignals();
    const pulse = deriveBusinessPulse(signals);
    const capacity = deriveExecutiveCapacity(signals);
    const outcomes = deriveOutcomeIntelligence(signals);
    const decisions = deriveDecisionIntelligence(signals);
    const attention = allocateAttention({
      capacity,
      decisions,
      outcomes,
      recommendations: [],
    });

    expect(pulse.state).toBeTruthy();
    expect(capacity.attentionUnitsRemaining).toBeGreaterThanOrEqual(0);
    expect(outcomes[0]?.healthHistory.length).toBeGreaterThanOrEqual(2);
    expect(attention.budgetMinutes).toBeGreaterThan(0);
  });
});
