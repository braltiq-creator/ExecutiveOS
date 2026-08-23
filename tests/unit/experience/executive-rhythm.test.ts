import { describe, expect, it } from "vitest";
import {
  EXECUTIVE_RHYTHMS,
  buildExecutiveRhythmView,
  resolveCurrentRhythm,
} from "@/experience/executive-rhythm";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import type { CouncilObservation } from "@/experience/executive-council/types";

function snapshot(asOf: string): ExecutiveSnapshot {
  return {
    greeting: "Good morning, Alex",
    asOf,
    pulse: {
      level: "attention",
      label: "Attention required",
      why: "Enterprise growth is beginning to drift.",
      confidence: 74,
      aiConfidence: 70,
      refreshedAt: asOf,
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
        id: "d1",
        title: "Approve capacity rebalance",
        href: "/decisions/d1",
        owner: "COO",
        decisionTimeLabel: "Today",
        businessImpact: "Protect delivery",
      },
      {
        id: "d2",
        title: "Protect enterprise ARR",
        href: "/decisions/d2",
        owner: "CRO",
        decisionTimeLabel: "Today",
        businessImpact: "Protect ARR",
      },
    ],
    recommendedActions: [
      {
        id: "a1",
        title: "Protect pipeline",
        why: "Commercial drift",
        href: "/decisions/d2",
      },
      {
        id: "a2",
        title: "Contain risk",
        why: "Risk",
        potentialRisk: "Renewal concentration",
        href: "/decisions/a2",
      },
    ],
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

describe("executive-rhythm", () => {
  it("defines reusable executive cadences", () => {
    expect(EXECUTIVE_RHYTHMS.length).toBeGreaterThanOrEqual(10);
    expect(
      EXECUTIVE_RHYTHMS.every(
        (r) =>
          r.purpose.length > 0 &&
          r.participants.length > 0 &&
          r.prepMinutes > 0,
      ),
    ).toBe(true);
  });

  it("resolves cadence from organisational date", () => {
    // 2026-07-27 is a Monday → Weekly ELT
    expect(resolveCurrentRhythm("2026-07-27T09:00:00.000Z").id).toBe(
      "weekly_elt",
    );
    expect(resolveCurrentRhythm("2026-07-28T09:00:00.000Z").id).toBe(
      "weekly_sales",
    );
  });

  it("builds awareness, meeting pack, council adaptation, and learning", () => {
    const observations: CouncilObservation[] = [
      {
        id: "obs-cro",
        roleId: "cro",
        raisedBy: "CRO",
        headline: "Commercial pressure on ARR",
        reasoning: "Pipeline soft",
        businessImpact: "Quarterly revenue",
        confidence: 78,
        urgency: "today",
        urgencyLabel: "Today",
        recommendedNextStep: "Open discussion",
        linkedOutcome: "Increase Enterprise ARR",
        linkedOutcomeId: "so-arr",
        linkedDecision: "Protect ARR",
        linkedDecisionHref: "/decisions/d2",
        rankScore: 90,
        discussionHref: "/decisions#council-discussion",
      },
    ];

    const view = buildExecutiveRhythmView({
      snapshot: snapshot("2026-07-27T09:12:00.000Z"),
      strategicOutcomes: outcomes(),
      observations,
    });

    expect(view.awareness.headline).toMatch(/Weekly Executive Leadership/i);
    expect(view.awareness.prepMinutes).toBe(18);
    expect(view.awareness.packHref).toContain("meeting-pack");
    expect(view.pack.discussionSequence.length).toBeGreaterThan(0);
    expect(view.pack.councilFocus.some((f) => f.shortTitle === "CEO")).toBe(
      true,
    );
    expect(view.pack.councilFocus.find((f) => f.roleId === "ceo")?.focus).toMatch(
      /discussion|judgement/i,
    );
    expect(view.learning.preparationQuality.length).toBeGreaterThan(0);
    expect(view.catalog.length).toBe(EXECUTIVE_RHYTHMS.length);
  });
});
