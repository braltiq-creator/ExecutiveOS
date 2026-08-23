import { describe, expect, it } from "vitest";
import {
  alignDecisionToIntent,
  assertIntentOutcomeRefs,
  buildIntentContext,
  resolveIntentOutcomeSets,
  resolveOutcomeAlignment,
} from "@/lib/intent/derive";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes";

describe("executive intent engine", () => {
  it("requires portfolio intent with valid outcome id refs only", () => {
    expect(MOCK_OUTCOME_PORTFOLIO.intent).toBeDefined();
    assertIntentOutcomeRefs(MOCK_OUTCOME_PORTFOLIO);
  });

  it("classifies outcomes as focused, watching, supporting, or non-focus", () => {
    const intent = MOCK_OUTCOME_PORTFOLIO.intent;
    expect(resolveOutcomeAlignment(intent, "outcome-enterprise-arr")).toBe(
      "focused",
    );
    expect(resolveOutcomeAlignment(intent, "outcome-efficiency")).toBe(
      "focused",
    );
    expect(resolveOutcomeAlignment(intent, "outcome-board")).toBe("watching");
    expect(resolveOutcomeAlignment(intent, "outcome-retention")).toBe(
      "non_focus",
    );

    const sets = resolveIntentOutcomeSets(MOCK_OUTCOME_PORTFOLIO);
    expect(sets.focusOutcomes.map((item) => item.id).sort()).toEqual(
      [...intent.focusOutcomeIds].sort(),
    );
    expect(sets.watchingOutcomes).toHaveLength(1);
    expect(sets.nonFocusOutcomes).toHaveLength(1);
  });

  it("builds briefing context without embedding outcome business state", () => {
    const context = buildIntentContext(MOCK_OUTCOME_PORTFOLIO);
    expect(context.title).toBe(MOCK_OUTCOME_PORTFOLIO.intent.title);
    expect(context.narrative.length).toBeGreaterThan(0);
    expect(context.focusOutcomes.every((item) => item.name.length > 0)).toBe(
      true,
    );
    expect(context.constraints.length).toBeGreaterThan(0);
    expect(context.reviewDate).toBe(MOCK_OUTCOME_PORTFOLIO.intent.reviewDate);
  });

  it("aligns decisions to Intent only via linked outcomes", () => {
    const decision = MOCK_OUTCOME_PORTFOLIO.decisions.find(
      (item) => item.id === "decision-residency",
    );
    expect(decision).toBeDefined();
    if (!decision) return;

    const alignment = alignDecisionToIntent(MOCK_OUTCOME_PORTFOLIO, decision);
    expect(alignment.intentId).toBe(MOCK_OUTCOME_PORTFOLIO.intent.id);
    expect(alignment.intentTitle).toBe(MOCK_OUTCOME_PORTFOLIO.intent.title);
    expect(alignment.viaOutcomeIds.length).toBeGreaterThan(0);
    expect(alignment.alignment).toBe("focused");
    expect(decision).not.toHaveProperty("intentId");
  });
});
