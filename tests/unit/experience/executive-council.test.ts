import { describe, expect, it } from "vitest";
import {
  EXECUTIVE_COUNCIL,
  buildExecutiveCouncilView,
  councilMemberIds,
} from "@/experience/executive-council";
import type { Decision } from "@/lib/decisions/engine-types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import type { LoopImpactRecord } from "@/experience/executive-loop/types";

function makeDecision(): Decision {
  return {
    id: "d-high",
    question: "Should we approve the enterprise residency exception?",
    outcomeIds: ["so-arr"],
    status: "due_today",
    owner: "CEO",
    deadline: "Today",
    confidence: 78,
    businessImpact: "Protects enterprise ARR this quarter",
    expectedOutcomeImpact: "ARR health recovers",
    costOfDelay: "Each day compounds commercial risk",
    whatChanged: "Pipeline pressure increased",
    why: "Judgement unlocks commercial relationship",
    whatShouldHappenNext: "Approve preferred path",
    stakeholders: [],
    evidence: [],
    alternatives: [],
    tradeOffs: [],
    relationships: [],
    timeline: [],
    history: [],
    approvalWorkflow: [],
    recommendationSummary: "Approve to improve Organisation Health",
  };
}

function snapshot(): ExecutiveSnapshot {
  return {
    greeting: "Good morning, Alex",
    asOf: "2026-07-27T09:12:00.000Z",
    pulse: {
      level: "attention",
      label: "Attention required",
      why: "Enterprise growth is beginning to drift.",
      confidence: 74,
      aiConfidence: 70,
      refreshedAt: "2026-07-27T09:12:00.000Z",
      refreshedLabel: "Updated 9:12am",
      href: "/today",
    },
    compass: { dimensions: [] },
    executiveState: {
      decisionLoad: "moderate",
      capacity: "constrained",
      attentionBudget: "focused",
      summary: "Capacity constrained",
      href: "/today",
    },
    outcomes: [],
    metrics: [],
    sinceYesterday: [],
    priorityDecisions: [
      {
        id: "d-high",
        title: "Should we approve the enterprise residency exception?",
        href: "/decisions/d-high",
        owner: "CEO",
        decisionTimeLabel: "Today",
        businessImpact: "Protect ARR",
      },
    ],
    recommendedActions: [],
  } as unknown as ExecutiveSnapshot;
}

function outcomes(): StrategicOutcome[] {
  return [
    {
      id: "so-arr",
      name: "Increase Enterprise ARR",
      description: "Grow profitable enterprise revenue",
      currentHealth: "at_risk",
      executiveOwner: "CRO",
      confidence: 68,
      evidence: ["Forecast soft"],
      strategicImportance: "critical",
      successMeasures: [],
      supportingKpis: [],
      businessCapabilities: [],
      targetDate: null,
      updatedAt: "2026-07-27T08:00:00.000Z",
    } as unknown as StrategicOutcome,
  ];
}

describe("executive-council", () => {
  it("defines the permanent five-member leadership team", () => {
    expect(EXECUTIVE_COUNCIL).toHaveLength(5);
    expect(councilMemberIds()).toEqual(["ceo", "cfo", "coo", "cro", "cso"]);
    expect(EXECUTIVE_COUNCIL.every((m) => m.decisionFramework.length > 0)).toBe(
      true,
    );
    expect(
      EXECUTIVE_COUNCIL.every((m) => m.questionsBeforeRecommend.length >= 2),
    ).toBe(true);
    expect(
      EXECUTIVE_COUNCIL.every((m) => m.monitoringDomains.length >= 2),
    ).toBe(true);
  });

  it("builds role perspectives, consensus, and learning", () => {
    const loop: LoopImpactRecord = {
      decisionId: "d-high",
      decisionTitle: "Should we approve the enterprise residency exception?",
      approvedAt: "2026-07-26T16:00:00.000Z",
      healthBefore: 68,
      healthAfter: 72,
      confidenceBefore: 70,
      confidenceAfter: 78,
      predictedHealthDelta: 3,
      actualHealthDelta: 4,
      predictedValueAud: 120000,
      actualValueAud: 135000,
      commercialBefore: "Watch",
      commercialAfter: "Improving",
    };

    const view = buildExecutiveCouncilView({
      snapshot: snapshot(),
      strategicOutcomes: outcomes(),
      decisions: [makeDecision()],
      selectedDecisionId: "d-high",
      loopImpacts: [loop],
    });

    expect(view.opinions).toHaveLength(5);
    expect(view.opinions.every((o) => o.reasoning.length > 10)).toBe(true);
    expect(view.opinions.every((o) => o.suggestedAction.length > 0)).toBe(true);
    expect(view.consensus.agreementPct).toBeGreaterThan(0);
    expect(view.consensus.recommendedDecision.length).toBeGreaterThan(0);
    expect(view.brief.headline.length).toBeGreaterThan(0);
    expect(view.outcomeName).toBe("Increase Enterprise ARR");
    expect(view.learning?.confidenceAdjustment).toMatch(/\+|Unchanged|-/);
  });

  it("proactively raises observations and evolves them through collaboration", () => {
    const view = buildExecutiveCouncilView({
      snapshot: snapshot(),
      strategicOutcomes: outcomes(),
      decisions: [makeDecision()],
      selectedDecisionId: "d-high",
    });

    expect(view.agency.observations.length).toBeGreaterThan(0);
    expect(view.agency.briefingObservations.length).toBeLessThanOrEqual(3);
    expect(view.agency.briefingObservations[0]?.raisedBy.length).toBeGreaterThan(
      0,
    );
    expect(view.agency.briefingObservations[0]?.discussionHref).toContain(
      "council-discussion",
    );
    expect(view.agency.collaborations.length).toBeGreaterThan(0);
    expect(
      view.agency.collaborations.every((c) => c.stanceLabel.length > 0),
    ).toBe(true);
    expect(view.agency.agencyConsensus.recommendedJudgement.length).toBeGreaterThan(
      0,
    );
    expect(view.agency.agencyConsensus.remainingUncertainty.length).toBeGreaterThan(
      0,
    );
  });
});
