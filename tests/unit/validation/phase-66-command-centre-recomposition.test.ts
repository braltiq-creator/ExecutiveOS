/**
 * Phase 66 — Executive Command Centre recomposition (experience only).
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
import { ExecutiveHeatMap } from "@/design-system/executive-experience";
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

function readinessFrom(confidenceOverall: number) {
  return scoreExecutiveReadiness({
    confidence: {
      overall: confidenceOverall,
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
  });
}

describe("Phase 66 Command Centre recomposition", () => {
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

  it("manufacturing: hierarchy, data-derived judgement, isolation, evidence lab", () => {
    const a = runManufacturingValidationFromTabular({
      tabularText: readFileSync(MFG, "utf8"),
      organisationId: "org-phase66-mfg",
      organisationName: "Design Partner Manufacturing",
      filename: "demo-manufacturing-forecast.csv",
    });
    expect(a.analysis).toBeTruthy();
    expect(a.snapshot).toBeTruthy();

    const active = activateExecutiveSnapshotContext({
      studioId: "studio_66_mfg",
      snapshotId: a.snapshot!.meta.snapshotId,
      organisationId: "org-phase66-mfg",
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
    expect(model.experienceModule).toBe("manufacturing_forecasting");
    expect(model.leadJudgement.length).toBeGreaterThan(8);
    expect(model.darkPanel.confidence).toBeGreaterThan(0);
    expect(model.decisionPaper?.decisionQuestion).toBeTruthy();
    expect(model.snapshotId).toBe(a.snapshot!.meta.snapshotId);

    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );

    expect(html).toContain('data-command-centre-experience="phase-68"');
    expect(html).toContain('data-experience-module="manufacturing_forecasting"');
    expect(html).toContain('data-snapshot-id="' + model.snapshotId + '"');
    expect(html).toContain('data-cc-layer="brief"');
    expect(html).toContain('data-cc-layer="investigate"');
    expect(html).toContain('data-cc-layer="operate"');
    expect(html).toContain('data-evidence-lab="true"');
    expect(html).toContain('data-evidence-tab="demand"');
    expect(html).toContain('data-evidence-tab="forecast"');
    expect(html).toContain('data-evidence-tab="confidence"');
    expect(html).toContain('data-evidence-tab="capacity"');
    expect(html).toContain(model.leadJudgement.slice(0, 24));
    expect(html).toContain(`${model.darkPanel.confidence}%`);
    expect(html).toContain("Open decision →");
    expect(html).toContain("Owner not yet assigned");
    expect(html).toContain("Due date not yet assigned");
    expect(html).toContain("Action not yet created");
    expect(html).toContain("Council position not yet established");
    expect(html).toContain('data-council-progressive="collapsed"');
    expect(html).toContain('data-narrative-chain="true"');
    expect(html).toContain('data-evidence-disclosure="true"');
    expect(html).toContain("View full Region × Model");
    expect(html).toContain("Lead signal");
    expect(html).toContain("Counter-signal");
    expect(html).toContain('data-heat-preview="true"');
    expect(html).toContain('data-exds-forecast-actual="true"');
    expect(html).toContain('data-exds-briefing-index="true"');

    expect(html).not.toMatch(/pipeline value|open pipeline|Salesforce/i);
    expect(html).not.toContain("Helix");
    expect(html).not.toContain("Northline");
    expect(containsDemoBusinessPhrase(html)).toBe(false);

    // Opening /today must not select a decision — composition only links out.
    expect(html).not.toMatch(/selected alternative|option selected by opening/i);
  });

  it("commercial: remains commercial; no manufacturing instruments", () => {
    const raw = runCommercialValidationFromTabular({
      tabularText: readFileSync(SF, "utf8"),
      organisationId: "org-phase66-commercial",
      organisationName: "Commercial Partner",
      filename: "salesforce-opportunity-export.csv",
    });
    expect(raw.analysis).toBeTruthy();
    expect(raw.snapshot).toBeTruthy();
    const portfolio = portfolioFromCommercialAnalysis(raw.analysis!);

    const active = activateExecutiveSnapshotContext({
      studioId: "studio_66_com",
      snapshotId: raw.snapshot!.meta.snapshotId,
      organisationId: "org-phase66-commercial",
      organisationName: "Commercial Partner",
      profileId: "commercial",
      profileLabel: "Commercial Salesforce Intelligence",
      sourceKind: "salesforce_export",
      filename: "salesforce-opportunity-export.csv",
      recordCount: raw.snapshot!.meta.recordCount,
      confidenceOverall: raw.snapshot!.meta.confidence.overall,
      readiness: readinessFrom(raw.snapshot!.meta.confidence.overall),
      portfolio,
      commercialAnalysis: raw.analysis,
      commercialBrief: raw.brief,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });

    const model = buildCommandCentreExperience(active);
    expect(model.experienceModule).not.toBe("manufacturing_forecasting");

    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );

    expect(html).toContain('data-command-centre-experience="phase-68"');
    expect(html).toContain('data-evidence-lab="true"');
    expect(html).toContain('data-evidence-tab="exposure"');
    expect(html).not.toContain('data-evidence-tab="demand"');
    expect(html).not.toContain('data-capacity-inventory="true"');
    expect(html).not.toContain('data-forecast-confidence="true"');
    expect(html).not.toMatch(/Region × Model|Plant 1|Model H demand/i);
    expect(html).not.toContain("Helix");
    expect(html).not.toContain("Northline");
  });

  it("heat map quiets neutral / zero cells without changing values", () => {
    const html = renderToStaticMarkup(
      createElement(ExecutiveHeatMap, {
        title: "Region × Model Exposure",
        question: "Where is demand diverging?",
        cells: [
          {
            id: "hot",
            label: "QLD · Model H",
            value: 92,
            detail: "+22.9% · 6-period",
            tone: "attention",
          },
          {
            id: "zero",
            label: "WA · Model L",
            value: 0,
            detail: "—",
            tone: "improving",
          },
          {
            id: "flat",
            label: "NT · Model M",
            value: 0,
            detail: "+0% · 6-period",
            tone: "intelligence",
          },
        ],
        bare: true,
      }),
    );

    expect(html).toContain("+22.9%");
    expect(html).toContain('data-heat-quiet="true"');
    expect(html).toContain("WA · Model L");
    expect(html).toContain("+0%");
  });

  it("continuity band remains available when continuity model is present", () => {
    const a = runManufacturingValidationFromTabular({
      tabularText: readFileSync(MFG, "utf8"),
      organisationId: "org-phase66-cont",
      organisationName: "Design Partner Manufacturing",
      filename: "demo-manufacturing-forecast.csv",
    });
    const active = activateExecutiveSnapshotContext({
      studioId: "studio_66_cont",
      snapshotId: a.snapshot!.meta.snapshotId,
      organisationId: "org-phase66-cont",
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

    // Continuity may be empty on first snapshot — surface still honest.
    if (model.continuity) {
      expect(html).toContain('data-since-last-looked="true"');
      expect(html).toContain('data-accountability="true"');
    }
    expect(html).toContain("Executive insight");
    expect(html).toContain('data-exds-insight-bar="true"');
  });
});
