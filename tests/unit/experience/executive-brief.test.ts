import { describe, expect, it } from "vitest";
import { actionToExperienceCard } from "@/experience/executive-brief/actionToCard";
import {
  deriveTodaysFocus,
  focusWorkspaceHref,
} from "@/experience/executive-brief/briefFocus";
import {
  buildLeadJudgementProse,
  clampWords,
  countJudgementAreas,
  estimateReviewMinutes,
  evidenceSourcesLabel,
  parseGreetingName,
} from "@/experience/executive-brief/briefCopy";
import { experienceTheme } from "@/experience/themes";
import { statusToTone } from "@/experience/components/StatusTone";
import type { ExecutiveSnapshot, SnapshotAction } from "@/lib/snapshot/types";

function minimalSnapshot(
  patch: Partial<ExecutiveSnapshot> = {},
): ExecutiveSnapshot {
  return {
    greeting: "Good morning, Alex",
    asOf: "2026-07-27T07:30:00.000Z",
    pulse: {
      level: "attention",
      label: "Attention required",
      why: "Enterprise growth is beginning to drift.",
      confidence: 74,
      aiConfidence: 70,
      refreshedAt: "2026-07-27T07:30:00.000Z",
      refreshedLabel: "Updated 7:30am",
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
    outcomes: [],
    metrics: [],
    sinceYesterday: [
      {
        id: "u1",
        sentence: "One strategic decision today will materially affect Q4.",
        href: "/decisions",
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
        title: "Rebalance field capacity",
        why: "Delivery risk rising",
        expectedOutcome: "Protect SLA",
        href: "/decisions/a1",
      },
    ],
    ...patch,
  };
}

describe("Experience 2.0", () => {
  it("defines the warm light theme contract", () => {
    expect(experienceTheme.canvas).toBe("#F7F8FA");
    expect(experienceTheme.surface).toBe("#FFFFFF");
    expect(experienceTheme.accent).toBe("#3B6EA5");
  });

  it("packages Snapshot v2.2 orientation without Core changes", () => {
    const snapshot = minimalSnapshot();
    expect(parseGreetingName(snapshot.greeting)).toBe("Alex");
    expect(countJudgementAreas(snapshot)).toBeGreaterThanOrEqual(1);
    expect(estimateReviewMinutes(snapshot)).toBeGreaterThanOrEqual(4);
    expect(buildLeadJudgementProse(snapshot)).toMatch(/growth/i);
    expect(evidenceSourcesLabel(snapshot)).toMatch(/Overnight/);
    expect(deriveTodaysFocus(snapshot)).toBe("Commercial");
    expect(focusWorkspaceHref("Commercial")).toBe("/strategy");
    expect(clampWords("one two three", 2)).toBe("one two…");
  });

  it("maps recommendations into five-question executive cards", () => {
    const action: SnapshotAction = {
      id: "a1",
      title: "Rebalance capacity",
      why: "Delivery risk is rising on strategic accounts",
      expectedOutcome: "Protect on-time delivery",
      href: "/decisions/a1",
      supportsOutcome: "Improve operational reliability",
      expectedImpact: "Reduce at-risk jobs this week",
      potentialRisk: "Customer escalation and margin erosion",
      evidence: ["Simpro at-risk jobs", "Calendar overload"],
      strategyConfidence: 72,
      previousSituations: ["Q3 capacity crunch"],
      lessonsLearned: ["Move work earlier in the week"],
    };

    const card = actionToExperienceCard(action);

    expect(card.why).toContain("Delivery risk");
    expect(card.action).toContain("Reduce at-risk");
    expect(card.expectedImpact).toContain("Reduce at-risk");
    expect(card.ignoreRisk).toContain("escalation");
    expect(card.strategicOutcome).toContain("operational reliability");
    expect(card.support).toContain("Evidence");
    expect(card.support).toContain("Memory");
    expect(card.confidence).toBe(72);
  });


  it("maps status strings to calm semantic tones", () => {
    expect(statusToTone("on_track")).toBe("success");
    expect(statusToTone("at_risk")).toBe("attention");
    expect(statusToTone("critical")).toBe("critical");
  });
});
