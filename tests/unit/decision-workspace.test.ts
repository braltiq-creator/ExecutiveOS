import { describe, expect, it } from "vitest";
import { MOCK_DECISIONS } from "@/lib/decisions/mock-decisions";
import { deriveDecisionWorkspace } from "@/lib/decisions/workspace";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

describe("decision workspace", () => {
  it("derives narrative workspace for Helix residency decision", () => {
    const decision = MOCK_DECISIONS.find(
      (item) => item.id === "decision-residency",
    );
    expect(decision).toBeTruthy();
    const outcomesById = new Map(
      MOCK_OUTCOME_PORTFOLIO.outcomes.map((outcome) => [outcome.id, outcome]),
    );
    const model = deriveDecisionWorkspace(decision!, outcomesById);
    expect(model.title).toContain("Helix");
    expect(model.outcomeImpacts.length).toBeGreaterThanOrEqual(1);
    expect(model.evidence.length).toBeGreaterThan(0);
    expect(model.ifWait.length).toBeGreaterThan(0);
    expect(model.ifApprove.length).toBeGreaterThan(0);
    expect(model.ifReject.length).toBeGreaterThan(0);
    expect(model.advisorRecommendation.confidence).toBeGreaterThan(0);
    expect(model.estimatedMinutes).toBeGreaterThanOrEqual(8);
  });
});
