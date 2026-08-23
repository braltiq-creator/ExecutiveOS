import { describe, expect, it } from "vitest";
import {
  buildKnowledgeWorkspaceView,
  knowledgeEntryLabel,
  parseKnowledgeEntry,
  resolveKnowledgeFocus,
} from "@/experience/knowledge-workspace/derive";
import type { Decision } from "@/lib/decisions/engine-types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import type { LoopImpactRecord } from "@/experience/executive-loop/types";

function makeDecision(id: string): Decision {
  return {
    id,
    question: `Should we approve ${id}?`,
    outcomeIds: ["outcome-enterprise-arr"],
    status: "due_today",
    owner: "CEO",
    deadline: "Today",
    confidence: 82,
    businessImpact: "Protects enterprise ARR this quarter",
    expectedOutcomeImpact: "ARR health recovers",
    costOfDelay: "Each day compounds commercial risk",
    whatChanged: "Pipeline pressure increased overnight",
    why: "Judgement unlocks commercial relationship",
    whatShouldHappenNext: "Approve preferred path",
    stakeholders: [],
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
    recommendedActions: [
      {
        id: "a1",
        title: "Protect enterprise ARR",
        why: "Commercial drift compounds without a call",
        expectedImpact: "Stabilises Organisation Health",
        expectedOutcome: "ARR recovers",
        evidenceSummary: ["Pipeline coverage soft"],
        href: "/decisions/d-high",
      },
    ],
  } as ExecutiveSnapshot;
}

function outcomes(): StrategicOutcome[] {
  return [
    {
      id: "so-1",
      name: "Grow profitable revenue",
      description: "Protect enterprise expansion",
      currentHealth: "at_risk",
      executiveOwner: "CRO",
      confidence: 68,
      evidence: ["Forecast soft"],
      updatedAt: "2026-07-27T08:00:00.000Z",
    } as StrategicOutcome,
  ];
}

describe("knowledge-workspace derive", () => {
  it("maps entry context to focus sections and labels", () => {
    expect(parseKnowledgeEntry("evidence")).toBe("evidence");
    expect(parseKnowledgeEntry("unknown")).toBe("nav");
    expect(resolveKnowledgeFocus("simulator")).toBe("evidence-stack");
    expect(resolveKnowledgeFocus("impact")).toBe("confidence");
    expect(resolveKnowledgeFocus("memory")).toBe("related-activity");
    expect(knowledgeEntryLabel("strategy")).toMatch(/Strategy/);
  });

  it("builds executive answer, confidence, and evidence stack", () => {
    const loopImpacts: LoopImpactRecord[] = [
      {
        decisionId: "d-high",
        decisionTitle: "Should we approve d-high?",
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
      },
    ];

    const view = buildKnowledgeWorkspaceView({
      snapshot: snapshot(),
      decisions: [makeDecision("d-high")],
      strategicOutcomes: outcomes(),
      loopImpacts,
      entryFrom: "evidence",
    });

    expect(view.question).toMatch(/decision recommended/i);
    expect(view.answer.summary).toMatch(/Trust rests/i);
    expect(view.answer.drivers.length).toBeGreaterThan(0);
    expect(view.confidence.score).toBeGreaterThanOrEqual(74);
    expect(view.confidence.explanation).toMatch(/confidence/i);
    expect(view.evidence.some((e) => e.bucket === "Executive Decisions")).toBe(
      true,
    );
    expect(view.evidence.some((e) => e.bucket === "Strategy")).toBe(true);
    expect(view.relatedStrategy[0]?.title).toBe("Grow profitable revenue");
    expect(view.relatedDecisions.length).toBeGreaterThan(0);
    expect(view.relatedActivity.length).toBeGreaterThan(0);
    expect(view.sources.length).toBeGreaterThan(0);
    expect(view.timeline.some((t) => t.kind === "recommendation")).toBe(true);
    expect(view.focusSection).toBe("evidence-stack");
  });

  it("honours topic override for the executive question", () => {
    const view = buildKnowledgeWorkspaceView({
      snapshot: snapshot(),
      decisions: [],
      strategicOutcomes: [],
      entryFrom: "priority",
      topic: "Why has Organisation Health declined?",
    });

    expect(view.question).toBe("Why has Organisation Health declined?");
    expect(view.focusSection).toBe("executive-question");
  });
});
