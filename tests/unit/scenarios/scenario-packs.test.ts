import { describe, expect, it, beforeEach } from "vitest";
import {
  resetScenarioCentre,
  listScenarioPacks,
  getScenarioPackForProfile,
  listScenariosForProfile,
  listExecutiveQuestions,
  registerScenarioPack,
  runScenarioPack,
  buildScenarioScorecard,
  generateScenarioReport,
  benchmarkScenarioPerformance,
  recordScenarioEvidence,
  recordScenarioOutcome,
  recordScenarioFeedback,
  attachScenariosToTodayActions,
  getScenarioPlaybook,
  OPERATIONS_SCENARIO_PACK,
  COMMERCIAL_SCENARIO_PACK,
} from "@/scenarios";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import type { ScenarioPack } from "@/scenarios";

describe("Executive Scenario Packs", () => {
  beforeEach(() => {
    resetScenarioCentre();
  });

  it("catalogues Operations and Commercial packs with required scenarios", () => {
    const packs = listScenarioPacks();
    expect(packs.map((p) => p.id).sort()).toEqual([
      "pack-commercial-executive",
      "pack-operations-executive",
    ]);

    const ops = getScenarioPackForProfile("operations_executive");
    expect(ops.requiredProviders).toEqual(["microsoft365", "simpro"]);
    expect(ops.scenarios).toHaveLength(10);
    expect(ops.scenarios.map((s) => s.businessQuestion)).toEqual(
      expect.arrayContaining([
        "What changed overnight?",
        "Which jobs require executive attention?",
        "What should I focus on today?",
      ]),
    );

    const commercial = getScenarioPackForProfile("commercial_executive");
    expect(commercial.requiredProviders).toEqual(["microsoft365", "salesforce"]);
    expect(commercial.scenarios).toHaveLength(10);
    expect(commercial.scenarios.map((s) => s.businessQuestion)).toEqual(
      expect.arrayContaining([
        "Which opportunities require executive intervention?",
        "How has forecast confidence changed?",
        "What should I prioritise today?",
      ]),
    );

    for (const scenario of [...ops.scenarios, ...commercial.scenarios]) {
      expect(scenario.expectedEvidence.length).toBeGreaterThan(0);
      expect(scenario.expectedRecommendation.length).toBeGreaterThan(0);
      expect(scenario.expectedExecutiveAction.length).toBeGreaterThan(0);
      expect(scenario.successCriteria.length).toBeGreaterThan(0);
      expect(scenario.confidenceThreshold).toBeGreaterThan(0);
    }
  });

  it("exposes portable executive questions and acceptance playbooks", () => {
    const questions = listExecutiveQuestions("operations_executive");
    expect(questions).toHaveLength(10);
    expect(questions[0]?.scenarioId).toBeTruthy();

    const playbook = getScenarioPlaybook("commercial_executive");
    expect(playbook.acceptanceGate.length).toBeGreaterThan(0);
    expect(playbook.execution.length).toBeGreaterThan(0);
  });

  it("validates scenarios, scorecards, reports, and within-tenant benchmarks", () => {
    const snapshot = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    const tenantId = "tenant-scenario-ops";

    recordScenarioEvidence({
      tenantId,
      scenarioId: "ops-overnight-changes",
      label: "Overnight job delta present",
      source: "simpro",
      quality: 80,
    });
    recordScenarioOutcome({
      tenantId,
      scenarioId: "ops-focus-today",
      outcome: "Executive completed top action before midday",
      realised: true,
    });
    recordScenarioFeedback({
      tenantId,
      scenarioId: "ops-focus-today",
      score: 85,
    });

    const run = runScenarioPack({
      tenantId,
      profileId: "operations_executive",
      presentation: snapshot,
      asOf: "2026-07-26T09:00:00.000Z",
    });

    expect(run.results).toHaveLength(10);
    expect(run.completionPct).toBeGreaterThanOrEqual(0);
    expect(run.results.every((r) => r.explanation.length > 0)).toBe(true);
    expect(
      run.results.some((r) =>
        ["answered", "partial", "unanswered", "blocked"].includes(r.status),
      ),
    ).toBe(true);

    const scorecard = buildScenarioScorecard({
      tenantId,
      profileId: "operations_executive",
      presentation: snapshot,
    });
    expect(scorecard.packName).toContain("Operations Pilot");
    expect(scorecard.overallSuccess).toBeGreaterThanOrEqual(0);
    expect(scorecard.overallSuccess).toBeLessThanOrEqual(100);

    const report = generateScenarioReport({
      tenantId,
      profileId: "operations_executive",
      kind: "weekly",
      presentation: snapshot,
    });
    expect(report.markdown).toContain("Weekly Scenario Report");
    expect(report.questionsAnswered.length).toBeGreaterThan(0);

    const bench1 = benchmarkScenarioPerformance({
      tenantId,
      profileId: "operations_executive",
      presentation: snapshot,
      asOf: "2026-07-26T10:00:00.000Z",
    });
    const bench2 = benchmarkScenarioPerformance({
      tenantId,
      profileId: "operations_executive",
      presentation: snapshot,
      asOf: "2026-07-26T11:00:00.000Z",
    });
    expect(bench2.points.length).toBeGreaterThanOrEqual(bench1.points.length);
    expect(bench2.explanation).toContain("Never compares business data");
  });

  it("attaches scenario references to Today recommendations", () => {
    const snapshot = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    expect(snapshot.recommendedActions.length).toBeGreaterThan(0);

    const enriched = attachScenariosToTodayActions(
      snapshot,
      "operations_executive",
      "tenant-today-scenarios",
    );

    for (const action of enriched.recommendedActions) {
      expect(action.scenarioId).toBeTruthy();
      expect(action.businessQuestion).toBeTruthy();
      expect(action.expectedOutcome).toBeTruthy();
      expect(typeof action.confidence).toBe("number");
      expect(action.evidence?.length).toBeGreaterThan(0);
    }
  });

  it("allows new scenario packs without Core changes", () => {
    const custom: ScenarioPack = {
      ...OPERATIONS_SCENARIO_PACK,
      id: "pack-custom-test",
      name: "Custom Pack",
      scenarios: OPERATIONS_SCENARIO_PACK.scenarios.slice(0, 1).map((s) => ({
        ...s,
        id: "custom-overnight",
      })),
    };
    registerScenarioPack(custom);
    expect(listScenarioPacks().some((p) => p.id === "pack-custom-test")).toBe(
      true,
    );
    expect(COMMERCIAL_SCENARIO_PACK.scenarios).toHaveLength(10);
    expect(listScenariosForProfile("commercial_executive")).toHaveLength(10);
  });

  it("isolates evidence and outcomes per tenant", () => {
    recordScenarioEvidence({
      tenantId: "tenant-a",
      scenarioId: "ops-jobs-attention",
      label: "A only",
      source: "simpro",
      quality: 70,
    });
    recordScenarioEvidence({
      tenantId: "tenant-b",
      scenarioId: "ops-jobs-attention",
      label: "B only",
      source: "simpro",
      quality: 70,
    });

    const runA = runScenarioPack({
      tenantId: "tenant-a",
      profileId: "operations_executive",
      presentation: buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO),
    });
    const jobA = runA.results.find((r) => r.scenarioId === "ops-jobs-attention");
    expect(jobA?.evidenceFound.some((e) => e === "A only")).toBe(true);
    expect(jobA?.evidenceFound.some((e) => e === "B only")).toBe(false);
  });
});
