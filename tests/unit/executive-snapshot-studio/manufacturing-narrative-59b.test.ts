/**
 * Phase 59B — Manufacturing executive narrative & evidence hierarchy.
 * Experience composition only — formulas unchanged.
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { runManufacturingValidationFromTabular } from "@/executive-snapshot-studio/intelligence";
import { MANUFACTURING_VARIANCE_WINDOW_PERIODS } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
} from "@/executive-snapshot-studio/launch";
import { scoreExecutiveReadiness } from "@/executive-snapshot-studio/readiness";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import { CommandCentreExperience } from "@/experience/mission-control/CommandCentreExperience";
import {
  buildManufacturingEvidenceHierarchy,
  isGenericFramingTitle,
  resolveJudgementConfidence,
  resolveManufacturingLeadJudgement,
} from "@/experience/mission-control/manufacturing-evidence-hierarchy";
import type { OutcomePortfolio } from "@/lib/outcomes/types";

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
      id: "intent-mfg-59b",
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

function activateManufacturing() {
  const result = runManufacturingValidationFromTabular({
    tabularText: fixtureText(),
    organisationId: "org_mfg_59b_narrative",
    organisationName: "Demo Manufacturing",
    filename: "demo-manufacturing-forecast.csv",
  });

  const active = activateExecutiveSnapshotContext({
    studioId: "studio_mfg_59b",
    snapshotId: result.snapshot!.meta.snapshotId,
    organisationId: "org_mfg_59b_narrative",
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

  return { result, active, model: buildCommandCentreExperience(active) };
}

describe("Phase 59B Manufacturing executive narrative", () => {
  beforeEach(() => {
    clearExecutiveSnapshotLibrary();
  });

  it("keeps a single data-derived lead judgement without hard-coded Model H", () => {
    const { result, model } = activateManufacturing();
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/experience/mission-control/manufacturing-command-centre.ts",
      ),
      "utf8",
    );
    const hierarchySource = readFileSync(
      resolve(
        process.cwd(),
        "src/experience/mission-control/manufacturing-evidence-hierarchy.ts",
      ),
      "utf8",
    );

    expect(source).not.toMatch(/Model H demand has moved above plan/);
    expect(hierarchySource).not.toMatch(/Model H demand has moved above plan/);

    const resolved = resolveManufacturingLeadJudgement(
      result.analysis!,
      result.brief,
    );
    expect(resolved).toBe(model.leadJudgement);
    expect(model.darkPanel.headline).toBe(model.leadJudgement);
    expect(isGenericFramingTitle(model.leadJudgement)).toBe(false);
    expect(model.leadJudgement).toMatch(/demand has moved above plan|softening/i);

    // Demo fixture currently ranks Model H first — assert via analysis, not UI hard-code.
    const accel = result.analysis!.insights.find(
      (i) => i.id === "demand-acceleration",
    );
    expect(accel?.title).toBe(model.leadJudgement);
    expect(model.leadJudgement).toContain(
      accel!.title.match(/^(Model\s+\S+)/i)![1]!,
    );
  });

  it("does not let generic framing compete with the lead judgement", () => {
    const { model } = activateManufacturing();
    expect(model.experienceKicker).toBe("Manufacturing Forecast Intelligence");
    expect(model.leadJudgement).not.toMatch(
      /manufacturing forecast requires executive judgement/i,
    );
    expect(model.darkPanel.headline).not.toMatch(
      /manufacturing forecast requires executive judgement/i,
    );
    expect(model.executiveInsight).toBe(model.leadJudgement.slice(0, 180));
  });

  it("ranks supporting evidence above unrelated absolute magnitude", () => {
    const { result, model } = activateManufacturing();
    const hierarchy = buildManufacturingEvidenceHierarchy(
      result.analysis!,
      model.leadJudgement,
      4,
    );

    expect(hierarchy[0]?.role).toBe("PRIMARY_SUPPORT");
    expect(hierarchy[1]?.role).toBe("PRIMARY_SUPPORT");
    expect(hierarchy.some((h) => h.role === "COUNTER_SIGNAL")).toBe(true);
    expect(hierarchy.some((h) => h.role === "OPERATIONAL_IMPLICATION")).toBe(
      true,
    );

    const roles = hierarchy.map((h) => h.role);
    const primaryIdx = roles.indexOf("PRIMARY_SUPPORT");
    const counterIdx = roles.indexOf("COUNTER_SIGNAL");
    const opsIdx = roles.indexOf("OPERATIONAL_IMPLICATION");
    expect(primaryIdx).toBeLessThan(counterIdx);
    expect(counterIdx).toBeLessThan(opsIdx);

    // SA Model L may have larger |variance| but must not outrank primary support.
    const sa = hierarchy.find((h) => /SA.*Model L/i.test(h.label));
    const qld = hierarchy.find((h) => /QLD.*Model H/i.test(h.label));
    expect(qld).toBeDefined();
    expect(qld!.role).toBe("PRIMARY_SUPPORT");
    if (sa) {
      expect(sa.role).toBe("COUNTER_SIGNAL");
      expect(hierarchy.indexOf(qld!)).toBeLessThan(hierarchy.indexOf(sa));
    }

    expect(model.darkPanel.evidenceStrip[0]?.role).toBe("PRIMARY_SUPPORT");
    expect(model.darkPanel.evidenceStrip.map((e) => e.role)).toEqual(
      hierarchy.map((h) => h.role),
    );
  });

  it("keeps counter-signals and operational implications distinguishable", () => {
    const { model } = activateManufacturing();
    const strip = model.darkPanel.evidenceStrip;
    expect(strip.some((s) => s.role === "COUNTER_SIGNAL")).toBe(true);
    expect(strip.some((s) => s.role === "OPERATIONAL_IMPLICATION")).toBe(true);
    expect(
      strip.find((s) => s.role === "COUNTER_SIGNAL")?.caption,
    ).toMatch(/counter-signal/i);
    expect(
      strip.find((s) => s.role === "OPERATIONAL_IMPLICATION")?.caption,
    ).toMatch(/operational/i);
  });

  it("labels Region × Model variance with the six-period window", () => {
    expect(MANUFACTURING_VARIANCE_WINDOW_PERIODS).toBe(6);
    const { model } = activateManufacturing();
    expect(model.heatMap?.question).toMatch(/6-period actual vs forecast/i);
    const varianceItems = model.darkPanel.evidenceStrip.filter(
      (s) => s.role === "PRIMARY_SUPPORT" || s.role === "COUNTER_SIGNAL",
    );
    for (const item of varianceItems) {
      expect(item.detail).toMatch(/6-period actual vs forecast/i);
    }
  });

  it("uses judgement-specific confidence rather than national HIGH alone", () => {
    const { result, model } = activateManufacturing();
    const national = result.analysis!.confidenceSlices.find(
      (s) => s.id === "national",
    );
    const judgementConf = resolveJudgementConfidence(
      result.analysis!,
      model.leadJudgement,
    );
    expect(model.darkPanel.confidence).toBe(judgementConf);
    expect(model.darkPanel.confidenceLabel).toMatch(/Judgement confidence/i);
    expect(national?.score).toBeGreaterThan(judgementConf);
    expect(model.metrics.some((m) => m.id === "judgement-confidence")).toBe(
      true,
    );
  });

  it("preserves extreme capacity values and denominator language", () => {
    const { result, model } = activateManufacturing();
    const plant1 = result.analysis!.capacity.find((c) => c.factory === "Plant 1");
    const plant2 = result.analysis!.capacity.find((c) => c.factory === "Plant 2");
    const plant3 = result.analysis!.capacity.find((c) => c.factory === "Plant 3");
    expect(plant1?.loadPct).toBe(536.2);
    expect(plant2?.loadPct).toBe(366.7);
    expect(plant3?.loadPct).toBe(308.3);

    const board = model.capacityBoard ?? [];
    expect(board.find((c) => c.factory === "Plant 1")?.loadPct).toBe(536.2);
    expect(board.find((c) => c.factory === "Plant 2")?.loadPct).toBe(366.7);
    expect(board.find((c) => c.factory === "Plant 3")?.loadPct).toBe(308.3);

    const ops = model.darkPanel.evidenceStrip.find(
      (s) => s.role === "OPERATIONAL_IMPLICATION",
    );
    expect(ops?.detail).toMatch(/of plant capacity/i);
    expect(ops?.detail).toMatch(/units demand vs/i);
  });

  it("keeps Executive Value and Council unset", () => {
    const { model } = activateManufacturing();
    expect(model.executiveValue.status).toMatch(/Not yet quantified/i);
    expect(model.council.established).toBe(false);
    expect(model.council.framing).toMatch(/not yet established/i);
    expect(model.council.seats).toHaveLength(5);
    expect(model.council.seats.map((s) => s.role)).toEqual([
      "CEO",
      "CFO",
      "COO",
      "CRO",
      "CSO",
    ]);
  });

  it("renders narrative hierarchy without commercial instruments", () => {
    const { model } = activateManufacturing();
    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );
    expect(html).toContain('data-narrative-hierarchy="phase-59b"');
    expect(html).toContain('data-evidence-hierarchy="true"');
    expect(html).toContain('data-narrative-chain="true"');
    expect(html).toContain("Judgement confidence");
    expect(html).toContain("Supports lead judgement");
    expect(html).toContain("6-period actual vs forecast");
    expect(html).not.toContain("Ageing Exposure");
    expect(html).not.toContain("Pipeline in View");
    expect(html).not.toContain("Northline");
  });

  it("keeps commercial Salesforce journey isolated from manufacturing instruments", () => {
    const commercial = activateExecutiveSnapshotContext({
      studioId: "studio_commercial_59b_iso",
      snapshotId: "snap_commercial_59b_iso",
      organisationId: "org_commercial_59b_iso",
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
    expect(model.narrativeChain == null || model.narrativeChain === null).toBe(
      true,
    );
    expect(model.forecastVsActual).toBeUndefined();
    expect(model.focusDomains.map((d) => d.label)).toEqual(
      expect.arrayContaining(["Pipeline", "Forecast", "Customers", "Product"]),
    );
    expect(model.experienceKicker).toBe("Command Centre");
  });
});
