/**
 * Phase 69 — Design Partner Pilot Simulation & Executive Value Validation.
 * Validation harness only — no UI redesign, no new engines.
 * @vitest-environment jsdom
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
  clearDesignPartnerFeedback,
  clearDesignPartnerMetrics,
  runManufacturingPilotSimulation,
} from "@/design-partner";
import { clearStudioStores } from "@/executive-snapshot-studio";
import {
  runCommercialValidationFromTabular,
  portfolioFromCommercialAnalysis,
} from "@/executive-snapshot-studio";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
} from "@/executive-snapshot-studio/launch";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import { CommandCentreExperience } from "@/experience/mission-control/CommandCentreExperience";
import { scoreExecutiveReadiness } from "@/executive-snapshot-studio/readiness";
import { resetPilotRegistry } from "@/pilot";
import { selectDecisionOption } from "@/lib/decisions/decision-execution-linkage";
import { buildManufacturingDecisionPaper } from "@/executive-snapshot-studio/intelligence/manufacturing-decision-frame";
import { runManufacturingValidationFromTabular } from "@/executive-snapshot-studio/intelligence";

const MFG = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);
const SF = resolve(
  process.cwd(),
  "fixtures/validation/salesforce-opportunity-export.csv",
);

describe("Phase 69 Pilot Simulation & Executive Value Validation", () => {
  beforeEach(() => {
    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();
    clearExecutiveSnapshotLibrary();
    clearDesignPartnerMetrics();
    clearDesignPartnerFeedback();
    resetPilotRegistry();
  });

  it("runs Day 1→3 manufacturing pilot: orient → investigate → decide → select → execute → return", async () => {
    const sim = runManufacturingPilotSimulation({
      organisationId: "org-phase69-mfg",
      organisationName: "Design Partner Manufacturing",
      tabularText: readFileSync(MFG, "utf8"),
      filename: "demo-manufacturing-forecast.csv",
      preferProtectOption: true,
      owner: "Operations Planning",
      dueDate: "2026-08-28",
    });

    // 1–2 Pilot start + first visit
    expect(sim.pilot.pilotStartedAt).toBeTruthy();
    expect(sim.day1.executionStatus).toBe("decision_required");
    expect(sim.leadJudgement.length).toBeGreaterThan(10);

    // 3 Lead judgement identification
    expect(sim.tasks.find((t) => t.taskId === "TASK_01")?.verdict).toMatch(
      /PASS|PARTIAL/,
    );
    expect(sim.leadJudgement).toMatch(/demand|plan|Model/i);

    // 4 Evidence investigation
    expect(sim.day1.heatMapCells).toBeGreaterThan(0);
    expect(sim.day1.forecastPoints).toBeGreaterThan(0);
    expect(sim.day1.narrativeConsistent).toBe(true);
    expect(sim.day1.htmlSurfaces).toEqual(
      expect.arrayContaining([
        "hasEvidenceLab",
        "hasHeatPreview",
        "hasForecastChart",
        "hasLeadSignal",
        "hasCounterSignal",
      ]),
    );

    // 5–6 Decision opening + option selection
    expect(sim.decisionId).toBeTruthy();
    expect(sim.decisionQuestion.length).toBeGreaterThan(10);
    expect(sim.selectedOptionLabel.length).toBeGreaterThan(0);
    expect(sim.day2.selectionState).toMatch(/OPTION_SELECTED|DECISION_DEFERRED/);

    // 7–9 Owner, due, action
    expect(sim.honesty.noFabricatedOwnerBeforeAssign).toBe(true);
    expect(sim.honesty.noFabricatedDueBeforeAssign).toBe(true);
    expect(sim.day2.owner).toBe("Operations Planning");
    expect(sim.day2.due).toBe("2026-08-28");
    expect(sim.actionId).toBeTruthy();
    expect(sim.day2.executionStatus).toBe("execution_underway");

    // 10–12 Execution + return + Since You Last Looked
    expect(sim.day3.executionStatus).toBe("execution_underway");
    expect(sim.day3.sinceYouLastLookedCount).toBeGreaterThan(0);
    expect(sim.tasks.find((t) => t.taskId === "TASK_06")?.verdict).toMatch(
      /PASS|PARTIAL/,
    );

    // 13–15 Snapshot immutability + lineage
    expect(sim.lineage.decisionOriginSnapshotId).toBe(sim.snapshotId);
    expect(sim.lineage.actionSnapshotId).toBe(sim.snapshotId);
    expect(sim.lineage.historyLength).toBeGreaterThan(0);
    expect(sim.lineage.secondSnapshotDoesNotRewrite).toBe(true);

    // 16–17 Isolation + honesty
    expect(sim.isolation.manufacturingOnlyOnCc).toBe(true);
    expect(sim.isolation.commercialProbeOk).toBe(true);
    expect(sim.honesty.councilNotEstablished).toBe(true);
    expect(sim.honesty.valueNotQuantified).toBe(true);
    expect(sim.day3.isolationDisclosure).toMatch(/active/i);

    // 18–19 Visual evidence
    expect(sim.day1.htmlSurfaces).toContain("hasHeatPreview");
    expect(sim.day1.htmlSurfaces).toContain("hasForecastChart");

    // Scorecard present
    expect(sim.scorecard.ORIENTATION).toBeDefined();
    expect(sim.hypotheses.H6_daily_habit).toBe("NOT_ESTABLISHED");
    expect(sim.overallVerdict).toMatch(
      /READY_FOR_REAL_DESIGN_PARTNER|READY_WITH_P1_FIXES|NOT_READY/,
    );
    expect(sim.frictions.length).toBeGreaterThan(0);
    expect(sim.overallVerdict).toBe("READY_WITH_P1_FIXES");

    const { writeFileSync, mkdirSync } = await import("node:fs");
    mkdirSync(resolve(process.cwd(), "docs/design-partner"), { recursive: true });
    writeFileSync(
      resolve(process.cwd(), "docs/design-partner/PHASE_69_SIMULATION_EVIDENCE.json"),
      JSON.stringify(
        {
          phase: 69,
          overallVerdict: sim.overallVerdict,
          leadJudgement: sim.leadJudgement,
          decisionQuestion: sim.decisionQuestion,
          selectedOptionLabel: sim.selectedOptionLabel,
          tasks: sim.tasks.map((t) => ({
            id: t.taskId,
            name: t.name,
            verdict: t.verdict,
          })),
          scorecard: sim.scorecard,
          hypotheses: sim.hypotheses,
          timeToValue: sim.timeToValue,
          frictions: sim.frictions,
          honesty: sim.honesty,
          lineage: sim.lineage,
          isolation: sim.isolation,
          day1: sim.day1,
          day2: sim.day2,
          day3: sim.day3,
        },
        null,
        2,
      ),
    );
  });

  it("opening /today does not select a decision (Decision Engine only)", () => {
    const a = runManufacturingValidationFromTabular({
      tabularText: readFileSync(MFG, "utf8"),
      organisationId: "org-phase69-nosel",
      organisationName: "Design Partner Manufacturing",
      filename: "demo-manufacturing-forecast.csv",
    });
    const paper = buildManufacturingDecisionPaper(a.analysis!, a.brief);
    const active = activateExecutiveSnapshotContext({
      studioId: "studio_69_nosel",
      snapshotId: a.snapshot!.meta.snapshotId,
      organisationId: "org-phase69-nosel",
      organisationName: "Design Partner Manufacturing",
      profileId: "manufacturing",
      profileLabel: "Manufacturing Forecast Intelligence",
      sourceKind: "excel",
      filename: "demo-manufacturing-forecast.csv",
      recordCount: a.snapshot!.meta.recordCount,
      confidenceOverall: a.snapshot!.meta.confidence.overall,
      readiness: a.readiness!,
      portfolio: a.portfolio!,
      manufacturingAnalysis: a.analysis,
      manufacturingBrief: a.brief,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });

    const before = a.portfolio!.decisions.find((d) => d.id === paper.decisionId);
    expect(before?.selectedAlternativeId).toBeFalsy();

    const model = buildCommandCentreExperience(active, a.portfolio);
    renderToStaticMarkup(createElement(CommandCentreExperience, { model }));

    const after = a.portfolio!.decisions.find((d) => d.id === paper.decisionId);
    expect(after?.selectedAlternativeId).toBeFalsy();
    expect(model.decisionPaper?.executionStatus).toBe("decision_required");

    const selected = selectDecisionOption(a.portfolio!, {
      decisionId: paper.decisionId!,
      alternativeId: paper.options[0]!.id,
      actor: "Executive",
      snapshotId: a.snapshot!.meta.snapshotId,
    });
    expect(selected.decision.selectedAlternativeId).toBe(paper.options[0]!.id);
  });

  it("commercial behaviour remains isolated (no manufacturing instruments)", () => {
    const raw = runCommercialValidationFromTabular({
      tabularText: readFileSync(SF, "utf8"),
      organisationId: "org-phase69-com",
      organisationName: "Commercial Partner",
      profileId: "commercial",
      filename: "salesforce-opportunity-export.csv",
    });
    const portfolio = portfolioFromCommercialAnalysis(raw.analysis!);
    const active = activateExecutiveSnapshotContext({
      studioId: "studio_69_com",
      snapshotId: raw.snapshot!.meta.snapshotId,
      organisationId: "org-phase69-com",
      organisationName: "Commercial Partner",
      profileId: "commercial",
      profileLabel: "Commercial Salesforce Intelligence",
      sourceKind: "excel",
      filename: "salesforce-opportunity-export.csv",
      recordCount: raw.snapshot!.meta.recordCount,
      confidenceOverall: raw.snapshot!.meta.confidence.overall,
      readiness: scoreExecutiveReadiness({
        confidence: {
          overall: raw.snapshot!.meta.confidence.overall,
          coverage: 90,
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
        datasetShape: "flat_commercial",
      }),
      portfolio,
      commercialAnalysis: raw.analysis,
      commercialBrief: raw.brief,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });

    const model = buildCommandCentreExperience(active, portfolio);
    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );
    expect(model.experienceModule).toBe("commercial");
    expect(html).not.toContain('data-evidence-tab="demand"');
    expect(html).not.toContain('data-capacity-inventory="true"');
    expect(html).not.toMatch(/Plant 1|Model H demand/i);
  });
});
