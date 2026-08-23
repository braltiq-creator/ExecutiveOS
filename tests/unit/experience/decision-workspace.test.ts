import { describe, expect, it } from "vitest";
import {
  buildDecisionWorkspaceView,
  parseDecisionEntry,
  resolveDecisionFocus,
} from "@/experience/decision-workspace/derive";
import type { Decision } from "@/lib/decisions/engine-types";
import type { Outcome } from "@/lib/outcomes/types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";

function makeDecision(id: string, confidence: number): Decision {
  return {
    id,
    question: `Should we approve ${id}?`,
    outcomeIds: ["outcome-enterprise-arr"],
    status: "due_today",
    owner: "CEO",
    deadline: "Today",
    confidence,
    businessImpact: "Protects enterprise ARR this quarter",
    expectedOutcomeImpact: "ARR health recovers",
    costOfDelay: "Each day compounds commercial risk",
    whatChanged: "Pipeline pressure increased overnight",
    why: "Judgement unlocks commercial relationship",
    whatShouldHappenNext: "Approve preferred path",
    stakeholders: [
      {
        id: "s1",
        name: "Alex",
        role: "CEO",
        stance: "approver",
        note: "Owns the call",
      },
    ],
    evidence: [
      {
        id: "e1",
        title: "CRO note",
        source: "CRO",
        summary: "Commercial clock is real",
        asOf: "2026-07-27",
      },
    ],
    alternatives: [],
    tradeOffs: [],
    relationships: [],
    timeline: [
      {
        id: "t1",
        at: "2026-07-27T08:00:00.000Z",
        title: "Opened",
        detail: "Decision raised",
        kind: "opened",
      },
    ],
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
    compass: {
      dimensions: [
        { id: "focus", label: "Focus", strength: 60, direction: "steady" },
        { id: "risk", label: "Risk", strength: 55, direction: "rising" },
        {
          id: "opportunity",
          label: "Opportunity",
          strength: 50,
          direction: "steady",
        },
        {
          id: "capacity",
          label: "Capacity",
          strength: 40,
          direction: "falling",
        },
      ],
    },
    executiveState: {
      decisionLoad: "moderate",
      capacity: "constrained",
      attentionBudget: "focused",
      summary: "Capacity constrained",
      href: "/today",
    },
    outcomes: [],
    metrics: [],
    sinceYesterday: [
      { id: "u1", sentence: "Signal overnight", href: "/knowledge" },
    ],
    priorityDecisions: [
      {
        id: "d-high",
        title: "Should we approve d-high?",
        href: "/decisions/d-high",
        owner: "CEO",
        decisionTimeLabel: "Today",
        businessImpact: "Protect ARR",
      },
    ],
    recommendedActions: [],
  } as ExecutiveSnapshot;
}

describe("decision-workspace derive", () => {
  it("maps entry context to focus sections", () => {
    expect(parseDecisionEntry("priority_decisions")).toBe("priority_decisions");
    expect(resolveDecisionFocus("critical_risks")).toBe("impact-simulator");
    expect(resolveDecisionFocus("strategy_outcomes")).toBe("related-strategy");
    expect(resolveDecisionFocus("priority_decisions")).toBe("highest-impact");
  });

  it("ranks portfolio and builds impact simulator", () => {
    const decisions = [
      makeDecision("d-low", 55),
      makeDecision("d-high", 88),
    ];
    const outcomes: Outcome[] = [
      {
        id: "outcome-enterprise-arr",
        name: "Enterprise ARR",
        status: "at_risk",
        healthScore: 48,
      } as Outcome,
    ];

    const view = buildDecisionWorkspaceView({
      decisions,
      snapshot: snapshot(),
      outcomes,
      strategicOutcomes: [],
      entryFrom: "priority_decisions",
    });

    expect(view.portfolio[0]?.id).toBe("d-high");
    expect(view.simulator?.organisationHealth.after).toBeGreaterThan(
      view.simulator!.organisationHealth.before,
    );
    expect(view.evidence.length).toBeGreaterThan(0);
    expect(view.relatedStrategy[0]?.outcomeName).toBe("Enterprise ARR");
    expect(view.timeline.length).toBeGreaterThan(0);
    expect(view.focusSection).toBe("highest-impact");
  });
});
