import { describe, expect, it } from "vitest";
import {
  BUSINESS_DRIVER_IDS,
  TIME_HORIZON_IDS,
  FUTURE_CASE_KINDS,
  applyExecutiveFutures,
  projectPossibleFutures,
  simulateFuturesForScenario,
  toPossibleFuturesView,
  explainFutureForExecutive,
  listBusinessDrivers,
  listTimeHorizons,
} from "@/futures";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { getEnterpriseDigitalTwin } from "@/digital-twin";

describe("Executive Futures Engine", () => {
  const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
  const twin = getEnterpriseDigitalTwin();

  it("exposes the full driver and horizon catalogues", () => {
    expect(listBusinessDrivers()).toHaveLength(BUSINESS_DRIVER_IDS.length);
    expect(listTimeHorizons()).toHaveLength(TIME_HORIZON_IDS.length);
    expect(BUSINESS_DRIVER_IDS).toContain("cash_flow");
    expect(TIME_HORIZON_IDS).toContain("90d");
  });

  it("generates best, expected, worst, most likely, and black swan futures", () => {
    const brief = projectPossibleFutures({ snapshot, twin });
    expect(brief.futures).toHaveLength(FUTURE_CASE_KINDS.length);
    for (const kind of FUTURE_CASE_KINDS) {
      expect(brief.futures.some((f) => f.caseKind === kind)).toBe(true);
    }
  });

  it("explains why each future exists with assumptions and evidence", () => {
    const brief = projectPossibleFutures({ snapshot, twin });
    for (const future of brief.futures) {
      expect(future.explanation.whyItExists.length).toBeGreaterThan(20);
      expect(future.keyAssumptions.length).toBeGreaterThan(1);
      expect(future.supportingEvidence.length).toBeGreaterThan(0);
      expect(future.explanation.evidenceThatWeakens.length).toBeGreaterThan(0);
      expect(future.explanation.influenceLevers.length).toBeGreaterThan(0);
      expect(explainFutureForExecutive(future)).toMatch(/assumptions|influence|monitor/i);
    }
  });

  it("attaches interventions across all required kinds", () => {
    const brief = projectPossibleFutures({ snapshot, twin });
    const kinds = new Set(
      brief.futures.flatMap((f) => f.recommendedInterventions.map((i) => i.kind)),
    );
    expect(kinds.has("high_impact")).toBe(true);
    expect(kinds.has("low_effort")).toBe(true);
    expect(kinds.has("urgent")).toBe(true);
    expect(kinds.has("preventative")).toBe(true);
    expect(kinds.has("deferred")).toBe(true);
  });

  it("identifies early warning signals with thresholds and escalation", () => {
    const brief = projectPossibleFutures({ snapshot, twin });
    for (const future of brief.futures) {
      expect(future.leadingIndicators.length).toBeGreaterThan(0);
      const signal = future.leadingIndicators[0];
      expect(signal.threshold.length).toBeGreaterThan(5);
      expect(signal.escalationTrigger.length).toBeGreaterThan(5);
      expect(signal.recoveryIndicator.length).toBeGreaterThan(5);
    }
  });

  it("has the council review every future and preserves disagreement", () => {
    const brief = projectPossibleFutures({ snapshot, twin });
    expect(brief.councilReviews).toHaveLength(brief.futures.length);
    for (const review of brief.councilReviews) {
      expect(review.perspectives).toHaveLength(5);
    }

    const cfo = brief.councilReviews
      .flatMap((r) => r.perspectives)
      .find((p) => p.agentId === "cfo" && p.agreement === "challenges");
    const coo = brief.councilReviews
      .flatMap((r) => r.perspectives)
      .find((p) => p.agentId === "coo" && p.agreement === "challenges");
    const cso = brief.councilReviews
      .flatMap((r) => r.perspectives)
      .find((p) => p.agentId === "cso");

    expect(cfo).toBeTruthy();
    expect(coo).toBeTruthy();
    expect(cso?.summary).toMatch(/strategic|investment|optionality/i);

    const withDisagreement = brief.councilReviews.find(
      (r) => r.disagreements.length > 0,
    );
    expect(withDisagreement).toBeTruthy();
    expect(withDisagreement!.disagreements[0].facilitation).toMatch(
      /do not average|both clocks/i,
    );
  });

  it("exposes spotlights for Today", () => {
    const brief = projectPossibleFutures({ snapshot, twin });
    expect(brief.spotlights.most_likely).toBeTruthy();
    expect(brief.spotlights.greatest_risk).toBeTruthy();
    expect(brief.spotlights.greatest_opportunity).toBeTruthy();
    expect(brief.spotlights.fastest_emerging).toBeTruthy();
    expect(brief.spotlights.most_strategic).toBeTruthy();
  });

  it("is deterministic", () => {
    const a = projectPossibleFutures({ snapshot, twin });
    const b = projectPossibleFutures({ snapshot, twin });
    expect(a.futures.map((f) => f.id)).toEqual(b.futures.map((f) => f.id));
    expect(a.futures.map((f) => f.probability)).toEqual(
      b.futures.map((f) => f.probability),
    );
  });

  it("wires into the intelligent snapshot and Today presentation", () => {
    const applied = applyExecutiveFutures({ snapshot, twin });
    expect(applied.snapshot.futuresBrief?.futures.length).toBe(5);

    const ui = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    expect(ui.possibleFutures).toBeDefined();
    expect(ui.possibleFutures!.spotlights.length).toBe(5);
    expect(ui.possibleFutures!.futures.length).toBe(5);

    const view = toPossibleFuturesView(applied.futuresBrief);
    expect(view.futures[0].whyItExists.length).toBeGreaterThan(10);
    expect(view.futures[0].interventions.length).toBeGreaterThan(0);
  });

  it("scores futures in Reality Lab simulations", () => {
    const result = simulateFuturesForScenario({
      scenarioId: "test-futures",
      snapshot,
      twin,
    });
    expect(result.scores.overall).toBeGreaterThan(50);
    expect(result.scores.predictionQuality).toBeGreaterThan(40);
    expect(result.scores.confidenceCalibration).toBeGreaterThan(40);
    expect(result.scores.interventionEffectiveness).toBeGreaterThan(40);
    expect(result.scores.decisionQuality).toBeGreaterThan(40);
    expect(result.perFuture).toHaveLength(5);
  });
});
