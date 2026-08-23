import { describe, expect, it } from "vitest";
import {
  assertDecisionsLinked,
  deriveDecisionQueue,
  toPriorityDecisions,
} from "@/lib/decisions";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes";

describe("decision intelligence engine", () => {
  it("rejects standalone decisions", () => {
    expect(() =>
      assertDecisionsLinked([
        {
          ...MOCK_OUTCOME_PORTFOLIO.decisions[0],
          outcomeIds: [],
        },
      ]),
    ).toThrow(/no outcome links/i);
  });

  it("links every mocked decision to at least one outcome", () => {
    assertDecisionsLinked(MOCK_OUTCOME_PORTFOLIO.decisions);
    const outcomeIds = new Set(
      MOCK_OUTCOME_PORTFOLIO.outcomes.map((outcome) => outcome.id),
    );
    for (const decision of MOCK_OUTCOME_PORTFOLIO.decisions) {
      expect(decision.outcomeIds.length).toBeGreaterThan(0);
      for (const outcomeId of decision.outcomeIds) {
        expect(outcomeIds.has(outcomeId)).toBe(true);
      }
    }
  });

  it("derives a queue and briefing priority projection", () => {
    const queue = deriveDecisionQueue(MOCK_OUTCOME_PORTFOLIO);
    const priority = toPriorityDecisions(queue);
    expect(queue.length).toBe(MOCK_OUTCOME_PORTFOLIO.decisions.length);
    expect(priority.length).toBeGreaterThan(0);
    expect(priority.every((item) => item.outcomeId.length > 0)).toBe(true);
  });

  it("keeps outcome decisionIds aligned with Decision Engine", () => {
    for (const outcome of MOCK_OUTCOME_PORTFOLIO.outcomes) {
      for (const decisionId of outcome.decisionIds) {
        const decision = MOCK_OUTCOME_PORTFOLIO.decisions.find(
          (item) => item.id === decisionId,
        );
        expect(decision).toBeTruthy();
        expect(decision?.outcomeIds.includes(outcome.id)).toBe(true);
      }
    }
  });
});
