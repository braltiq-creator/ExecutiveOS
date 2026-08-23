/**
 * Phase 61 — Decision → Execution linkage.
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  buildManufacturingDecisionPaper,
  runManufacturingValidationFromTabular,
} from "@/executive-snapshot-studio/intelligence";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
} from "@/executive-snapshot-studio/launch";
import { scoreExecutiveReadiness } from "@/executive-snapshot-studio/readiness";
import { applyDecisionAct } from "@/lib/decisions/apply-decision-act";
import {
  commandCentreStatusFromDecision,
  commandCentreStatusLabel,
  createActionFromSelectedDecision,
  deriveExecutiveSelectionState,
  frameActionFromSelectedOption,
  selectDecisionOption,
} from "@/lib/decisions/decision-execution-linkage";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import type { OutcomePortfolio } from "@/lib/outcomes/types";

const FIXTURE = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);

function fixtureText() {
  return readFileSync(FIXTURE, "utf8");
}

function minimalReadiness() {
  return scoreExecutiveReadiness({
    confidence: {
      overall: 90,
      coverage: 92,
      quality: 90,
      freshness: 95,
      consistency: 90,
      completeness: 90,
      scoredAt: new Date().toISOString(),
    },
    validation: {
      status: "passed",
      issues: [],
      errorCount: 0,
      warningCount: 0,
      checkedAt: new Date().toISOString(),
    },
    datasetShape: "hierarchical",
  });
}

function emptyPortfolio(): OutcomePortfolio {
  return {
    overallScore: 70,
    statusLabel: "ok",
    refreshedAt: new Date().toISOString(),
    executiveName: "Executive",
    outcomes: [],
    decisions: [],
    intent: {
      id: "intent-61",
      title: "t",
      narrative: "n",
      priority: "high",
      horizon: "q",
      reviewDate: new Date().toISOString().slice(0, 10),
      reviewCadence: "Weekly",
      focusOutcomeIds: [],
      watchingOutcomeIds: [],
      nonFocusOutcomeIds: [],
      constraints: [],
      successSignals: [],
      status: "active",
      history: [],
    },
    intentHistory: [],
  };
}

describe("Phase 61 Decision → Execution linkage", () => {
  beforeEach(() => {
    clearExecutiveSnapshotLibrary();
  });

  it("treats option identification as distinct from selection", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_61a",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );
    const decision = result.portfolio!.decisions.find(
      (d) => d.id === paper.decisionId,
    )!;
    expect(deriveExecutiveSelectionState(decision)).toBe("OPTION_IDENTIFIED");
    expect(decision.selectedAlternativeId == null).toBe(true);
    expect(paper.selectionMessage).toMatch(/Options identified/i);
  });

  it("records option selection without fabricating approval or action", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_61b",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );
    const seed = structuredClone(result.portfolio!);
    const decisionId = paper.decisionId!;
    const alt = paper.options[0]!;

    const selected = selectDecisionOption(seed, {
      decisionId,
      alternativeId: alt.id,
      actor: "Executive",
      snapshotId: result.snapshot!.meta.snapshotId,
      at: "2026-08-22T10:00:00.000Z",
    });

    expect(selected.selectionState).toBe("OPTION_SELECTED");
    expect(selected.decision.selectedAlternativeId).toBe(alt.id);
    expect(selected.decision.selectedAlternativeLabel).toBe(alt.label);
    expect(selected.decision.originSnapshotId).toBe(
      result.snapshot!.meta.snapshotId,
    );
    expect(selected.decision.evidenceAtDecision?.length).toBeGreaterThan(0);
    expect(selected.decision.history.at(-1)?.note).toMatch(/OPTION_SELECTED/);

    const hasAction = selected.portfolio.outcomes.some((o) =>
      o.pendingActions.some((a) => a.decisionId === decisionId),
    );
    expect(hasAction).toBe(false);
    expect(selected.decision.status).not.toBe("approved");
  });

  it("does not mutate the immutable snapshot when selecting", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_61c",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );
    const snapshotJudgement = result.analysis!.insights.find(
      (i) => i.id === "demand-acceleration",
    )!.title;
    const before = structuredClone(result.analysis!);

    selectDecisionOption(result.portfolio!, {
      decisionId: paper.decisionId!,
      alternativeId: paper.options[0]!.id,
      actor: "Executive",
      snapshotId: result.snapshot!.meta.snapshotId,
    });

    expect(
      result.analysis!.insights.find((i) => i.id === "demand-acceleration")!
        .title,
    ).toBe(snapshotJudgement);
    expect(result.analysis).toEqual(before);
  });

  it("blocks action creation before selection", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_61d",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );
    expect(() =>
      createActionFromSelectedDecision(result.portfolio!, {
        decisionId: paper.decisionId!,
        actor: "Executive",
      }),
    ).toThrow(/before an executive option is selected/i);
  });

  it("creates action after selection with honest owner/due/confidence and lineage", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_61e",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );
    const decisionId = paper.decisionId!;
    const alt =
      paper.options.find((o) => /protect/i.test(o.label)) ?? paper.options[0]!;

    const portfolio = selectDecisionOption(result.portfolio!, {
      decisionId,
      alternativeId: alt.id,
      actor: "Executive",
      snapshotId: "snap-lineage-61",
    }).portfolio;

    const created = createActionFromSelectedDecision(portfolio, {
      decisionId,
      actor: "Executive",
      at: "2026-08-22T11:00:00.000Z",
    });

    expect(created.action.decisionId).toBe(decisionId);
    expect(created.action.snapshotId).toBe("snap-lineage-61");
    expect(created.action.evidenceIds?.length).toBeGreaterThan(0);
    expect(created.action.recommendation.owner).toBe("Owner not yet assigned.");
    expect(created.action.recommendation.deadline).toBe(
      "Due date not yet assigned.",
    );
    expect(created.action.actionConfidenceLabel).toMatch(
      /not yet established/i,
    );
    expect(created.action.recommendation.confidence).toBe(0);
    expect(created.action.expectedOutcomeLabel).not.toMatch(/\$/);
    expect(created.action.actionLabel).not.toMatch(/\$2\.1M|revenue by/i);
    expect(frameActionFromSelectedOption(created.decision)).toBe(
      created.action.actionLabel,
    );

    const linkageSrc = readFileSync(
      resolve(
        process.cwd(),
        "src/lib/decisions/decision-execution-linkage.ts",
      ),
      "utf8",
    );
    expect(linkageSrc).not.toMatch(
      /Review plant capacity allocation against Model H demand requirements/,
    );
  });

  it("derives Command Centre status from actual decision/action state", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_61f",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );
    const decisionId = paper.decisionId!;

    expect(
      commandCentreStatusLabel(
        commandCentreStatusFromDecision(
          result.portfolio!.decisions.find((d) => d.id === decisionId),
          false,
        ),
      ),
    ).toBe("Decision required");

    const afterSelect = selectDecisionOption(result.portfolio!, {
      decisionId,
      alternativeId: paper.options[0]!.id,
      actor: "Executive",
      snapshotId: result.snapshot!.meta.snapshotId,
    });
    expect(commandCentreStatusFromDecision(afterSelect.decision, false)).toBe(
      "decision_selected",
    );

    const afterAction = createActionFromSelectedDecision(afterSelect.portfolio, {
      decisionId,
      actor: "Executive",
    });
    expect(
      commandCentreStatusFromDecision(afterAction.decision, true),
    ).toBe("execution_underway");
  });

  it("does not fabricate Council consensus or financial value on selection", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_61g",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );
    const selected = selectDecisionOption(result.portfolio!, {
      decisionId: paper.decisionId!,
      alternativeId: paper.options[0]!.id,
      actor: "Executive",
    });
    expect(paper.councilStatus).toMatch(/not yet established/i);
    expect(paper.executiveValueStatus).toMatch(/Not yet quantified/i);
    expect(selected.decision.costOfDelay).toMatch(/not quantified/i);
    expect(JSON.stringify(selected.decision)).not.toMatch(
      /Council agreed|Majority agreement|Proceed/i,
    );
  });

  it("keeps commercial Helix approve path working (regression)", () => {
    const { portfolio, consequence } = applyDecisionAct(MOCK_OUTCOME_PORTFOLIO, {
      decisionId: "decision-residency",
      act: "approve",
      actor: "Alex Rivera, CEO",
      at: "2026-08-22T09:00:00+10:00",
    });
    const decision = portfolio.decisions.find(
      (d) => d.id === "decision-residency",
    )!;
    expect(decision.status).toBe("approved");
    expect(decision.executiveSelectionState).toBe("DECISION_APPROVED");
    expect(consequence.actionCreated?.label).toMatch(/workshop/i);
  });

  it("keeps manufacturing/commercial Command Centre isolation after Phase 61", () => {
    const mfg = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_61h",
      filename: "demo-manufacturing-forecast.csv",
    });
    const activeMfg = activateExecutiveSnapshotContext({
      studioId: "studio_mfg_61",
      snapshotId: mfg.snapshot!.meta.snapshotId,
      organisationId: "org_mfg_61h",
      profileId: "manufacturing",
      profileLabel: "Manufacturing Forecast Intelligence",
      sourceKind: "excel",
      recordCount: mfg.snapshot!.meta.recordCount,
      confidenceOverall: 90,
      readiness: mfg.readiness ?? minimalReadiness(),
      portfolio: mfg.portfolio!,
      manufacturingAnalysis: mfg.analysis,
      manufacturingBrief: mfg.brief,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });
    const mfgModel = buildCommandCentreExperience(activeMfg, mfg.portfolio);
    expect(mfgModel.decisionPaper?.executionStatus).toBe("decision_required");
    expect(mfgModel.experienceModule).toBe("manufacturing_forecasting");
    expect(mfgModel.ageing).toBeNull();

    const commercial = activateExecutiveSnapshotContext({
      studioId: "studio_c_61",
      snapshotId: "snap_c_61",
      organisationId: "org_c_61",
      profileId: "commercial",
      profileLabel: "Commercial Executive Intelligence",
      sourceKind: "excel",
      recordCount: 10,
      confidenceOverall: 80,
      readiness: minimalReadiness(),
      portfolio: emptyPortfolio(),
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });
    const cModel = buildCommandCentreExperience(commercial);
    expect(cModel.experienceModule).toBe("commercial");
    expect(cModel.decisionPaper == null || cModel.decisionPaper === null).toBe(
      true,
    );
    expect(cModel.forecastVsActual).toBeUndefined();
  });
});
