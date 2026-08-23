import { describe, expect, it, beforeEach } from "vitest";
import {
  evaluateRecommendation,
  evaluateSnapshotRecommendations,
  EVALUATION_DIMENSIONS,
} from "@/evaluation";
import {
  ORG_NORTHLINE_MINING,
  ORG_ENTERPRISE_SAAS,
  EXECUTIVE_SCENARIOS,
  getScenario,
  runScenario,
  SIMULATED_ORGANISATIONS,
} from "@/simulation";
import {
  clearBaselines,
  compareToBaseline,
  generateSuiteReport,
  runRealityLabSuite,
  saveBaseline,
} from "@/benchmarks";

describe("Reality Lab", () => {
  beforeEach(() => {
    clearBaselines();
  });

  it("provides simulated organisations including field services", () => {
    expect(SIMULATED_ORGANISATIONS.length).toBeGreaterThanOrEqual(6);
    expect(SIMULATED_ORGANISATIONS.map((org) => org.industry)).toEqual(
      expect.arrayContaining([
        "enterprise_saas",
        "healthcare",
        "industrial_manufacturing",
        "mining",
        "utilities",
        "field_services",
      ]),
    );
  });

  it("provides the executive scenario catalogue", () => {
    expect(EXECUTIVE_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(
      EXECUTIVE_SCENARIOS.map((scenario) => scenario.kind),
    ).toEqual(
      expect.arrayContaining([
        "major_customer_churn",
        "cyber_incident",
        "board_preparation",
        "acquisition_opportunity",
        "budget_reduction",
        "regulatory_investigation",
        "operational_outage",
        "leadership_resignation",
        "market_expansion",
      ]),
    );
  });

  it("runs the full stack and captures judgement artefacts", () => {
    const scenario = getScenario("scenario-cyber-incident")!;
    const result = runScenario(ORG_NORTHLINE_MINING, scenario);

    expect(result.capture.pulse.label.length).toBeGreaterThan(0);
    expect(result.capture.snapshotSummary.recommendationCount).toBeGreaterThan(0);
    expect(result.capture.judgements.length).toBeGreaterThan(0);
    expect(result.capture.alternatives.length).toBeGreaterThan(0);
    expect(result.capture.unknowns.length).toBeGreaterThan(0);
    expect(result.capture.reasoningPaths.length).toBeGreaterThan(0);
    expect(result.snapshot.pulse).toBeTruthy();
    expect(result.snapshot.judgementBriefs?.length).toBeGreaterThan(0);
  });

  it("evaluates every recommendation on the framework dimensions", () => {
    const result = runScenario(
      ORG_NORTHLINE_MINING,
      getScenario("scenario-board-prep")!,
    );
    expect(result.evaluations.length).toBeGreaterThan(0);
    for (const evaluation of result.evaluations) {
      expect(evaluation.dimensions).toHaveLength(EVALUATION_DIMENSIONS.length);
      expect(evaluation.overallScore).toBeGreaterThanOrEqual(0);
      expect(evaluation.overallScore).toBeLessThanOrEqual(100);
    }
  });

  it("produces benchmark metrics including Trust Score", () => {
    const result = runScenario(
      ORG_ENTERPRISE_SAAS,
      getScenario("scenario-customer-churn")!,
    );
    expect(result.benchmarks.trustScore).toBeGreaterThan(0);
    expect(result.benchmarks.evidenceCoverage).toBeGreaterThan(0);
    expect(result.benchmarks.decisionReadiness).toBeGreaterThan(0);
    expect(result.benchmarks.reasoningCompleteness).toBeGreaterThan(0);
    expect(result.benchmarks.confidenceAccuracy).toBeGreaterThan(0);
    expect(result.benchmarks.executiveAttentionEfficiency).toBeGreaterThan(0);
  });

  it("is deterministic for the same org × scenario", () => {
    const scenario = getScenario("scenario-budget-reduction")!;
    const a = runScenario(ORG_NORTHLINE_MINING, scenario);
    const b = runScenario(ORG_NORTHLINE_MINING, scenario);
    expect(a.benchmarks.trustScore).toEqual(b.benchmarks.trustScore);
    expect(a.evaluations.map((e) => e.overallScore)).toEqual(
      b.evaluations.map((e) => e.overallScore),
    );
  });

  it("tracks baselines and highlights regressions", () => {
    const scenario = getScenario("scenario-outage")!;
    const run = runScenario(ORG_NORTHLINE_MINING, scenario);
    saveBaseline({
      id: "bl-outage",
      label: "outage baseline",
      run,
    });
    const again = runScenario(ORG_NORTHLINE_MINING, scenario, {
      priorFingerprints: run.fingerprints,
    });
    const report = compareToBaseline(again, "bl-outage");
    expect(report.passed).toBe(true);
    expect(report.regressions).toHaveLength(0);
    expect(report.summary).toMatch(/Trust|regression/i);
  });

  it("generates suite comparison reports", () => {
    const suite = runRealityLabSuite({
      organisationIds: ["org-northline"],
      scenarioIds: ["scenario-board-prep", "scenario-cyber-incident"],
      trackRegressions: true,
      baselinePrefix: "lab",
    });
    expect(suite.runs).toHaveLength(2);
    expect(suite.suiteReport.runCount).toBe(2);
    expect(suite.suiteReport.averageTrust).toBeGreaterThan(0);
    expect(suite.comparisons.length).toBe(2);
    expect(suite.comparisons.every((item) => item.passed)).toBe(true);

    const report = generateSuiteReport(suite.runs);
    expect(report.summary).toMatch(/autopilot|trust/i);
  });

  it("can block recommendations that fail evaluation gates", () => {
    const result = runScenario(
      ORG_NORTHLINE_MINING,
      getScenario("scenario-regulatory")!,
    );
    const evaluations = evaluateSnapshotRecommendations(result.snapshot);
    // Gate machinery works — pass/fail is explicit
    expect(evaluations.every((item) => typeof item.pass === "boolean")).toBe(
      true,
    );
    const sample = evaluateRecommendation({
      recommendation: result.snapshot.recommendations[0]!,
      snapshot: result.snapshot,
      brief: result.snapshot.judgementBriefs?.find((brief) =>
        result.snapshot.recommendations[0]!.relatedDecisionIds.includes(
          brief.decisionId,
        ),
      ),
    });
    expect(sample.gatesFailed).toBeDefined();
  });
});
