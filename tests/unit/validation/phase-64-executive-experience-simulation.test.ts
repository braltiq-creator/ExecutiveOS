/**
 * Phase 64 — Design Partner Simulation & Executive Experience Validation.
 * Product validation only — no new intelligence.
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
  buildDesignPartnerMetricsSnapshot,
  buildDesignPartnerReadinessSummary,
  clearDesignPartnerFeedback,
  clearDesignPartnerMetrics,
  recordWouldStartHere,
} from "@/design-partner";
import {
  clearStudioStores,
} from "@/executive-snapshot-studio";
import { runManufacturingValidationFromTabular } from "@/executive-snapshot-studio/intelligence";
import { buildManufacturingDecisionPaper } from "@/executive-snapshot-studio/intelligence/manufacturing-decision-frame";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
} from "@/executive-snapshot-studio/launch";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import { CommandCentreExperience } from "@/experience/mission-control/CommandCentreExperience";
import {
  commandCentreStatusFromDecision,
  commandCentreStatusLabel,
  createActionFromSelectedDecision,
  deriveExecutiveSelectionState,
  selectDecisionOption,
} from "@/lib/decisions/decision-execution-linkage";
import {
  markPilotStarted,
  provisionDesignPartner,
  resetPilotRegistry,
} from "@/pilot";

const MFG_FIXTURE = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);

function mfgText() {
  return readFileSync(MFG_FIXTURE, "utf8");
}

describe("Phase 64 Executive Experience Simulation", () => {
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

  it("simulates first-morning Manufacturing Design Partner journey", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: mfgText(),
      organisationId: "org_phase64",
      organisationName: "Design Partner Manufacturing",
      filename: "demo-manufacturing-forecast.csv",
    });
    expect(result.ingested).toBe(true);
    expect(result.analysis?.module).toBe("manufacturing_forecasting");

    const { pilot } = provisionDesignPartner({
      partnerName: "Design Partner Manufacturing",
      industry: "Manufacturing",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "pilot@example.com",
      focusModule: "manufacturing_forecasting",
      environment: "pilot",
      tenantSlug: "phase64-mfg",
    });
    markPilotStarted({
      pilotId: pilot.id,
      startedAt: "2026-08-17T00:00:00.000Z",
    });

    const paper = buildManufacturingDecisionPaper(
      result.analysis!,
      result.brief,
    );
    const active = activateExecutiveSnapshotContext({
      studioId: "studio_phase64",
      snapshotId: result.snapshot!.meta.snapshotId,
      organisationId: "org_phase64",
      organisationName: "Design Partner Manufacturing",
      profileId: "manufacturing",
      profileLabel: "Manufacturing Forecast Intelligence",
      sourceKind: "excel",
      filename: "demo-manufacturing-forecast.csv",
      recordCount: result.snapshot!.meta.recordCount,
      confidenceOverall: result.snapshot!.meta.confidence.overall,
      readiness: result.readiness!,
      portfolio: result.portfolio!,
      manufacturingAnalysis: result.analysis,
      manufacturingBrief: result.brief,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });

    // Morning: Command Centre first question
    let model = buildCommandCentreExperience(active, result.portfolio);
    expect(model.experienceModule).toBe("manufacturing_forecasting");
    expect(model.leadJudgement.length).toBeGreaterThan(10);
    expect(model.darkPanel.evidenceStrip.length).toBeGreaterThan(0);
    expect(model.narrativeChain).toBeTruthy();
    expect(model.heatMap?.cells.length).toBeGreaterThan(0);
    expect(model.forecastVsActual?.points.length).toBeGreaterThan(0);
    expect(model.decisionPaper?.executionStatus).toBe("decision_required");

    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );
    expect(html).toMatch(/What requires executive judgement today/i);
    expect(html).toMatch(/DESIGN PARTNER ENVIRONMENT/i);
    expect(html).toMatch(/MANUFACTURING FORECAST/i);
    expect(html).not.toMatch(/Hitachi/i);
    expect(html).not.toMatch(/Ageing Exposure|Pipeline in View|Salesforce/i);
    expect(html).toMatch(/Would you start your day here/i);

    // 10-second / 30-second surfaces
    expect(model.leadJudgement).toMatch(/demand|plan|softening|forecast/i);
    expect(model.leadSupport.length).toBeGreaterThan(0);
    const roles = model.darkPanel.evidenceStrip
      .map((e) => e.role)
      .filter(Boolean);
    expect(roles.length).toBeGreaterThan(0);

    // Decision paper honesty
    expect(paper.readiness).toMatch(/JUDGEMENT|REQUIRES/i);
    expect(paper.options.length).toBeGreaterThanOrEqual(2);
    expect(paper.executiveValueStatus).toMatch(/not yet quantified/i);
    expect(paper.councilStatus).toMatch(/not yet established/i);
    expect(paper.confidence.decisionConfidence).toBeNull();
    expect(paper.missingEvidence.length).toBeGreaterThan(0);

    // Selection → Action → CC status
    const decision = result.portfolio!.decisions.find(
      (d) => d.id === paper.decisionId,
    )!;
    expect(deriveExecutiveSelectionState(decision)).toBe("OPTION_IDENTIFIED");

    const afterSelect = selectDecisionOption(result.portfolio!, {
      decisionId: paper.decisionId!,
      alternativeId: paper.options[0]!.id,
      actor: "Executive",
      snapshotId: result.snapshot!.meta.snapshotId,
    });
    expect(afterSelect.selectionState).toMatch(
      /OPTION_SELECTED|DECISION_DEFERRED/,
    );
    expect(afterSelect.decision.status).not.toBe("approved");
    expect(
      commandCentreStatusLabel(
        commandCentreStatusFromDecision(afterSelect.decision, false),
      ),
    ).toMatch(/Decision selected|Decision deferred/);

    const afterAction = createActionFromSelectedDecision(
      afterSelect.portfolio,
      { decisionId: paper.decisionId!, actor: "Executive" },
    );
    expect(afterAction.action.decisionId).toBe(paper.decisionId);
    expect(afterAction.action.snapshotId).toBe(
      result.snapshot!.meta.snapshotId,
    );
    expect(afterAction.action.recommendation.owner).toBe(
      "Owner not yet assigned.",
    );
    expect(afterAction.action.recommendation.deadline).toBe(
      "Due date not yet assigned.",
    );

    model = buildCommandCentreExperience(active, afterAction.portfolio);
    expect(model.decisionPaper?.executionStatus).toBe("execution_underway");
    expect(model.decisionPaper?.executionStatusLabel).toBe(
      "Execution underway",
    );

    // Snapshot B does not rewrite Decision A
    const b = runManufacturingValidationFromTabular({
      tabularText: mfgText(),
      organisationId: "org_phase64_b",
      filename: "demo-manufacturing-forecast.csv",
    });
    expect(b.snapshot!.meta.snapshotId).not.toBe(
      result.snapshot!.meta.snapshotId,
    );
    expect(afterAction.decision.originSnapshotId).toBe(
      result.snapshot!.meta.snapshotId,
    );
    expect(afterAction.action.snapshotId).toBe(
      result.snapshot!.meta.snapshotId,
    );

    // Data onboarding honesty summary
    const readiness = buildDesignPartnerReadinessSummary({
      readiness: result.readiness!,
      analysis: result.analysis,
      recordCount: result.snapshot!.meta.recordCount,
      sourceLabel: "demo-manufacturing-forecast.csv",
    });
    expect(readiness.datasetReadiness).not.toBe(
      readiness.executiveJudgementReadiness,
    );
    expect(readiness.whatWeReceived.length).toBeGreaterThan(0);
    expect(readiness.whatWeUnderstood.length).toBeGreaterThan(0);

    // Would you start here — mechanism only; answer not assumed for product claim
    recordWouldStartHere({
      organisationId: "org_phase64",
      would: true,
      snapshotId: result.snapshot!.meta.snapshotId,
      screen: "command_centre",
    });
    const metrics = buildDesignPartnerMetricsSnapshot({
      organisationId: "org_phase64",
    });
    expect(metrics.wouldStartHereYes + metrics.wouldStartHereNo).toBeGreaterThan(
      0,
    );

    // Export simulation evidence for documentation (not a product KPI)
    // eslint-disable-next-line no-console
    console.info(
      JSON.stringify({
        phase: 64,
        leadJudgement: model.leadJudgement,
        leadSupport: model.leadSupport?.slice?.(0, 160) ?? active.manufacturingBrief,
        evidenceRoles: roles,
        narrativeChain: model.narrativeChain,
        decisionQuestion: paper.decisionQuestion,
        readiness: paper.readiness,
        options: paper.options.map((o) => o.label),
        missingEvidence: paper.missingEvidence,
        datasetReadiness: readiness.datasetReadiness,
        judgementReadiness: readiness.executiveJudgementReadiness,
        executionStatus: model.decisionPaper?.executionStatusLabel,
        designPartnerLabel: model.designPartner?.environmentLabel,
        pilotDayLabel: model.designPartner?.pilotDayLabel,
      }),
    );
  });
});
