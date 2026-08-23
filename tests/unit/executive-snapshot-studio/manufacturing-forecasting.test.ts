/**
 * Phase 59 — Manufacturing Forecasting Intelligence validation.
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import {
  MANUFACTURING_FORECASTING_FIELDS,
  MANUFACTURING_FORECASTING_MODULE_ID,
} from "@/data-gateway";
import { detectBusinessProfile } from "@/executive-snapshot-studio/profile-detection";
import { inferMappingFromHeaders, parseTabularText } from "@/data-gateway";
import {
  runManufacturingValidationFromTabular,
} from "@/executive-snapshot-studio/intelligence";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
} from "@/executive-snapshot-studio/launch";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import { CommandCentreExperience } from "@/experience/mission-control/CommandCentreExperience";
import { containsDemoBusinessPhrase } from "@/experience/mission-control/snapshot-integrity";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import { scoreExecutiveReadiness } from "@/executive-snapshot-studio/readiness";

const FIXTURE = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);

function fixtureText(): string {
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
      id: "intent-mfg",
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

describe("Phase 59 Manufacturing Forecasting", () => {
  beforeEach(() => {
    clearExecutiveSnapshotLibrary();
  });

  it("exposes manufacturing forecasting data contract", () => {
    expect(MANUFACTURING_FORECASTING_MODULE_ID).toBe("manufacturing_forecasting");
    expect(MANUFACTURING_FORECASTING_FIELDS).toEqual(
      expect.arrayContaining([
        "model",
        "variant",
        "factory",
        "forecastQuantity",
        "actualQuantity",
        "productionCapacity",
        "inventoryDays",
      ]),
    );
  });

  it("detects manufacturing profile from forecast ontology", () => {
    const parsed = parseTabularText(fixtureText());
    const detection = detectBusinessProfile({
      headers: parsed.headers,
      records: parsed.records,
    });
    expect(detection.profileId).toBe("manufacturing");
    expect(detection.confidence).toBeGreaterThan(50);
    expect(detection.overrideAllowed).toBe(true);
  });

  it("maps manufacturing Excel headers via UDG", () => {
    const parsed = parseTabularText(fixtureText());
    const mapping = inferMappingFromHeaders(parsed.headers, {
      organisationId: "org_mfg_59",
      profileId: "manufacturing",
    });
    const targets = mapping.fields.map((f) => f.canonicalField);
    expect(targets).toEqual(
      expect.arrayContaining([
        "period",
        "region",
        "dealer",
        "model",
        "variant",
        "factory",
        "forecastQuantity",
        "actualQuantity",
      ]),
    );
  });

  it("runs manufacturing validation end-to-end from demonstration fixture", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_59",
      organisationName: "Demo Manufacturing",
      filename: "demo-manufacturing-forecast.csv",
      forceManufacturingProfile: true,
    });

    expect(result.ingested).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.profile.profileId).toBe("manufacturing");
    expect(result.analysis).toBeDefined();
    expect(result.analysis!.module).toBe("manufacturing_forecasting");
    expect(result.analysis!.demonstrationData).toBe(true);
    expect(result.analysis!.factories.length).toBeGreaterThanOrEqual(3);
    expect(result.analysis!.regions.length).toBeGreaterThanOrEqual(5);
    expect(result.analysis!.models.length).toBeGreaterThanOrEqual(4);
    expect(result.analysis!.variants.length).toBeGreaterThanOrEqual(8);
    expect(result.analysis!.periods.length).toBeGreaterThanOrEqual(12);
    expect(result.analysis!.dealers.length).toBeGreaterThanOrEqual(10);
    expect(result.analysis!.heatMap.length).toBeGreaterThan(0);
    expect(result.analysis!.nationalSeries.length).toBeGreaterThan(0);
    expect(result.analysis!.confidenceSlices.length).toBeGreaterThan(0);
    expect(result.analysis!.capacity.length).toBeGreaterThan(0);
    expect(result.analysis!.insights.length).toBeGreaterThan(0);
    expect(result.brief?.module).toBe("manufacturing_forecasting");
    expect(result.brief?.councilPosition).toMatch(/not yet established/i);
    expect(result.brief?.executiveValue).toMatch(/not yet quantified|insufficient|demonstrat/i);
    expect(result.readiness?.commercialDatasetReadiness).toBeGreaterThan(0);
    expect(result.readiness?.executiveReadiness).toBeGreaterThan(0);
  });

  it("surfaces demand, capacity, inventory, and confidence insights from data", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_59b",
      filename: "demo-manufacturing-forecast.csv",
    });
    const categories = new Set(result.analysis!.insights.map((i) => i.category));
    expect(categories.has("demand_movement") || categories.has("forecast_accuracy")).toBe(
      true,
    );
    expect(
      categories.has("capacity_implication") ||
        categories.has("inventory_implication") ||
        categories.has("forecast_confidence"),
    ).toBe(true);

    const heat = result.analysis!.heatMap.find(
      (c) => c.region === "QLD" && c.model === "Model H",
    );
    expect(heat).toBeDefined();
    expect(heat!.variancePct).not.toBeNull();
  });

  it("does not invent financial value when unsupported", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_59c",
      filename: "demo-manufacturing-forecast.csv",
    });
    expect(result.analysis!.executiveValue.quantified).toBe(false);
    expect(result.analysis!.executiveValue.revenueProtected).toBeNull();
  });

  it("projects manufacturing Command Centre without commercial instruments", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: fixtureText(),
      organisationId: "org_mfg_59d",
      organisationName: "Demo Manufacturing",
      filename: "demo-manufacturing-forecast.csv",
    });

    const active = activateExecutiveSnapshotContext({
      studioId: "studio_mfg_59",
      snapshotId: result.snapshot!.meta.snapshotId,
      organisationId: "org_mfg_59d",
      profileId: "manufacturing",
      profileLabel: "Manufacturing Forecast Intelligence",
      sourceKind: "excel",
      filename: "demo-manufacturing-forecast.csv",
      recordCount: result.snapshot!.meta.recordCount,
      confidenceOverall: result.snapshot!.meta.confidence.overall,
      readiness: result.readiness ?? minimalReadiness(),
      portfolio: emptyPortfolio(),
      manufacturingAnalysis: result.analysis,
      manufacturingBrief: result.brief,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [
        "Demand Planning Advisor",
        "Production Planning Advisor",
        "Inventory Advisor",
      ],
    });

    const model = buildCommandCentreExperience(active);
    expect(model.experienceModule).toBe("manufacturing_forecasting");
    expect(model.experienceKicker).toBe("Manufacturing Forecast Intelligence");
    expect(model.focusDomains.map((d) => d.label)).toEqual(
      expect.arrayContaining(["Demand", "Factory", "Inventory", "Capacity"]),
    );
    expect(model.heatMap).not.toBeNull();
    expect(model.forecastVsActual?.points.length).toBeGreaterThan(0);
    expect(model.confidenceBoard?.length).toBeGreaterThan(0);
    expect(model.ageing).toBeNull();
    expect(model.council.seats).toHaveLength(5);
    expect(model.council.established).toBe(false);
    expect(model.executiveValue.status).toMatch(/Not yet quantified/i);

    const blob = [
      model.leadJudgement,
      model.executiveInsight,
      ...model.metrics.map((m) => m.title),
    ].join("\n");
    expect(containsDemoBusinessPhrase(blob)).toBe(false);
    expect(blob).not.toMatch(/Ageing Exposure|Next-Step Evidence|Past-Close/i);
    expect(blob).not.toContain("Northline");
    expect(blob).not.toContain("Helix");

    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );
    expect(html).toContain("Manufacturing Forecast Intelligence");
    expect(html).toContain('data-experience-module="manufacturing_forecasting"');
    expect(html).toContain('data-exds-forecast-actual="true"');
    expect(html).toContain("Forecast Confidence");
    expect(html).toContain("Council position not yet established");
    expect(html).not.toContain("Ageing Exposure");
    expect(html).not.toContain("Pipeline in View");
  });

  it("keeps commercial Command Centre isolated from manufacturing analysis", () => {
    const commercial = activateExecutiveSnapshotContext({
      studioId: "studio_commercial_iso",
      snapshotId: "snap_commercial_iso",
      organisationId: "org_commercial_iso",
      profileId: "commercial",
      profileLabel: "Commercial Executive Intelligence",
      sourceKind: "excel",
      recordCount: 10,
      confidenceOverall: 80,
      readiness: minimalReadiness(),
      portfolio: emptyPortfolio(),
      analysis: undefined,
      commercialBrief: undefined,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });

    const model = buildCommandCentreExperience(commercial);
    expect(model.experienceModule).toBe("commercial");
    expect(model.forecastVsActual).toBeUndefined();
    expect(model.focusDomains.map((d) => d.label)).toEqual(
      expect.arrayContaining(["Pipeline", "Forecast", "Customers", "Product"]),
    );
    expect(model.experienceKicker).toBe("Command Centre");
  });
});
