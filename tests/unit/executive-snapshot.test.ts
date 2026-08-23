import { describe, expect, it } from "vitest";
import {
  clipNarrative,
  deriveExecutiveSnapshot,
} from "@/lib/snapshot/derive-executive-snapshot";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { applyDecisionAct } from "@/lib/decisions/apply-decision-act";

describe("deriveExecutiveSnapshot", () => {
  it("builds a signature Command Centre model", () => {
    const snapshot = deriveExecutiveSnapshot(MOCK_OUTCOME_PORTFOLIO);

    expect(snapshot.greeting).toMatch(/Good morning/i);
    expect(snapshot.pulse.why.length).toBeGreaterThan(20);
    expect(snapshot.pulse.why.endsWith(".")).toBe(true);
    expect(snapshot.compass.dimensions).toHaveLength(4);
    expect(snapshot.compass.dimensions.map((d) => d.id)).toEqual([
      "focus",
      "risk",
      "opportunity",
      "capacity",
    ]);
    expect(snapshot.executiveState.summary.length).toBeGreaterThan(20);
    expect(snapshot.outcomes[0].momentumLabel).toBeTruthy();
    expect(snapshot.sinceYesterday.length).toBeGreaterThan(0);
    expect(snapshot.sinceYesterday.length).toBeLessThanOrEqual(3);
    expect(snapshot.metrics.filter((m) => m.emphasis)).toHaveLength(1);
    expect(snapshot.priorityDecisions[0].title.length).toBeGreaterThan(40);
  });

  it("updates pulse why after Helix approval", () => {
    const { portfolio } = applyDecisionAct(MOCK_OUTCOME_PORTFOLIO, {
      decisionId: "decision-residency",
      act: "approve",
      actor: "Alex Rivera, CEO",
    });
    const snapshot = deriveExecutiveSnapshot(portfolio);
    expect(snapshot.pulse.why).toMatch(/Helix judgement is recorded/i);
    expect(
      snapshot.priorityDecisions.some(
        (decision) => decision.id === "decision-residency",
      ),
    ).toBe(false);
  });
});

describe("clipNarrative", () => {
  it("caps at 60 words", () => {
    const long = Array.from({ length: 80 }, (_, i) => `word${i}`).join(" ");
    const clipped = clipNarrative(long, 60);
    expect(clipped.trim().split(/\s+/).length).toBeLessThanOrEqual(61);
  });
});
