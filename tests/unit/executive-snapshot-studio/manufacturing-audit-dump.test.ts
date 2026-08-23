/**
 * Phase 59 audit helper — dumps manufacturing metrics for documentation.
 * @vitest-environment node
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { runManufacturingValidationFromTabular } from "@/executive-snapshot-studio/intelligence";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
} from "@/executive-snapshot-studio/launch";
import { portfolioFromManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-portfolio-bridge";

describe("Phase 59 audit dump", () => {
  it("writes manufacturing metric audit payload", () => {
    clearExecutiveSnapshotLibrary();
    const text = readFileSync(
      resolve(
        process.cwd(),
        "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
      ),
      "utf8",
    );
    const result = runManufacturingValidationFromTabular({
      tabularText: text,
      organisationId: "org_audit",
      filename: "demo-manufacturing-forecast.csv",
    });
    const a = result.analysis!;
    const portfolio = portfolioFromManufacturingAnalysis(a, "Audit");
    const active = activateExecutiveSnapshotContext({
      studioId: "studio_audit",
      snapshotId: result.snapshot!.meta.snapshotId,
      organisationId: "org_audit",
      profileId: "manufacturing",
      profileLabel: "Manufacturing Forecast Intelligence",
      sourceKind: "excel",
      filename: "demo-manufacturing-forecast.csv",
      recordCount: result.snapshot!.meta.recordCount,
      confidenceOverall: result.snapshot!.meta.confidence.overall,
      readiness: result.readiness!,
      portfolio,
      manufacturingAnalysis: a,
      manufacturingBrief: result.brief,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });
    const model = buildCommandCentreExperience(active);
    const latest = a.nationalSeries[a.nationalSeries.length - 1]?.period;

    const payload = {
      latestPeriod: latest,
      leadJudgement: model.leadJudgement,
      headline: model.darkPanel.headline,
      evidenceStrip: model.darkPanel.evidenceStrip,
      capacity: a.capacity,
      heatTop: [...a.heatMap]
        .sort((x, y) => (y.variancePct ?? 0) - (x.variancePct ?? 0))
        .slice(0, 8),
      heatBottom: [...a.heatMap]
        .sort((x, y) => (x.variancePct ?? 0) - (y.variancePct ?? 0))
        .slice(0, 4),
      modelH: a.heatMap.filter((c) => c.model === "Model H"),
      modelL: a.heatMap.filter((c) => c.model === "Model L"),
      nationalTail: a.nationalSeries.slice(-3),
      confidence: a.confidenceSlices,
      inventoryAttention: a.inventory.filter((i) => i.tone === "attention"),
      insights: a.insights.map((i) => ({
        id: i.id,
        cat: i.category,
        title: i.title,
        conf: i.confidence,
        posture: i.posture,
        evidence: i.evidence,
        detail: i.detail,
        implication: i.implication,
      })),
      brief: {
        executiveJudgement: result.brief?.executiveJudgement,
        whatChanged: result.brief?.whatChanged,
        why: result.brief?.whyItMatters,
        requires: result.brief?.whatRequiresJudgement,
        confidence: result.brief?.confidence,
      },
      readiness: {
        dataset: result.readiness?.commercialDatasetReadiness,
        executive: result.readiness?.executiveReadiness,
        recommendations: result.readiness?.recommendations,
        judgementNarrative: result.readiness?.judgementReadiness.narrative,
      },
      focusDomains: model.focusDomains,
      metrics: model.metrics,
      forecastVsActualTail: model.forecastVsActual?.points.slice(-3),
    };

    const out = resolve(
      process.cwd(),
      "docs/validation/PHASE_59_MANUFACTURING_METRIC_AUDIT_DUMP.json",
    );
    writeFileSync(out, JSON.stringify(payload, null, 2));
    expect(a.capacity.length).toBeGreaterThan(0);
  });
});
