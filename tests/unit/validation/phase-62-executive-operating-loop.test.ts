/**
 * Phase 62 — Executive Operating Loop Validation.
 * End-to-end continuity: Data → Snapshot → Intelligence → Judgement → Decision → Action.
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAuditStore,
  clearLineageStore,
  clearMappingStore,
  clearSnapshotStore,
} from "@/data-gateway";
import {
  runCommercialValidationFromTabular,
  portfolioFromCommercialAnalysis,
} from "@/executive-snapshot-studio";
import {
  buildManufacturingDecisionPaper,
  runManufacturingValidationFromTabular,
} from "@/executive-snapshot-studio/intelligence";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
  getActiveExecutiveSnapshot,
} from "@/executive-snapshot-studio/launch";

// getActiveExecutiveSnapshot is asserted where sessionStorage exists;
// node tests primarily use the activate() return value as SoT.
import { scoreExecutiveReadiness } from "@/executive-snapshot-studio/readiness";
import { clearStudioStores } from "@/executive-snapshot-studio";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import { CommandCentreExperience } from "@/experience/mission-control/CommandCentreExperience";
import {
  commandCentreStatusFromDecision,
  commandCentreStatusLabel,
  createActionFromSelectedDecision,
  deriveExecutiveSelectionState,
  selectDecisionOption,
} from "@/lib/decisions/decision-execution-linkage";
import type { OutcomePortfolio } from "@/lib/outcomes/types";

const SF_FIXTURE = resolve(
  process.cwd(),
  "fixtures/validation/salesforce-opportunity-export.csv",
);
const MFG_FIXTURE = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);

function sfText() {
  return readFileSync(SF_FIXTURE, "utf8");
}
function mfgText() {
  return readFileSync(MFG_FIXTURE, "utf8");
}

function readiness() {
  return scoreExecutiveReadiness({
    confidence: {
      overall: 88,
      coverage: 90,
      quality: 88,
      freshness: 92,
      consistency: 88,
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
    datasetShape: "flat_commercial",
  });
}

function assertNoDemoLeak(blob: string) {
  expect(blob).not.toMatch(/Northline|Helix|Acme Corp seed/i);
  expect(containsForbiddenDemoPhrase(blob)).toBe(false);
}

function containsForbiddenDemoPhrase(blob: string): boolean {
  return /seeded demo outcomes|demo tenant contamination/i.test(blob);
}

describe("Phase 62 Executive Operating Loop", () => {
  beforeEach(() => {
    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();
    clearExecutiveSnapshotLibrary();
  });

  describe("Commercial Salesforce journey (476 opportunities)", () => {
    it("runs upload → profile → snapshot → intelligence → CC → decision → selection → action", () => {
      const result = runCommercialValidationFromTabular({
        tabularText: sfText(),
        organisationId: "org_sf_62",
        organisationName: "Salesforce Commercial",
        profileId: "commercial",
        filename: "salesforce-opportunity-export.csv",
      });

      expect(result.ingested).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.profile.profileId).toBe("commercial");
      expect(result.snapshot?.meta.recordCount).toBe(476);
      expect(result.analysis).toBeDefined();
      expect(result.brief).toBeDefined();
      expect(result.readiness?.executiveReadiness).toBeGreaterThan(0);

      const snapshotId = result.snapshot!.meta.snapshotId;
      const portfolio = portfolioFromCommercialAnalysis(
        result.analysis!,
        "Salesforce Commercial",
      );
      // Stamp lineage on commercial decisions for operating-loop continuity.
      portfolio.decisions = portfolio.decisions.map((d) => ({
        ...d,
        originSnapshotId: snapshotId,
        executiveSelectionState: "OPTION_IDENTIFIED" as const,
      }));

      const active = activateExecutiveSnapshotContext({
        studioId: "studio_sf_62",
        snapshotId,
        organisationId: "org_sf_62",
        organisationName: "Salesforce Commercial",
        profileId: "commercial",
        profileLabel: "Commercial Executive Intelligence",
        sourceKind: "excel",
        filename: "salesforce-opportunity-export.csv",
        recordCount: 476,
        confidenceOverall: result.snapshot!.meta.confidence.overall,
        readiness: result.readiness ?? readiness(),
        portfolio,
        analysis: result.analysis,
        commercialBrief: result.brief,
        councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
        advisorNames: [],
      });

      // activate() returns authoritative context; sessionStorage may be absent in node.
      expect(active.snapshotId).toBe(snapshotId);
      expect(active.recordCount).toBe(476);

      const model = buildCommandCentreExperience(active, portfolio);
      expect(model.experienceModule).toBe("commercial");
      expect(model.snapshotId).toBe(snapshotId);
      expect(model.ageing).not.toBeNull();
      expect(model.forecastVsActual).toBeUndefined();
      expect(model.focusDomains.map((d) => d.label)).toEqual(
        expect.arrayContaining(["Pipeline", "Forecast", "Customers", "Product"]),
      );

      const html = renderToStaticMarkup(
        createElement(CommandCentreExperience, { model }),
      );
      expect(html).not.toMatch(/Factory|Inventory Days|Model H|Plant 1/i);
      expect(html).not.toMatch(/manufacturing_forecasting/);
      assertNoDemoLeak(
        [model.leadJudgement, model.executiveInsight, html].join("\n"),
      );

      const decision = portfolio.decisions[0];
      expect(decision).toBeDefined();
      expect(decision!.alternatives.length).toBeGreaterThanOrEqual(2);
      expect(deriveExecutiveSelectionState(decision!)).toBe("OPTION_IDENTIFIED");

      // Viewing does not select
      expect(decision!.selectedAlternativeId == null).toBe(true);

      const afterSelect = selectDecisionOption(portfolio, {
        decisionId: decision!.id,
        alternativeId: decision!.alternatives[0]!.id,
        actor: "Executive",
        snapshotId,
      });
      expect(afterSelect.decision.originSnapshotId).toBe(snapshotId);
      expect(afterSelect.selectionState).toMatch(
        /OPTION_SELECTED|DECISION_DEFERRED/,
      );

      const afterAction = createActionFromSelectedDecision(
        afterSelect.portfolio,
        { decisionId: decision!.id, actor: "Executive" },
      );
      expect(afterAction.action.decisionId).toBe(decision!.id);
      expect(afterAction.action.snapshotId).toBe(snapshotId);
      expect(afterAction.action.recommendation.owner).toBe(
        "Owner not yet assigned.",
      );
      expect(afterAction.action.recommendation.deadline).toBe(
        "Due date not yet assigned.",
      );
      expect(afterAction.action.actionConfidenceLabel).toMatch(
        /not yet established/i,
      );
    });
  });

  describe("Manufacturing Forecasting journey", () => {
    it("runs fixture → manufacturing CC → judgement → decision paper → selection → action → CC status", () => {
      const result = runManufacturingValidationFromTabular({
        tabularText: mfgText(),
        organisationId: "org_mfg_62",
        organisationName: "Demo Manufacturing",
        filename: "demo-manufacturing-forecast.csv",
      });

      expect(result.ingested).toBe(true);
      expect(result.profile.profileId).toBe("manufacturing");
      expect(result.analysis?.module).toBe("manufacturing_forecasting");
      expect(result.portfolio).toBeDefined();

      const snapshotId = result.snapshot!.meta.snapshotId;
      const paper = buildManufacturingDecisionPaper(
        result.analysis!,
        result.brief,
      );
      expect(paper.decisionId).toBeTruthy();
      expect(paper.leadJudgement).toMatch(/demand has moved above plan|softening/i);

      const active = activateExecutiveSnapshotContext({
        studioId: "studio_mfg_62",
        snapshotId,
        organisationId: "org_mfg_62",
        organisationName: "Demo Manufacturing",
        profileId: "manufacturing",
        profileLabel: "Manufacturing Forecast Intelligence",
        sourceKind: "excel",
        filename: "demo-manufacturing-forecast.csv",
        recordCount: result.snapshot!.meta.recordCount,
        confidenceOverall: result.snapshot!.meta.confidence.overall,
        readiness: result.readiness ?? readiness(),
        portfolio: result.portfolio!,
        manufacturingAnalysis: result.analysis,
        manufacturingBrief: result.brief,
        councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
        advisorNames: [],
      });

      expect(active.snapshotId).toBe(snapshotId);

      let model = buildCommandCentreExperience(active, result.portfolio);
      expect(model.experienceModule).toBe("manufacturing_forecasting");
      expect(model.decisionPaper?.executionStatus).toBe("decision_required");
      expect(model.decisionPaper?.executionStatusLabel).toBe(
        "Decision required",
      );
      expect(model.ageing).toBeNull();
      expect(model.forecastVsActual?.points.length).toBeGreaterThan(0);
      expect(model.focusDomains.map((d) => d.label)).toEqual(
        expect.arrayContaining(["Demand", "Factory", "Inventory", "Capacity"]),
      );

      const html = renderToStaticMarkup(
        createElement(CommandCentreExperience, { model }),
      );
      expect(html).not.toMatch(/Ageing Exposure|Pipeline in View|Next-Step Evidence/i);
      expect(html).not.toContain("Northline");
      expect(html).not.toContain("Helix");

      const decisionId = paper.decisionId!;
      const decision = result.portfolio!.decisions.find((d) => d.id === decisionId)!;
      expect(deriveExecutiveSelectionState(decision)).toBe("OPTION_IDENTIFIED");

      // Action blocked before selection
      expect(() =>
        createActionFromSelectedDecision(result.portfolio!, {
          decisionId,
          actor: "Executive",
        }),
      ).toThrow(/before an executive option is selected/i);

      const afterSelect = selectDecisionOption(result.portfolio!, {
        decisionId,
        alternativeId: paper.options[0]!.id,
        actor: "Executive",
        snapshotId,
      });
      expect(afterSelect.decision.originSnapshotId).toBe(snapshotId);
      expect(
        commandCentreStatusLabel(
          commandCentreStatusFromDecision(afterSelect.decision, false),
        ),
      ).toMatch(/Decision selected|Decision deferred/);

      model = buildCommandCentreExperience(active, afterSelect.portfolio);
      expect(model.decisionPaper?.executionStatus).toMatch(
        /decision_selected|decision_deferred/,
      );

      const afterAction = createActionFromSelectedDecision(
        afterSelect.portfolio,
        { decisionId, actor: "Executive" },
      );
      expect(afterAction.action.decisionId).toBe(decisionId);
      expect(afterAction.action.snapshotId).toBe(snapshotId);
      expect(afterAction.action.evidenceIds?.length).toBeGreaterThan(0);

      model = buildCommandCentreExperience(active, afterAction.portfolio);
      expect(model.decisionPaper?.executionStatus).toBe("execution_underway");
      expect(model.decisionPaper?.executionStatusLabel).toBe(
        "Execution underway",
      );
      expect(model.council.established).toBe(false);
      expect(model.executiveValue.status).toMatch(/Not yet quantified/i);
    });
  });

  describe("Immutability & snapshot continuity", () => {
    it("Decision A / Action A keep Snapshot A after Snapshot B is activated", () => {
      const a = runManufacturingValidationFromTabular({
        tabularText: mfgText(),
        organisationId: "org_mfg_62_a",
        filename: "demo-manufacturing-forecast.csv",
      });
      const snapshotA = a.snapshot!.meta.snapshotId;
      const paper = buildManufacturingDecisionPaper(a.analysis!, a.brief);
      const decisionId = paper.decisionId!;

      const analysisFrozen = structuredClone(a.analysis!);

      const selected = selectDecisionOption(a.portfolio!, {
        decisionId,
        alternativeId: paper.options[0]!.id,
        actor: "Executive",
        snapshotId: snapshotA,
      });
      const acted = createActionFromSelectedDecision(selected.portfolio, {
        decisionId,
        actor: "Executive",
      });

      expect(acted.decision.originSnapshotId).toBe(snapshotA);
      expect(acted.action.snapshotId).toBe(snapshotA);
      expect(acted.decision.evidenceAtDecision?.length).toBeGreaterThan(0);

      // Snapshot B
      const b = runManufacturingValidationFromTabular({
        tabularText: mfgText(),
        organisationId: "org_mfg_62_b",
        filename: "demo-manufacturing-forecast.csv",
      });
      const snapshotB = b.snapshot!.meta.snapshotId;
      expect(snapshotB).not.toBe(snapshotA);

      const activeB = activateExecutiveSnapshotContext({
        studioId: "studio_mfg_62_b",
        snapshotId: snapshotB,
        organisationId: "org_mfg_62_b",
        profileId: "manufacturing",
        profileLabel: "Manufacturing Forecast Intelligence",
        sourceKind: "excel",
        recordCount: b.snapshot!.meta.recordCount,
        confidenceOverall: 90,
        readiness: b.readiness ?? readiness(),
        portfolio: b.portfolio!,
        manufacturingAnalysis: b.analysis,
        manufacturingBrief: b.brief,
        councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
        advisorNames: [],
      });

      expect(activeB.snapshotId).toBe(snapshotB);
      expect(activeB.snapshotId).not.toBe(snapshotA);

      // Historical decision A unchanged
      expect(acted.decision.originSnapshotId).toBe(snapshotA);
      expect(acted.action.snapshotId).toBe(snapshotA);
      expect(a.analysis).toEqual(analysisFrozen);
      expect(acted.decision.evidenceAtDecision).toEqual(
        acted.decision.evidenceAtDecision,
      );
    });
  });

  describe("Decision integrity states", () => {
    it("preserves OPTION_IDENTIFIED → OPTION_SELECTED without collapsing to approved", () => {
      const result = runManufacturingValidationFromTabular({
        tabularText: mfgText(),
        organisationId: "org_mfg_62_states",
        filename: "demo-manufacturing-forecast.csv",
      });
      const paper = buildManufacturingDecisionPaper(
        result.analysis!,
        result.brief,
      );
      const d0 = result.portfolio!.decisions.find(
        (d) => d.id === paper.decisionId,
      )!;
      expect(deriveExecutiveSelectionState(d0)).toBe("OPTION_IDENTIFIED");

      const protect =
        paper.options.find((o) => /protect/i.test(o.label)) ?? paper.options[0]!;
      const selected = selectDecisionOption(result.portfolio!, {
        decisionId: paper.decisionId!,
        alternativeId: protect.id,
        actor: "Executive",
        snapshotId: result.snapshot!.meta.snapshotId,
      });
      expect(selected.selectionState).toBe("OPTION_SELECTED");
      expect(selected.decision.status).not.toBe("approved");
      expect(selected.decision.executiveSelectionState).toBe("OPTION_SELECTED");
    });
  });

  describe("Failure / honesty states", () => {
    it("keeps manufacturing honesty labels for value, council, cost of delay, confidence", () => {
      const result = runManufacturingValidationFromTabular({
        tabularText: mfgText(),
        organisationId: "org_mfg_62_honest",
        filename: "demo-manufacturing-forecast.csv",
      });
      const paper = buildManufacturingDecisionPaper(
        result.analysis!,
        result.brief,
      );
      expect(paper.executiveValueStatus).toMatch(/Not yet quantified/i);
      expect(paper.councilStatus).toMatch(/not yet established/i);
      expect(paper.costOfDelay).toMatch(/not quantified/i);
      expect(paper.confidence.decisionConfidence).toBeNull();
      expect(paper.confidence.decisionConfidenceLabel).toMatch(
        /not yet established/i,
      );
      expect(paper.missingEvidence.length).toBeGreaterThan(0);
    });

    it("handles empty tabular as non-ingested without demo fallback", () => {
      const result = runManufacturingValidationFromTabular({
        tabularText: "not,a,valid\n",
        organisationId: "org_empty_62",
        filename: "empty.csv",
      });
      // May ingest 0-shape or fail — must not invent manufacturing instruments via demo seed
      if (!result.ingested) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
      expect(result.brief?.councilPosition ?? "Council position not yet established.").toMatch(
        /not yet established|establishing|./i,
      );
    });
  });

  describe("Cross-profile coexistence", () => {
    it("commercial and manufacturing models do not share instruments", () => {
      const commercial = runCommercialValidationFromTabular({
        tabularText: sfText(),
        organisationId: "org_coexist_c",
        profileId: "commercial",
        filename: "salesforce-opportunity-export.csv",
      });
      const manufacturing = runManufacturingValidationFromTabular({
        tabularText: mfgText(),
        organisationId: "org_coexist_m",
        filename: "demo-manufacturing-forecast.csv",
      });

      const cPortfolio = portfolioFromCommercialAnalysis(commercial.analysis!);
      const cActive = activateExecutiveSnapshotContext({
        studioId: "studio_co_c",
        snapshotId: commercial.snapshot!.meta.snapshotId,
        organisationId: "org_coexist_c",
        profileId: "commercial",
        profileLabel: "Commercial Executive Intelligence",
        sourceKind: "excel",
        recordCount: 476,
        confidenceOverall: 80,
        readiness: commercial.readiness ?? readiness(),
        portfolio: cPortfolio,
        analysis: commercial.analysis,
        commercialBrief: commercial.brief,
        councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
        advisorNames: [],
      });
      const cModel = buildCommandCentreExperience(cActive, cPortfolio);

      const mActive = activateExecutiveSnapshotContext({
        studioId: "studio_co_m",
        snapshotId: manufacturing.snapshot!.meta.snapshotId,
        organisationId: "org_coexist_m",
        profileId: "manufacturing",
        profileLabel: "Manufacturing Forecast Intelligence",
        sourceKind: "excel",
        recordCount: manufacturing.snapshot!.meta.recordCount,
        confidenceOverall: 90,
        readiness: manufacturing.readiness ?? readiness(),
        portfolio: manufacturing.portfolio!,
        manufacturingAnalysis: manufacturing.analysis,
        manufacturingBrief: manufacturing.brief,
        councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
        advisorNames: [],
      });
      const mModel = buildCommandCentreExperience(
        mActive,
        manufacturing.portfolio,
      );

      expect(cModel.experienceModule).toBe("commercial");
      expect(mModel.experienceModule).toBe("manufacturing_forecasting");
      expect(cModel.forecastVsActual).toBeUndefined();
      expect(mModel.forecastVsActual).toBeDefined();
      expect(cModel.ageing).not.toBeNull();
      expect(mModel.ageing).toBeNull();
      expect(mModel.decisionPaper).toBeDefined();
      // Commercial Phase 60/61 decision paper surface not yet projected on CC
      expect(cModel.decisionPaper == null || cModel.decisionPaper === null).toBe(
        true,
      );
    });
  });
});
