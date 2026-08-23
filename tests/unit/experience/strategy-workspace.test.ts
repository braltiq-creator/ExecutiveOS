import { describe, expect, it } from "vitest";
import {
  buildStrategyWorkspaceModel,
  parseStrategyEntry,
  resolveEntryFocus,
} from "@/experience/strategy-workspace/derive";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategyDashboard } from "@/strategy/framework/types";

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
      summary: "Commercial capacity is becoming constrained.",
      href: "/today",
    },
    outcomes: [
      {
        id: "o1",
        name: "Grow profitable revenue",
        href: "/strategy",
        trend: "down",
        momentum: "drifting",
        momentumLabel: "Drifting",
        movementLabel: "Softening",
        sparkline: [60, 62, 61, 58, 55, 54, 52],
        status: "at_risk",
        lastChange: "Yesterday",
      },
    ],
    metrics: [],
    sinceYesterday: [
      {
        id: "u1",
        sentence: "Revenue forecast increased 4%",
        href: "/reports",
      },
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
    ],
    recommendedActions: [
      {
        id: "a1",
        title: "Protect Q4 enterprise pipeline",
        why: "One decision today protects the quarter.",
        expectedOutcome: "Stabilise forecast",
        expectedImpact: "£120k at stake",
        href: "/decisions/a1",
        potentialRisk: "Commercial concentration",
      },
    ],
  } as ExecutiveSnapshot;
}

function dashboard(): StrategyDashboard {
  return {
    asOf: "2026-07-27T09:12:00.000Z",
    tenantId: "tenant-northline",
    outcomes: [
      {
        id: "so1",
        tenantId: "tenant-northline",
        name: "Grow profitable revenue",
        description: "Protect and expand profitable revenue.",
        executiveOwner: "CEO",
        profileId: "commercial_executive",
        targetDate: null,
        currentHealth: "at_risk",
        confidence: 62,
        successMeasures: ["Gross margin", "Win rate"],
        supportingKpis: [],
        businessCapabilities: [],
        strategicImportance: "critical",
        dependencyIds: [],
        evidence: ["Pipeline concentration"],
        source: "discovery",
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-27T09:12:00.000Z",
      },
      {
        id: "so2",
        tenantId: "tenant-northline",
        name: "Improve operational reliability",
        description: "Stabilise delivery reliability.",
        executiveOwner: "COO",
        profileId: "operations_executive",
        targetDate: null,
        currentHealth: "on_track",
        confidence: 70,
        successMeasures: ["On-time delivery"],
        supportingKpis: [],
        businessCapabilities: [],
        strategicImportance: "high",
        dependencyIds: [],
        evidence: ["Capacity rhythm"],
        source: "discovery",
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-27T09:12:00.000Z",
      },
    ],
    initiatives: [],
    alignment: {
      tenantId: "tenant-northline",
      asOf: "2026-07-27T09:12:00.000Z",
      recommendationAlignments: [
        {
          id: "al1",
          tenantId: "tenant-northline",
          recommendationId: "demo-rec-1",
          recommendationTitle: "Rebalance capacity for at-risk jobs",
          outcomeId: "so2",
          outcomeName: "Improve operational reliability",
          expectedImpact: "Protect delivery reliability",
          confidence: 72,
          evidence: [],
          potentialRisk: "",
          estimatedContribution: 18,
          providerIds: [],
          decisionId: null,
          asOf: "2026-07-27T09:12:00.000Z",
        },
      ],
      decisionAlignments: [],
      driftingInitiatives: [],
      improvingOutcomes: [],
      providerEvidence: [],
      explanation: "Recommendations are partially aligned to outcomes.",
    },
    progress: {
      tenantId: "tenant-northline",
      asOf: "2026-07-27T09:12:00.000Z",
      outcomes: [
        {
          outcomeId: "so1",
          name: "Grow profitable revenue",
          health: "at_risk",
          progressPct: 42,
          confidence: 62,
          initiativeCount: 0,
          recommendationContribution: 10,
        },
      ],
      overallProgressPct: 55,
      explanation: "Overall progress is moderate with one outcome at risk.",
    },
    validation: {
      tenantId: "tenant-northline",
      asOf: "2026-07-27T09:12:00.000Z",
      outcomeProgress: 55,
      recommendationContribution: 18,
      executiveDecisionsLinked: 1,
      businessOutcomesLinked: 2,
      initiativeHealth: 60,
      confidence: 68,
      explanation: "Validation confidence is moderate.",
    },
    metrics: [],
    roadmaps: [],
  };
}

describe("strategy-workspace derive", () => {
  it("maps entry context to focus sections", () => {
    expect(parseStrategyEntry("commercial_health")).toBe("commercial_health");
    expect(resolveEntryFocus("organisation_health").focusSection).toBe(
      "organisation-health",
    );
    expect(resolveEntryFocus("commercial_health")).toEqual({
      focusSection: "business-drivers",
      highlightDriverId: "commercial",
    });
    expect(resolveEntryFocus("strategic_outcomes").focusSection).toBe(
      "outcome-portfolio",
    );
  });

  it("builds a workspace that explains organisation health", () => {
    const model = buildStrategyWorkspaceModel({
      dashboard: dashboard(),
      snapshot: snapshot(),
      entryFrom: "organisation_health",
    });

    expect(model.orgHealth.score).toBeGreaterThan(0);
    expect(model.orgHealth.whyMoved.length).toBeGreaterThan(0);
    expect(model.outcomes.length).toBe(2);
    expect(model.drivers).toHaveLength(6);
    expect(model.drivers.some((d) => d.id === "commercial")).toBe(true);
    expect(model.risks.length).toBeGreaterThan(0);
    expect(model.opportunities.length).toBeGreaterThan(0);
    expect(model.decisions[0]?.href).toContain("/decisions");
    expect(model.knowledge.length).toBeGreaterThan(0);
    expect(model.focusSection).toBe("organisation-health");
  });
});
