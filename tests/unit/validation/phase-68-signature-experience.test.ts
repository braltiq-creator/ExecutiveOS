/**
 * Phase 68 — ExecutiveOS Signature Experience (composition only).
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
import { evidenceStripToNarrativeRows } from "@/experience/mission-control/EvidenceInstrumentDisclosure";
import { resetPilotRegistry } from "@/pilot";

const MFG = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);
const SF = resolve(
  process.cwd(),
  "fixtures/validation/salesforce-opportunity-export.csv",
);

describe("Phase 68 Signature Experience", () => {
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

  it("first viewport + narrative-consistent demand + technical visuals", () => {
    const a = runManufacturingValidationFromTabular({
      tabularText: readFileSync(MFG, "utf8"),
      organisationId: "org-phase68-mfg",
      organisationName: "Design Partner Manufacturing",
      filename: "demo-manufacturing-forecast.csv",
    });
    const active = activateExecutiveSnapshotContext({
      studioId: "studio_68_mfg",
      snapshotId: a.snapshot!.meta.snapshotId,
      organisationId: "org-phase68-mfg",
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

    // 1. First viewport hierarchy
    expect(html).toContain('data-command-centre-experience="phase-68"');
    expect(html).toContain('data-exds-hero-compact="true"');
    expect(html).toContain('data-cc-layer="brief"');
    expect(html).toContain(model.leadJudgement);
    expect(html).toContain(`${model.darkPanel.confidence}%`);
    expect(html).toContain('data-cc-primary-cta="true"');

    // 2. Evidence narrative consistency with hero strip
    const narrative = evidenceStripToNarrativeRows(model.darkPanel.evidenceStrip);
    expect(narrative.some((r) => r.roleTitle === "Lead signal")).toBe(true);
    expect(narrative.some((r) => r.roleTitle === "Counter-signal")).toBe(true);
    expect(html).toContain("Lead signal");
    expect(html).toContain("Supporting signal");
    expect(html).toContain("Counter-signal");
    expect(html).toContain("Operational implication");
    for (const row of narrative.slice(0, 4)) {
      expect(html).toContain(row.label);
      expect(html).toContain(row.value);
    }

    // 3–4. Technical visuals restored
    expect(html).toContain('data-exds-forecast-actual="true"');
    expect(html).toContain('data-forecast-visual="true"');
    expect(html).toContain('data-heat-preview="true"');
    expect(html).toContain('data-exds-heatmap="true"');
    expect(html).toContain("View full Region × Model");

    // 5. Progressive Evidence Lab
    expect(html).toContain('data-evidence-lab="true"');
    expect(html).toContain('data-evidence-tab="demand"');
    expect(html).toContain("Where is demand diverging?");
    expect(html).toContain("Is demand tracking the forecast?");

    // 6. Decision → Execution transition
    expect(html).toContain('data-cc-decision-flow="true"');
    expect(html).toContain("Selection has not occurred");
    expect(html).toContain("Open decision →");
    expect(html).toMatch(/href="[^"]*\/decisions/);
    expect(model.decisionPaper?.executionStatus).toBe("decision_required");

    // 7. Honest empty states
    expect(html).toContain("Council position not yet established");
    expect(html).toContain("Owner not yet assigned");

    // 8–10. Isolation / no fabricated demo leak
    expect(html).not.toContain("Helix");
    expect(html).not.toContain("Northline");
    expect(html).not.toMatch(/open pipeline|Salesforce opportunity/i);
    expect(html).toContain('data-snapshot-id="' + model.snapshotId + '"');
    expect(html).toContain('data-exds-briefing-index="true"');
  });

  it("commercial isolation preserved with signature composition", () => {
    const raw = runCommercialValidationFromTabular({
      tabularText: readFileSync(SF, "utf8"),
      organisationId: "org-phase68-com",
      organisationName: "Commercial Partner",
      filename: "salesforce-opportunity-export.csv",
    });
    const portfolio = portfolioFromCommercialAnalysis(raw.analysis!);
    const active = activateExecutiveSnapshotContext({
      studioId: "studio_68_com",
      snapshotId: raw.snapshot!.meta.snapshotId,
      organisationId: "org-phase68-com",
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
    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );
    expect(model.experienceModule).toBe("commercial");
    expect(html).toContain('data-command-centre-experience="phase-68"');
    expect(html).toContain('data-evidence-tab="exposure"');
    expect(html).not.toContain('data-evidence-tab="demand"');
    expect(html).not.toContain('data-capacity-inventory="true"');
    expect(html).not.toMatch(/Plant 1|Model H demand/i);
  });
});
