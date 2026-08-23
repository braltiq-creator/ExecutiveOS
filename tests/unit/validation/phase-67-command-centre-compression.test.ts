/**
 * Phase 67 — Executive Command Centre compression & progressive disclosure.
 * @vitest-environment jsdom
 */

import { createElement } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAuditStore,
  clearLineageStore,
  clearMappingStore,
  clearSnapshotStore,
} from "@/data-gateway";
import { clearDesignPartnerMetrics } from "@/design-partner";
import { clearStudioStores } from "@/executive-snapshot-studio";
import { runManufacturingValidationFromTabular } from "@/executive-snapshot-studio/intelligence";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
} from "@/executive-snapshot-studio/launch";
import {
  runCommercialValidationFromTabular,
  portfolioFromCommercialAnalysis,
} from "@/executive-snapshot-studio";
import { scoreExecutiveReadiness } from "@/executive-snapshot-studio/readiness";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import { CommandCentreExperience } from "@/experience/mission-control/CommandCentreExperience";
import { containsDemoBusinessPhrase } from "@/experience/mission-control/snapshot-integrity";
import { resetPilotRegistry } from "@/pilot";

const MFG = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);
const SF = resolve(
  process.cwd(),
  "fixtures/validation/salesforce-opportunity-export.csv",
);

describe("Phase 67 Command Centre compression", () => {
  beforeEach(() => {
    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();
    clearExecutiveSnapshotLibrary();
    clearDesignPartnerMetrics();
    resetPilotRegistry();
  });

  it("Layer 1 brief: data-derived judgement, decision CTA, no narrative duplication wall", () => {
    const a = runManufacturingValidationFromTabular({
      tabularText: readFileSync(MFG, "utf8"),
      organisationId: "org-phase67-mfg",
      organisationName: "Design Partner Manufacturing",
      filename: "demo-manufacturing-forecast.csv",
    });
    expect(a.analysis).toBeTruthy();

    const active = activateExecutiveSnapshotContext({
      studioId: "studio_67_mfg",
      snapshotId: a.snapshot!.meta.snapshotId,
      organisationId: "org-phase67-mfg",
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

    const model = buildCommandCentreExperience(active);
    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );

    expect(html).toContain('data-command-centre-experience="phase-68"');
    expect(html).toContain('data-cc-compression="phase-67"');
    expect(html).toContain('data-cc-signature="phase-68"');
    expect(html).toContain('data-cc-layer="brief"');
    expect(html).toContain('data-cc-layer="investigate"');
    expect(html).toContain('data-cc-layer="operate"');
    expect(html).toContain(model.leadJudgement);
    expect(model.decisionPaper?.decisionQuestion).toBeTruthy();
    expect(html).toContain(model.decisionPaper!.decisionQuestion.slice(0, 32));
    expect(html).toContain('data-cc-primary-cta="true"');
    expect(html).toContain("Open decision →");
    expect(html).toMatch(/href="[^"]*\/decisions/);
    expect(html).toContain(`${model.darkPanel.confidence}%`);
    expect(model.darkPanel.evidenceStrip.length).toBeGreaterThan(0);
    expect(html).toContain('data-evidence-disclosure="true"');
    expect(html).toContain("View full Region × Model");
    expect(html).toContain('data-exds-heatmap="true"');
    expect(html).toContain('data-since-last-looked="true"');
    expect(html).toContain("Council position not yet established");
    expect(html).toContain("Owner not yet assigned");
    expect(html).toContain("Lead signal");
    expect(html).toContain("Counter-signal");
    expect(html).toContain('data-heat-preview="true"');
    expect(html).toContain('data-exds-forecast-actual="true"');
    expect(html).toContain('data-cc-decision-flow="true"');
    expect(html).not.toContain("Helix");
    expect(html).not.toContain("Northline");
    expect(containsDemoBusinessPhrase(html)).toBe(false);

    // Lead judgement should appear as primary narrative; insight is subordinate caption
    const leadIdx = html.indexOf(model.leadJudgement);
    const insightIdx = html.indexOf('data-cc-level="insight"');
    expect(leadIdx).toBeGreaterThan(-1);
    expect(insightIdx).toBeGreaterThan(leadIdx);
  });

  it("commercial isolation and evidence lab remain intact", () => {
    const raw = runCommercialValidationFromTabular({
      tabularText: readFileSync(SF, "utf8"),
      organisationId: "org-phase67-commercial",
      organisationName: "Commercial Partner",
      filename: "salesforce-opportunity-export.csv",
    });
    const portfolio = portfolioFromCommercialAnalysis(raw.analysis!);
    const active = activateExecutiveSnapshotContext({
      studioId: "studio_67_com",
      snapshotId: raw.snapshot!.meta.snapshotId,
      organisationId: "org-phase67-commercial",
      organisationName: "Commercial Partner",
      profileId: "commercial",
      profileLabel: "Commercial Salesforce Intelligence",
      sourceKind: "salesforce_export",
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

    const model = buildCommandCentreExperience(active);
    expect(model.experienceModule).toBe("commercial");
    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );
    expect(html).toContain('data-cc-layer="brief"');
    expect(html).toContain('data-evidence-tab="exposure"');
    expect(html).not.toContain('data-evidence-tab="demand"');
    expect(html).not.toContain('data-capacity-inventory="true"');
    expect(html).not.toMatch(/Plant 1|Model H demand/i);
  });

  it("evidence hierarchy and decision paper remain data-derived (model-level)", () => {
    const a = runManufacturingValidationFromTabular({
      tabularText: readFileSync(MFG, "utf8"),
      organisationId: "org-phase67-deriv",
      organisationName: "Design Partner Manufacturing",
      filename: "demo-manufacturing-forecast.csv",
    });
    const active = activateExecutiveSnapshotContext({
      studioId: "studio_67_deriv",
      snapshotId: a.snapshot!.meta.snapshotId,
      organisationId: "org-phase67-deriv",
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
    const model = buildCommandCentreExperience(active);
    expect(model.leadJudgement.length).toBeGreaterThan(8);
    expect(model.darkPanel.evidenceStrip.length).toBeGreaterThanOrEqual(3);
    expect(model.decisionPaper?.href).toMatch(/\/decisions/);
    expect(model.decisionPaper?.executionStatus).toBe("decision_required");
    expect(model.heatMap?.cells.length).toBeGreaterThan(0);
  });
});
