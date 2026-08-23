import { describe, expect, it } from "vitest";
import {
  buildActivityFeed,
  buildExecutivePulse,
  buildMissionKpis,
  buildSnapshotCards,
  missionHeaderModel,
} from "@/experience/mission-control/derive";
import { openActionLabel } from "@/experience/icons";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";

function minimalSnapshot(
  patch: Partial<ExecutiveSnapshot> = {},
): ExecutiveSnapshot {
  return {
    greeting: "Good morning, Alex",
    asOf: "2026-07-27T09:12:00.000Z",
    pulse: {
      level: "improving",
      label: "Improving",
      why: "Commercial capacity is stabilising overnight after renewal pressure eased across the enterprise book.",
      confidence: 78,
      aiConfidence: 72,
      refreshedAt: "2026-07-27T09:12:00.000Z",
      refreshedLabel: "Updated 9:12am",
      href: "/today",
    },
    compass: {
      dimensions: [
        { id: "focus", label: "Focus", strength: 70, direction: "rising" },
        { id: "risk", label: "Risk", strength: 40, direction: "falling" },
        {
          id: "opportunity",
          label: "Opportunity",
          strength: 65,
          direction: "rising",
        },
        {
          id: "capacity",
          label: "Capacity",
          strength: 55,
          direction: "steady",
        },
      ],
    },
    executiveState: {
      decisionLoad: "moderate",
      capacity: "available",
      attentionBudget: "focused",
      summary: "Capacity available for priority decisions this morning.",
      href: "/today",
    },
    outcomes: [
      {
        id: "o1",
        name: "Enterprise growth",
        status: "on_track",
        movementLabel: "Holding",
        href: "/strategy",
      },
      {
        id: "o2",
        name: "Renewals",
        status: "at_risk",
        movementLabel: "Softening",
        href: "/strategy",
      },
    ],
    metrics: [],
    sinceYesterday: [
      {
        id: "u1",
        sentence: "Revenue forecast increased 4%",
        href: "/reports",
      },
      {
        id: "u2",
        sentence: "Customer renewal approved",
        href: "/knowledge",
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
        supportsOutcome: "Enterprise growth",
      },
      {
        id: "a2",
        title: "Review commercial risk",
        why: "Renewal concentration is elevated.",
        expectedOutcome: "Contain risk",
        potentialRisk: "Commercial risk detected",
        href: "/decisions/a2",
      },
    ],
    ...patch,
  } as ExecutiveSnapshot;
}

describe("mission-control derive", () => {
  it("builds nine actionable KPIs with semantic severity", () => {
    const kpis = buildMissionKpis({
      snapshot: minimalSnapshot(),
      strategicOutcomes: [],
      monthlyValue: 59000,
      valueTrend: "up",
      valueConfidence: 81,
    });

    expect(kpis).toHaveLength(9);
    expect(kpis[0]?.id).toBe("organisation_health");
    expect(kpis[0]?.severity).toBeTruthy();
    expect(kpis[0]?.href).toContain("from=organisation_health");
    expect(kpis.find((k) => k.id === "executive_value")?.href).toBe("/reports");
    expect(kpis.find((k) => k.id === "commercial_health")?.href).toContain(
      "from=commercial_health",
    );
    expect(kpis.find((k) => k.id === "priority_decisions")?.value).toBe("1");
    expect(kpis.find((k) => k.id === "priority_decisions")?.href).toContain(
      "from=priority_decisions",
    );
    expect(kpis.find((k) => k.id === "critical_risks")?.href).toContain(
      "from=critical_risks",
    );
    expect(kpis.every((k) => k.href.startsWith("/"))).toBe(true);
  });

  it("caps Executive Priorities at five cards with Open →", () => {
    const cards = buildSnapshotCards({ snapshot: minimalSnapshot() });
    expect(cards.length).toBeLessThanOrEqual(5);
    expect(cards[0]?.headline).toBe("Lead Judgement");
    expect(cards.every((c) => c.cta === "Open →")).toBe(true);
    expect(cards[0]?.sentence.split(/\s+/).length).toBeLessThanOrEqual(16);
  });

  it("builds Executive Pulse orientation line", () => {
    const pulse = buildExecutivePulse({
      snapshot: minimalSnapshot(),
      valueTrend: "up",
    });
    expect(pulse.headline).toMatch(/Organisation/);
    expect(pulse.confidence).toBe(78);
    expect(pulse.signals.length).toBeGreaterThan(0);
    expect(pulse.signals.length).toBeLessThanOrEqual(4);
  });

  it("orders activity feed newest first with open destinations", () => {
    const feed = buildActivityFeed(minimalSnapshot());
    expect(feed.length).toBeGreaterThan(0);
    for (let i = 1; i < feed.length; i += 1) {
      expect(feed[i - 1]!.at >= feed[i]!.at).toBe(true);
    }
    expect(feed.every((item) => item.href.startsWith("/"))).toBe(true);
  });

  it("extracts mission header model from greeting", () => {
    const header = missionHeaderModel(minimalSnapshot());
    expect(header.name).toBe("Alex");
    expect(header.health).toBeGreaterThan(0);
    expect(header.refreshedLabel).toContain("Updated");
  });

  it("keeps consistent Open action language", () => {
    expect(openActionLabel("/strategy")).toBe("Open Strategy →");
    expect(openActionLabel("/decisions/d1")).toBe("Open Decisions →");
    expect(openActionLabel("/knowledge")).toBe("Open Knowledge →");
    expect(openActionLabel("/reports")).toBe("Open Reports →");
    expect(openActionLabel("/calendar")).toBe("Open →");
  });
});
