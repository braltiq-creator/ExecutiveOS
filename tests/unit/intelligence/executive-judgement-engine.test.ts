import { describe, expect, it } from "vitest";
import {
  compareOptions,
  deriveDecisionBrief,
  evaluateDecision,
  explainTradeoffs,
  generateJudgement,
  optionsForDecision,
  surfaceUnknowns,
  JUDGEMENT_DIMENSIONS,
} from "@/intelligence/executive-judgement";
import { getExecutiveIntent } from "@/intelligence/executive-intent";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

describe("Executive Judgement Engine", () => {
  const intent = getExecutiveIntent();
  const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
  const helix = snapshot.decisions.find((d) => d.id === "decision-residency")!;

  it("catalogues multiple viable Helix options", () => {
    const options = optionsForDecision("decision-residency");
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(new Set(options.map((o) => o.act)).size).toBeGreaterThan(1);
  });

  it("evaluates every framework dimension", () => {
    const evaluation = evaluateDecision({
      decision: helix,
      outcomes: snapshot.outcomes,
      intent,
      asOf: snapshot.asOf,
    });
    expect(evaluation.options.length).toBeGreaterThanOrEqual(2);
    for (const option of evaluation.options) {
      expect(option.dimensions).toHaveLength(JUDGEMENT_DIMENSIONS.length);
      expect(option.pack.alternatives.length).toBeGreaterThan(0);
      expect(option.pack.unknowns.length).toBeGreaterThan(0);
      expect(option.pack.tradeoffs.length).toBeGreaterThan(0);
      expect(option.pack.benefits.length).toBeGreaterThan(0);
      expect(option.pack.risks.length).toBeGreaterThan(0);
      expect(option.pack.evidence.length).toBeGreaterThan(0);
      expect(option.pack.reasoningPath.length).toBeGreaterThan(0);
    }
    expect(evaluation.comparisonSummary).toMatch(/not a decision|leaning/i);
  });

  it("never hides uncertainty", () => {
    const unknowns = surfaceUnknowns({
      decision: helix,
      outcomes: snapshot.outcomes,
      options: evaluateDecision({
        decision: helix,
        outcomes: snapshot.outcomes,
        intent,
        asOf: snapshot.asOf,
      }).options,
    });
    expect(unknowns.length).toBeGreaterThan(0);
    expect(unknowns.every((item) => item.question.length > 0)).toBe(true);
  });

  it("always exposes trade-offs with costs", () => {
    const evaluation = evaluateDecision({
      decision: helix,
      outcomes: snapshot.outcomes,
      intent,
      asOf: snapshot.asOf,
    });
    const { tradeoffs, summary } = explainTradeoffs(evaluation.options);
    expect(tradeoffs.length).toBeGreaterThan(0);
    expect(tradeoffs.every((item) => item.costs.length > 0)).toBe(true);
    expect(summary).toMatch(/trade-off/i);
  });

  it("compares options without binding", () => {
    const evaluation = evaluateDecision({
      decision: helix,
      outcomes: snapshot.outcomes,
      intent,
      asOf: snapshot.asOf,
    });
    const comparison = compareOptions({
      decisionId: helix.id,
      options: evaluation.options,
    });
    expect(Object.keys(comparison.winnersByDimension).length).toBeGreaterThan(0);
    expect(comparison.summary).toMatch(/viable alternative|sole evaluated/i);
  });

  it("generates a deterministic judgement stance", () => {
    const a = generateJudgement({
      decision: helix,
      outcomes: snapshot.outcomes,
      intent,
      asOf: snapshot.asOf,
    });
    const b = generateJudgement({
      decision: helix,
      outcomes: snapshot.outcomes,
      intent,
      asOf: snapshot.asOf,
    });
    expect(a.stance).toEqual(b.stance);
    expect(a.evaluation.primaryOptionId).toEqual(b.evaluation.primaryOptionId);
    expect(a.pack.alternatives.length).toBeGreaterThan(0);
  });

  it("derives a Decision Brief that refuses to replace the executive", () => {
    const brief = deriveDecisionBrief({
      decision: helix,
      outcomes: snapshot.outcomes,
      intent,
      asOf: snapshot.asOf,
      memoryEvidence: [
        "This recommendation aligns with a previous successful decision.",
      ],
      graphPaths: ["Decision → Risk → Outcome"],
    });
    expect(brief.optionsInPlay.length).toBeGreaterThanOrEqual(2);
    expect(brief.unknowns.length).toBeGreaterThan(0);
    expect(brief.tradeoffs.length).toBeGreaterThan(0);
    expect(brief.closingNote).toMatch(/does not make the Decision/i);
    expect(brief.intentAlignment.length).toBeGreaterThan(0);
    expect(brief.memoryContext[0]).toMatch(/successful|Memory/i);
  });

  it("wires judgement into the Intelligent snapshot", () => {
    const intelligent = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
    expect(intelligent.judgementBriefs?.length).toBeGreaterThan(0);
    const helixBrief = intelligent.judgementBriefs?.find(
      (brief) => brief.decisionId === "decision-residency",
    );
    expect(helixBrief?.optionsInPlay.length).toBeGreaterThanOrEqual(2);
    const helixRec = intelligent.recommendations.find((rec) =>
      rec.relatedDecisionIds.includes("decision-residency"),
    );
    expect(helixRec?.reasoningGraph.systems).toContain(
      "Executive Judgement Engine",
    );
    expect(helixRec?.reason).toMatch(/alternative/i);
  });
});
