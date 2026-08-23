import { describe, expect, it } from "vitest";
import {
  buildOutcomeImpact,
  buildOutcomePortfolio,
  buildOutcomesEngineView,
  resolveFocusOutcome,
} from "@/experience/outcomes-engine/derive";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import type { LoopImpactRecord } from "@/experience/executive-loop/types";

function outcomes(): StrategicOutcome[] {
  return [
    {
      id: "so-arr",
      name: "Increase Enterprise ARR",
      description: "Grow profitable enterprise revenue",
      currentHealth: "at_risk",
      executiveOwner: "CRO",
      confidence: 68,
      evidence: ["Forecast soft", "Pipeline coverage risk"],
      strategicImportance: "critical",
      successMeasures: ["ARR growth"],
      supportingKpis: ["Pipeline"],
      businessCapabilities: ["Enterprise sales"],
      targetDate: "2026-12-31",
      updatedAt: "2026-07-27T08:00:00.000Z",
    } as unknown as StrategicOutcome,
    {
      id: "so-retention",
      name: "Improve Customer Retention",
      description: "Protect renewals",
      currentHealth: "on_track",
      executiveOwner: "CCO",
      confidence: 82,
      evidence: ["NPS steady"],
      strategicImportance: "high",
      successMeasures: ["Retention rate"],
      supportingKpis: ["Churn"],
      businessCapabilities: [],
      targetDate: null,
      updatedAt: "2026-07-27T08:00:00.000Z",
    } as unknown as StrategicOutcome,
  ];
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
        id: "d1",
        title: "Protect ARR",
        href: "/decisions/d1",
        owner: "CEO",
        decisionTimeLabel: "Today",
        businessImpact: "Protect ARR",
      },
    ],
    recommendedActions: [
      {
        id: "a1",
        title: "Protect enterprise ARR",
        why: "Commercial drift",
        supportsOutcome: "Increase Enterprise ARR",
        supportsOutcomeId: "so-arr",
        href: "/decisions/d1",
      },
    ],
  } as unknown as ExecutiveSnapshot;
}

describe("outcomes-engine", () => {
  it("builds a reusable outcome portfolio", () => {
    const portfolio = buildOutcomePortfolio(outcomes());
    expect(portfolio[0]?.name).toBe("Increase Enterprise ARR");
    expect(portfolio[0]?.owner).toBe("CRO");
    expect(portfolio[0]?.href).toContain("from=strategic_outcomes");
    expect(portfolio[0]?.href).toContain("outcome=");
    expect(portfolio.every((o) => o.confidence > 0)).toBe(true);
  });

  it("resolves focus outcome from at-risk and recommendation links", () => {
    const focus = resolveFocusOutcome({
      outcomes: outcomes(),
      snapshot: snapshot(),
    });
    expect(focus?.id).toBe("so-arr");

    const byId = resolveFocusOutcome({
      outcomes: outcomes(),
      snapshot: snapshot(),
      outcomeId: "so-retention",
    });
    expect(byId?.id).toBe("so-retention");
  });

  it("synthesises context, health, relationships, timeline, and impact", () => {
    const loop: LoopImpactRecord = {
      decisionId: "d1",
      decisionTitle: "Protect ARR",
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

    const view = buildOutcomesEngineView({
      strategicOutcomes: outcomes(),
      snapshot: snapshot(),
      loopImpacts: [loop],
      workspace: "today",
    });

    expect(view.focus?.label).toBe("Current Priority Outcome");
    expect(view.health?.name).toBe("Increase Enterprise ARR");
    expect(view.health?.drivers.length).toBeGreaterThan(0);
    expect(view.relationships.some((r) => r.kind === "Organisation Health")).toBe(
      true,
    );
    expect(view.timeline.some((t) => t.kind === "decision")).toBe(true);
    expect(view.timeline.some((t) => t.kind === "outcome")).toBe(true);
    expect(view.impact?.variance).toMatch(/predicted|On prediction|\+/);

    const impact = buildOutcomeImpact({
      outcome: outcomes()[0]!,
      loopImpact: loop,
    });
    expect(impact.learning.length).toBeGreaterThan(10);
  });
});
