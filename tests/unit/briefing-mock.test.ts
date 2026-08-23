import { describe, expect, it } from "vitest";
import {
  deriveBriefingFromPortfolio,
  deriveIntelligenceFromPortfolio,
  MOCK_OUTCOME_PORTFOLIO,
} from "@/lib/outcomes";
import { deriveDecisionQueue } from "@/lib/decisions";
import { deriveMorningNarrative } from "@/lib/briefing/morning-narrative";

describe("outcome + decision engine integration", () => {
  it("includes portfolio outcomes with health scores", () => {
    expect(MOCK_OUTCOME_PORTFOLIO.outcomes.length).toBeGreaterThanOrEqual(3);
    expect(MOCK_OUTCOME_PORTFOLIO.overallScore).toBeGreaterThan(0);
  });

  it("derives intelligence decisions from the Decision Engine store", () => {
    const intelligence = deriveIntelligenceFromPortfolio(MOCK_OUTCOME_PORTFOLIO);
    const queue = deriveDecisionQueue(MOCK_OUTCOME_PORTFOLIO);
    const openIds = new Set(
      queue
        .filter((item) => item.status !== "decided" && item.status !== "approved")
        .map((item) => item.id),
    );
    for (const decision of intelligence.priorityDecisions) {
      expect(openIds.has(decision.id)).toBe(true);
    }
  });

  it("derives briefing decision counts from the same portfolio", () => {
    const briefing = deriveBriefingFromPortfolio(MOCK_OUTCOME_PORTFOLIO);
    expect(briefing.summary.decisionsDueToday).toBeGreaterThanOrEqual(1);
    expect(briefing.summary.recommendation.businessImpact.length).toBeGreaterThan(
      0,
    );
  });

  it("derives Lead Judgement with Chief of Staff summary and readiness", () => {
    const briefing = deriveBriefingFromPortfolio(MOCK_OUTCOME_PORTFOLIO);
    const lead = briefing.leadJudgement;
    expect(lead.greeting).toMatch(/Good morning/);
    expect(lead.executiveSummary).toContain("Helix");
    expect(lead.reviewMinutes).toBeGreaterThanOrEqual(5);
    expect(lead.readinessLabel.length).toBeGreaterThan(0);
    expect(lead.attentionTally.length).toBeGreaterThanOrEqual(2);
    expect(lead.canWait.length).toBeGreaterThan(0);
  });

  it("derives continuous morning narrative for the Briefing", () => {
    const narrative = deriveMorningNarrative(MOCK_OUTCOME_PORTFOLIO);
    expect(narrative.priorityDecisions.length).toBeGreaterThan(0);
    expect(narrative.priorityDecisions.length).toBeLessThanOrEqual(3);
    expect(narrative.observations.length).toBeGreaterThan(0);
    expect(
      narrative.recommendations.some((item) => item.stance === "approve"),
    ).toBe(true);
    expect(narrative.closingLine.length).toBeGreaterThan(0);
  });
});
