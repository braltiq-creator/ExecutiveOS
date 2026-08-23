import { describe, expect, it } from "vitest";
import { applyDecisionAct } from "@/lib/decisions/apply-decision-act";
import { deriveDecisionQueue, toPriorityDecisions } from "@/lib/decisions/derive";
import { deriveLeadJudgement } from "@/lib/briefing/lead-judgement";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

const ACTOR = "Alex Rivera, CEO";
const HELIX_ID = "decision-residency";

describe("applyDecisionAct", () => {
  it("approves Helix: status, owner history, outcome health, action, leaves urgent list", () => {
    const beforeArr = MOCK_OUTCOME_PORTFOLIO.outcomes.find(
      (outcome) => outcome.id === "outcome-enterprise-arr",
    )!.healthScore;
    const { portfolio, consequence } = applyDecisionAct(MOCK_OUTCOME_PORTFOLIO, {
      decisionId: HELIX_ID,
      act: "approve",
      actor: ACTOR,
      at: "2026-07-20T09:00:00+10:00",
    });

    const decision = portfolio.decisions.find((item) => item.id === HELIX_ID)!;
    expect(decision.status).toBe("approved");
    expect(decision.history.at(-1)?.actor).toBe(ACTOR);
    expect(decision.history.at(-1)?.at).toBe("2026-07-20T09:00:00+10:00");

    const afterArr = portfolio.outcomes.find(
      (outcome) => outcome.id === "outcome-enterprise-arr",
    )!;
    expect(afterArr.healthScore).toBeGreaterThan(beforeArr);
    expect(consequence.actionCreated?.label).toMatch(/workshop/i);

    const urgent = toPriorityDecisions(deriveDecisionQueue(portfolio));
    expect(urgent.some((item) => item.id === HELIX_ID)).toBe(false);

    const summary = deriveLeadJudgement(portfolio).executiveSummary;
    expect(summary).toMatch(/Helix residency is recorded/i);
  });

  it("rejects Helix: updates outcome narrative on linked outcomes", () => {
    const { portfolio, consequence } = applyDecisionAct(MOCK_OUTCOME_PORTFOLIO, {
      decisionId: HELIX_ID,
      act: "reject",
      actor: ACTOR,
    });

    const decision = portfolio.decisions.find((item) => item.id === HELIX_ID)!;
    expect(decision.status).toBe("decided");
    expect(consequence.outcomeUpdates.length).toBeGreaterThan(0);

    const arr = portfolio.outcomes.find(
      (outcome) => outcome.id === "outcome-enterprise-arr",
    )!;
    expect(arr.expectedTrajectory.summary).toMatch(/Full regional deploy/i);
  });

  it("defers Helix: sets review deadline and clears urgency", () => {
    const { portfolio, consequence } = applyDecisionAct(MOCK_OUTCOME_PORTFOLIO, {
      decisionId: HELIX_ID,
      act: "defer",
      actor: ACTOR,
      at: "2026-07-20T09:00:00+10:00",
    });

    const decision = portfolio.decisions.find((item) => item.id === HELIX_ID)!;
    expect(decision.status).toBe("deferred");
    expect(consequence.reviewDeadline).toBeTruthy();
    expect(decision.deadline).toBe(consequence.reviewDeadline);

    const urgent = toPriorityDecisions(deriveDecisionQueue(portfolio));
    expect(urgent.some((item) => item.id === HELIX_ID)).toBe(false);
  });

  it("does not mutate the seed portfolio", () => {
    const seedStatus = MOCK_OUTCOME_PORTFOLIO.decisions.find(
      (item) => item.id === HELIX_ID,
    )!.status;
    applyDecisionAct(MOCK_OUTCOME_PORTFOLIO, {
      decisionId: HELIX_ID,
      act: "approve",
      actor: ACTOR,
    });
    expect(
      MOCK_OUTCOME_PORTFOLIO.decisions.find((item) => item.id === HELIX_ID)!
        .status,
    ).toBe(seedStatus);
  });
});
