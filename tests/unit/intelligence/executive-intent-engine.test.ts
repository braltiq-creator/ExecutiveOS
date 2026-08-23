import { describe, expect, it } from "vitest";
import {
  calculateAttentionPriority,
  calculateStrategicAlignment,
  generateIntentNarrative,
  getExecutiveIntent,
  getExecutiveIntentForRole,
  recommendDelegation,
  scoreAgainstIntent,
} from "@/intelligence/executive-intent";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

describe("Executive Intent Engine", () => {
  const ceo = getExecutiveIntent();

  it("loads CEO intent with weighted priorities", () => {
    expect(ceo.role).toBe("CEO");
    expect(ceo.strategicPriorities[0]?.title).toMatch(/Enterprise ARR/i);
    expect(ceo.strategicPriorities[0]?.weight).toBe(95);
    expect(ceo.riskAppetite).toBe("balanced");
    expect(ceo.delegationStyle).toBe("selective");
  });

  it("scores Helix Decision as high alignment for CEO", () => {
    const score = scoreAgainstIntent(ceo, {
      id: "decision-residency",
      kind: "decision",
      label: "Helix residency",
      outcomeIds: ["outcome-enterprise-arr", "outcome-board"],
      businessImportance: 88,
      themes: ["growth", "governance"],
    });

    expect(score.alignment).toBe("high");
    expect(score.alignmentLabel).toBe("High Alignment");
    expect(score.matchedPriorities.length).toBeGreaterThan(0);
    expect(score.attentionPriority).toBeGreaterThan(70);
    expect(calculateStrategicAlignment(ceo, {
      id: "decision-residency",
      kind: "decision",
      label: "Helix",
      outcomeIds: ["outcome-enterprise-arr"],
      businessImportance: 88,
    })).toBe("high");
  });

  it("blends business importance with intent", () => {
    const blended = calculateAttentionPriority(90, 40, "low");
    const boosted = calculateAttentionPriority(90, 90, "high");
    const conflicted = calculateAttentionPriority(90, 40, "conflicts");
    expect(boosted).toBeGreaterThan(blended);
    expect(conflicted).toBeLessThan(blended);
  });

  it("recommends delegation for medium-alignment work", () => {
    const advice = recommendDelegation(ceo, {
      id: "decision-forum",
      kind: "decision",
      label: "Merge forums",
      outcomeIds: ["outcome-efficiency"],
      businessImportance: 55,
      estimatedMinutes: 8,
    });
    expect(["delegate", "keep", "schedule", "escalate"]).toContain(advice.act);
    expect(advice.reason.length).toBeGreaterThan(10);
  });

  it("generates priority-centred narrative", () => {
    const scores = [
      scoreAgainstIntent(ceo, {
        id: "decision-residency",
        kind: "decision",
        label: "Helix",
        outcomeIds: ["outcome-enterprise-arr"],
        businessImportance: 90,
      }),
    ];
    const narrative = generateIntentNarrative(ceo, scores);
    expect(narrative.sinceYesterdayLens).toMatch(/YOUR priorities/i);
    expect(narrative.priorityLens).toMatch(/Enterprise ARR/i);
    expect(narrative.morningFocus.length).toBeGreaterThan(20);
  });

  it("provides distinct profiles per role", () => {
    const coo = getExecutiveIntentForRole("COO");
    const cfo = getExecutiveIntentForRole("CFO");
    expect(coo.strategicPriorities[0]?.title).toMatch(/operating|Meeting|cadence/i);
    expect(cfo.riskAppetite).toBe("conservative");
    expect(cfo.preferences.decision.biasTowardAction).toBeLessThan(
      ceo.preferences.decision.biasTowardAction,
    );
  });

  it("personalises the Intelligent snapshot for the CEO", () => {
    const intelligent = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
    const helix = intelligent.decisions.find((d) => d.id === "decision-residency");
    expect(helix?.strategicAlignment.level).toBe("high");
    expect(helix?.strategicAlignment.label).toBe("High Alignment");
    expect(intelligent.narrative.executiveSummary).toMatch(/priorit/i);
    expect(intelligent.narrative.sinceYesterday[0]?.sentence).toMatch(
      /YOUR priorities|Helix|priority/i,
    );
    expect(
      intelligent.recommendations.every((rec) => rec.strategicAlignment.label),
    ).toBe(true);
    expect(
      intelligent.outcomes.every((outcome) => outcome.strategicAlignment),
    ).toBe(true);
  });
});
