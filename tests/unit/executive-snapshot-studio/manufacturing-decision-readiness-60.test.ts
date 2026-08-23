/**
 * Phase 60 — Executive Decision Readiness (manufacturing composition).
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
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
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import { CommandCentreExperience } from "@/experience/mission-control/CommandCentreExperience";
import { ExecutiveDecisionPaperView } from "@/experience/decision-readiness";
import { deriveDecisionQuestion } from "@/lib/decisions/decision-readiness";
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
    statusLabel: "Manufacturing attention required",
    refreshedAt: new Date().toISOString(),
    executiveName: "Executive",
    outcomes: [],
    decisions: [],
    intent: {
      id: "intent-mfg-60",
      title: "Protect forecast clarity",
      narrative: "Evidence-based manufacturing judgement",
      priority: "high",
      horizon: "This quarter",
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

describe("Phase 60 Executive Decision Readiness", () => {
  beforeEach(() => {
    clearExecutiveSnapshotLibrary();
  });

  it("derives decision question from implication without hard-coding Model H", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/executive-snapshot-studio/intelligence/manufacturing-decision-frame.ts",
      ),
      "utf8",
    );
    expect(source).not.toMatch(
      /Should capacity be reallocated to protect Model H demand/,
    );

    const q = deriveDecisionQuestion({
      implication:
        "Whether to protect strategic Model Z demand by reallocating capacity or accepting deferral risk elsewhere.",
      leadJudgement: "Model Z demand has moved above plan",
      leadModel: "Model Z",
    });
    expect(q.toLowerCase()).toContain("should");
    expect(q).toMatch(/Model Z/i);
    expect(q.endsWith("?")).toBe(true);
  });

  it("frames judgement → decision with readiness classification", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_60",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );

    expect(paper.leadJudgement).toMatch(/demand has moved above plan/i);
    expect(paper.readiness).toBe("DECISION_REQUIRES_EXECUTIVE_JUDGEMENT");
    expect(paper.decisionQuestion.length).toBeGreaterThan(20);
    expect(paper.decisionQuestion.endsWith("?")).toBe(true);
    expect(paper.selectionMessage).toMatch(/Options identified/i);
    expect(paper.selectionRequired).toBe(true);
  });

  it("generates options and evidence-supported trade-offs without recommending", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_60b",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );

    expect(paper.options.length).toBeGreaterThanOrEqual(3);
    for (const opt of paper.options) {
      expect(opt.isRecommendation).toBe(false);
      expect(opt.tradeOffs.some((t) => t.polarity === "upside")).toBe(true);
      expect(opt.tradeOffs.some((t) => t.polarity === "downside")).toBe(true);
    }
    expect(paper.tradeOffs.length).toBeGreaterThan(0);

    const html = renderToStaticMarkup(
      createElement(ExecutiveDecisionPaperView, { paper }),
    );
    expect(html).toContain("Options — not recommendations");
    expect(html).toContain('data-is-recommendation="false"');
    expect(html).not.toMatch(/Proceed with majority|Consensus established/i);
  });

  it("preserves counter-signals in the decision frame", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_60c",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );
    expect(paper.counterSignals.length).toBeGreaterThan(0);
    expect(paper.counterSignals[0]?.role).toBe("COUNTER_SIGNAL");
    expect(paper.primaryEvidence[0]?.role).toBe("PRIMARY_SUPPORT");
  });

  it("lists missing evidence and separates confidence layers", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_60d",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );

    expect(paper.missingEvidence.length).toBeGreaterThan(0);
    expect(
      paper.missingEvidence.some((m) => /financial|unit economics/i.test(m.label)),
    ).toBe(true);
    expect(paper.confidence.decisionConfidence).toBeNull();
    expect(paper.confidence.decisionConfidenceLabel).toMatch(
      /not yet established/i,
    );
    expect(paper.confidence.judgementConfidence).not.toBeNull();
    expect(paper.confidence.datasetConfidence).not.toBeNull();
    expect(paper.confidence.datasetConfidence).not.toBe(
      paper.confidence.judgementConfidence,
    );
  });

  it("keeps cost of delay, Executive Value, and Council honest", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_60e",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );
    expect(paper.costOfDelay).toMatch(/not quantified/i);
    expect(paper.executiveValueStatus).toMatch(/Not yet quantified/i);
    expect(paper.councilStatus).toMatch(/not yet established/i);
    expect(paper.costOfDelay).not.toMatch(/\$/);
  });

  it("enriches Decision Engine lead decision and wires Command Centre CTA", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_60f",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );
    expect(paper.decisionId).toBeTruthy();
    const lead = result.portfolio!.decisions.find((d) => d.id === paper.decisionId);
    expect(lead).toBeDefined();
    expect(lead!.question).toBe(paper.decisionQuestion);
    expect(lead!.costOfDelay).toMatch(/not quantified/i);
    expect(lead!.alternatives.length).toBeGreaterThanOrEqual(3);
    expect(lead!.recommendationSummary).toMatch(/Executive selection required/i);
    expect(lead!.tradeOffs.length).toBeGreaterThan(0);

    const active = activateExecutiveSnapshotContext({
      studioId: "studio_mfg_60",
      snapshotId: result.snapshot!.meta.snapshotId,
      organisationId: "org_mfg_60f",
      profileId: "manufacturing",
      profileLabel: "Manufacturing Forecast Intelligence",
      sourceKind: "excel",
      filename: "demo-manufacturing-forecast.csv",
      recordCount: result.snapshot!.meta.recordCount,
      confidenceOverall: result.snapshot!.meta.confidence.overall,
      readiness: result.readiness ?? minimalReadiness(),
      portfolio: result.portfolio!,
      manufacturingAnalysis: result.analysis,
      manufacturingBrief: result.brief,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });

    const model = buildCommandCentreExperience(active);
    expect(model.decisionPaper?.href).toContain("/decisions");
    expect(model.decisionPaper?.href).toContain("manufacturing_judgement");
    expect(model.darkPanel.actionHref).toBe(model.decisionPaper!.href);
    expect(model.leadJudgement).toBe(paper.leadJudgement);

    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );
    expect(html).toContain("Open decision");
    expect(html).not.toContain("Ageing Exposure");
    expect(html).not.toContain("Pipeline in View");
  });

  it("keeps commercial Command Centre free of manufacturing decision logic", () => {
    const commercial = activateExecutiveSnapshotContext({
      studioId: "studio_commercial_60_iso",
      snapshotId: "snap_commercial_60_iso",
      organisationId: "org_commercial_60_iso",
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
    const model = buildCommandCentreExperience(commercial);
    expect(model.experienceModule).toBe("commercial");
    expect(model.decisionPaper == null || model.decisionPaper === null).toBe(
      true,
    );
    expect(model.forecastVsActual).toBeUndefined();
    expect(model.darkPanel.actionHref).not.toContain("manufacturing_judgement");
  });
});
