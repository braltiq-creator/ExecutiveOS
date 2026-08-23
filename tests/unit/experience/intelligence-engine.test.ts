import { describe, expect, it } from "vitest";
import {
  buildExecutiveIntelligenceView,
  buildIntelligenceScore,
  buildJudgementQueue,
  intelligenceScoreToKpi,
} from "@/experience/intelligence-engine/derive";
import type { Decision } from "@/lib/decisions/engine-types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import type { LoopImpactRecord } from "@/experience/executive-loop/types";

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
    alternatives: [
      {
        id: "alt-1",
        label: "Defer one week",
        summary: "Wait for more pipeline data",
        upside: "More certainty",
        downside: "Cost of delay rises",
      },
    ],
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
    outcomes: [
      {
        id: "o1",
        name: "Enterprise growth",
        status: "at_risk",
        movementLabel: "Softening",
        href: "/strategy",
      },
    ],
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
        supportsOutcome: "Enterprise growth",
      },
      {
        id: "a2",
        title: "Contain renewal risk",
        why: "Concentration elevated",
        potentialRisk: "Renewal concentration",
        href: "/decisions/a2",
      },
    ],
  } as unknown as ExecutiveSnapshot;
}

describe("intelligence-engine", () => {
  it("builds an explained intelligence score", () => {
    const score = buildIntelligenceScore({
      snapshot: snapshot(),
      decisions: [makeDecision("d-high", 88)],
      strategicOutcomes: [],
    });

    expect(score.overall).toBeGreaterThan(40);
    expect(score.confidence).toBeGreaterThan(0);
    expect(score.evidenceCoverage).toBeGreaterThan(0);
    expect(score.evidenceFreshness).toBeGreaterThan(0);
    expect(score.recommendationQuality).toBeGreaterThan(0);
    expect(score.dataQuality).toBe(70);
    expect(score.explanation.length).toBeGreaterThan(20);
    expect(intelligenceScoreToKpi(score).id).toBe("executive_intelligence");
  });

  it("ranks judgement queue and caps at five", () => {
    const queue = buildJudgementQueue({
      snapshot: snapshot(),
      decisions: [
        makeDecision("d-high", 88),
        makeDecision("d-low", 55),
      ],
      strategicOutcomes: [
        {
          id: "so-1",
          name: "Grow profitable revenue",
          description: "Protect enterprise expansion",
          currentHealth: "at_risk",
          confidence: 68,
          evidence: ["Forecast soft"],
        } as StrategicOutcome,
      ],
    });

    expect(queue.length).toBeGreaterThan(0);
    expect(queue.length).toBeLessThanOrEqual(5);
    expect(queue[0]!.rankScore).toBeGreaterThanOrEqual(queue.at(-1)!.rankScore);
    expect(queue[0]!.reasoning.whyMatters.length).toBeGreaterThan(0);
    expect(queue[0]!.recommendedAction.length).toBeGreaterThan(0);
    expect(queue.every((q) => q.href.startsWith("/"))).toBe(true);
  });

  it("synthesises summary, queue, and learning timeline", () => {
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

    const view = buildExecutiveIntelligenceView({
      snapshot: snapshot(),
      decisions: [makeDecision("d-high", 88)],
      strategicOutcomes: [],
      loopImpacts,
    });

    expect(view.summary.bullets.length).toBeGreaterThanOrEqual(3);
    expect(view.summary.closing).toMatch(/judgement is required/i);
    expect(view.brief.judgementCount).toBeGreaterThan(0);
    expect(view.brief.href).toContain("from=intelligence");
    expect(view.queue.length).toBeGreaterThan(0);
    expect(view.stream.length).toBeGreaterThan(0);
    expect(view.timeline.some((t) => t.kind === "decision")).toBe(true);
    expect(view.timeline.some((t) => t.kind === "judgement")).toBe(true);
    expect(view.score.trend).toBe("up");
    expect(view.score.href).toBe("/knowledge?from=intelligence");
  });
});
