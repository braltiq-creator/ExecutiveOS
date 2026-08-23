import { describe, expect, it, beforeEach } from "vitest";
import {
  applyLoopToFeed,
  applyLoopToKpis,
  applyLoopToPulse,
  buildLoopMemory,
  recordLoopApproval,
  resetLoopStore,
  getLoopState,
  getImpactForDecision,
} from "@/experience/executive-loop";
import type { McActivityItem, McKpi, McPulse } from "@/experience/mission-control/types";

beforeEach(() => {
  resetLoopStore();
});

describe("executive-loop", () => {
  it("records approval and builds organisational events", () => {
    const impact = recordLoopApproval({
      decisionId: "decision-residency",
      decisionTitle: "Approve Helix residency exception?",
      actor: "CEO",
      healthBefore: 69,
      confidenceBefore: 74,
    });

    expect(impact.healthAfter).toBe(74);
    expect(impact.actualValueAud).toBe(420_000);

    const state = getLoopState();
    expect(state.feedEvents.length).toBeGreaterThanOrEqual(4);
    expect(state.pendingCeremony?.decisionId).toBe("decision-residency");
    expect(state.changedKpiIds).toContain("organisation_health");
    expect(getImpactForDecision("decision-residency")?.decisionTitle).toContain(
      "Helix",
    );
  });

  it("applies loop overlays to Mission Control models", () => {
    recordLoopApproval({
      decisionId: "d1",
      decisionTitle: "Pricing Strategy",
      actor: "CEO",
      healthBefore: 69,
    });

    const kpis: McKpi[] = [
      {
        id: "organisation_health",
        label: "Organisation Health",
        value: "69",
        status: "Steady",
        trend: "flat",
        severity: "neutral",
        confidence: 70,
        href: "/strategy",
      },
      {
        id: "executive_value",
        label: "Executive Value",
        value: "$10000",
        status: "Steady",
        trend: "flat",
        severity: "neutral",
        confidence: 70,
        href: "/reports",
      },
      {
        id: "priority_decisions",
        label: "Priority Decisions",
        value: "3",
        status: "Waiting",
        trend: "flat",
        severity: "warning",
        confidence: 80,
        href: "/decisions",
      },
      {
        id: "commercial_health",
        label: "Commercial Health",
        value: "Watch",
        status: "Focus",
        trend: "down",
        severity: "warning",
        confidence: 70,
        href: "/strategy",
      },
    ];

    const next = applyLoopToKpis(kpis, getLoopState());
    expect(next.find((k) => k.id === "organisation_health")?.value).toBe("74");
    expect(next.find((k) => k.id === "organisation_health")?.changed).toBe(true);
    expect(next.find((k) => k.id === "priority_decisions")?.value).toBe("2");

    const pulse: McPulse = {
      headline: "Organisation Watching",
      confidence: 70,
      signals: [],
    };
    const nextPulse = applyLoopToPulse(pulse, getLoopState());
    expect(nextPulse.headline).toContain("Improving");
    expect(nextPulse.signals[0]?.text).toMatch(/Yesterday/);

    const feed: McActivityItem[] = [
      {
        id: "old",
        at: "2026-07-26T08:00:00.000Z",
        timeLabel: "08:00",
        headline: "Older event",
        href: "/knowledge",
      },
    ];
    const nextFeed = applyLoopToFeed(feed, getLoopState());
    expect(nextFeed[0]?.headline).toMatch(/approved|Health|Commercial|Value|Confidence/i);
    expect(nextFeed[0]?.highlight).toBe(true);

    const memory = buildLoopMemory(getLoopState());
    expect(memory?.yesterday[0]?.decisionTitle).toMatch(/approved/);
    expect(memory?.today.some((t) => t.label === "Executive Value")).toBe(true);
  });
});
