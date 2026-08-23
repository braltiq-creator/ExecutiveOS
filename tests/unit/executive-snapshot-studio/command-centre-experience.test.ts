/**
 * Phase 58 — Executive Command Centre experience projection tests.
 * @vitest-environment jsdom
 */

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
} from "@/executive-snapshot-studio/launch";
import type { CommercialAnalysis } from "@/executive-snapshot-studio/intelligence/commercial-analysis";
import type { CommercialExecutiveBrief } from "@/executive-snapshot-studio/intelligence/commercial-brief";
import { scoreExecutiveReadiness } from "@/executive-snapshot-studio/readiness";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import { CommandCentreExperience } from "@/experience/mission-control/CommandCentreExperience";
import {
  assertNoDemoBusinessContext,
  containsDemoBusinessPhrase,
} from "@/experience/mission-control/snapshot-integrity";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import {
  ExecutiveJudgementPanel,
  ExecutiveNarrative,
  ExecutiveHeatMap,
} from "@/design-system/executive-experience";

function minimalReadiness() {
  return scoreExecutiveReadiness({
    confidence: {
      overall: 88,
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

function analysisFixture(): CommercialAnalysis {
  return {
    recordCount: 476,
    openCount: 135,
    closedCount: 341,
    totalPipelineValue: 18_000_000,
    openPipelineValue: 12_000_000,
    recurringOpenValue: 7_400_000,
    pastCloseOpenValue: 890_000,
    ageingOpenValue: 1_450_000,
    fieldCoverage: [
      { field: "nextStep", present: 40, total: 476, rate: 8 },
      { field: "industry", present: 400, total: 476, rate: 84 },
      { field: "product", present: 450, total: 476, rate: 94 },
      { field: "owner", present: 476, total: 476, rate: 100 },
      { field: "stageDuration", present: 120, total: 135, rate: 89 },
    ],
    stageDistribution: [
      { stage: "Proposal", count: 40, value: 3_000_000 },
      { stage: "Negotiation", count: 28, value: 2_500_000 },
      { stage: "Discovery", count: 35, value: 1_800_000 },
      { stage: "Closed Won", count: 200, value: 8_000_000 },
    ],
    ownerConcentration: [
      { owner: "A. Chen", count: 120, share: 25 },
      { owner: "B. Patel", count: 80, share: 17 },
    ],
    productConcentration: [
      { product: "SaaS Platform", count: 180, share: 38 },
      { product: "Services", count: 90, share: 19 },
    ],
    insights: [
      {
        id: "stale-open",
        category: "stale_opportunity",
        title: "Open opportunities are ageing in stage",
        detail:
          "53 open opportunities exceed the stage-duration threshold (≥ 120 days). Average open stage duration is 142 days.",
        implication:
          "53 open opportunities exceed the stage-duration threshold. Forecast credibility requires CRO judgement.",
        confidence: 78,
        posture: "investigate",
        evidence: [
          "53/135 open records exceed duration threshold.",
          "Stage Duration present on 120/135 open records.",
        ],
        evidenceCoverage: 89,
      },
      {
        id: "forecast-past-close",
        category: "forecast_risk",
        title: "Open records carry past close dates",
        detail: "7 open records have Close Date before today.",
        implication: "7 open opportunities carry past close dates.",
        confidence: 88,
        posture: "investigate",
        evidence: ["7 open records with Close Date in the past."],
        evidenceCoverage: 5,
      },
      {
        id: "dq-next-step",
        category: "data_quality",
        title: "Next-step evidence is thin",
        detail: "Activity evidence for what should happen next is largely absent.",
        confidence: 74,
        posture: "investigate",
        evidence: ["40/476 records carry Next Step."],
        evidenceCoverage: 8,
      },
    ],
    missingInformation: ["Activity history not present"],
    unsupportedConclusions: ["Cannot claim enterprise people health"],
    executiveValue: {
      pipelineInView: 12_000_000,
      potentialRevenue: 12_000_000,
      forecastExposure: 2_340_000,
      valueAtRisk: null,
      valueProtected: null,
      narrative: "Not yet quantified — pipeline in view only",
      quantified: false,
    },
    asOf: new Date().toISOString(),
  };
}

function briefFixture(): CommercialExecutiveBrief {
  return {
    title: "Commercial Executive Brief",
    executiveJudgement:
      "Commercial forecast credibility is constrained by ageing opportunities and insufficient next-step evidence.",
    evidence: [
      "53 opportunities exceed stage threshold",
      "7 open opportunities carry past close dates",
      "Next-step evidence is insufficient",
    ],
    businessImplication:
      "Commercial forecast credibility is constrained by ageing opportunities and insufficient next-step evidence.",
    councilPosition: "",
    councilDisagreement: [],
    uncertainty: ["Activity history not present"],
    recommendedJudgement: [
      "Which opportunities remain credible enough to carry forward?",
    ],
    executiveValue: "Not yet quantified",
    dataConfidence: "Calibrated to snapshot evidence",
    executiveSummary: "Commercial book requires judgement",
    commercialHealth: "Establishing — commercial uncertainty present",
    pipeline: "Pipeline in view",
    forecastConfidence: "Constrained",
    materialChanges: ["Ageing open opportunities"],
    priorityJudgements: ["Open commercial book requires judgement"],
    recommendedActions: ["Investigate"],
    confidence: 76,
    asOf: new Date().toISOString(),
  };
}

function portfolio(): OutcomePortfolio {
  return {
    overallScore: 72,
    statusLabel: "Commercial attention required",
    refreshedAt: new Date().toISOString(),
    executiveName: "Executive",
    outcomes: [],
    decisions: [],
    intent: {
      id: "intent-commercial",
      title: "Protect commercial forecast clarity",
      narrative: "Evidence-based commercial judgement",
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

function activate() {
  return activateExecutiveSnapshotContext({
    studioId: "studio_phase58",
    snapshotId: "snap_phase58",
    organisationId: "org_phase58",
    profileId: "commercial",
    profileLabel: "Commercial Executive Intelligence",
    sourceKind: "excel",
    filename: "report1786533305012.xls",
    recordCount: 476,
    confidenceOverall: 90,
    readiness: minimalReadiness(),
    portfolio: portfolio(),
    analysis: analysisFixture(),
    commercialBrief: briefFixture(),
    councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
    advisorNames: ["Go-to-Market Advisor"],
  });
}

describe("Phase 58 Command Centre experience", () => {
  beforeEach(() => {
    clearExecutiveSnapshotLibrary();
    sessionStorage.clear();
  });

  it("derives Lead Judgement and evidence metrics from active snapshot", () => {
    const model = buildCommandCentreExperience(activate());
    expect(model.leadJudgement).toMatch(/forecast credibility|ageing|next-step/i);
    expect(model.evidenceMetrics.length).toBeGreaterThanOrEqual(2);
    expect(
      model.evidenceMetrics.some((m) => /53|142|7|\$12|\$7\.4/i.test(m.value)),
    ).toBe(true);
    expect(containsDemoBusinessPhrase(model.leadJudgement)).toBe(false);
  });

  it("builds dark judgement panel without manufacturing consensus", () => {
    const model = buildCommandCentreExperience(activate());
    expect(model.darkPanel.judgement).toMatch(/forecast credibility|ageing/i);
    expect(model.darkPanel.evidence.length).toBeGreaterThan(0);
    expect(model.darkPanel.requiresJudgement).toMatch(
      /credible|judgement|opportunit/i,
    );
    expect(model.council.framing).toMatch(/not yet established/i);
    expect(model.council.established).toBe(false);
    expect(model.council.seats).toHaveLength(5);
    expect(model.council.seats.every((s) => s.agreement === 0)).toBe(true);
  });

  it("prioritises supported evidence cards and collapses unsupported domains", () => {
    const model = buildCommandCentreExperience(activate());
    const titles = model.metrics.map((m) => m.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Ageing Exposure",
        "Pipeline in View",
        "Next-Step Evidence",
        "Past-Close Exposure",
        "Commercial Health",
      ]),
    );
    expect(
      titles.every(
        (t) => !/Organisation Health|People Health|System Health/i.test(t),
      ),
    ).toBe(true);
    expect(model.evidenceCoverage.supported).toEqual(
      expect.arrayContaining(["Pipeline", "Opportunity ageing", "Owner"]),
    );
    expect(model.evidenceCoverage.notEstablished).toEqual(
      expect.arrayContaining(["Strategic outcomes", "People health"]),
    );
  });

  it("builds heat map and ageing distribution from analysis", () => {
    const model = buildCommandCentreExperience(activate());
    expect(model.heatMap).not.toBeNull();
    expect(model.heatMap!.question).toMatch(/exposure/i);
    expect(model.heatMap!.cells.length).toBeGreaterThan(0);
    expect(model.ageing).not.toBeNull();
    expect(model.ageing!.beyondCount).toBe(53);
    expect(model.ageing!.averageLabel).toMatch(/142/);
  });

  it("keeps Executive Value not yet quantified with evidence required", () => {
    const model = buildCommandCentreExperience(activate());
    expect(model.executiveValue.status).toMatch(/Not yet quantified/i);
    expect(model.executiveValue.evidenceRequired.length).toBeGreaterThan(0);
  });

  it("preserves real snapshot isolation — no seeded demo phrases", () => {
    const model = buildCommandCentreExperience(activate());
    const blob = [
      model.leadJudgement,
      model.darkPanel.judgement,
      model.council.framing,
      ...model.queue.map((q) => q.title),
      ...model.stream.map((e) => e.title),
      ...model.timeline.map((e) => e.title),
    ].join("\n");
    assertNoDemoBusinessContext(blob);
    expect(blob).not.toContain("Quarterly Strategy Review");
    expect(blob).not.toContain("Helix");
    expect(blob).not.toContain("Northline");
  });

  it("renders EXDS Command Centre markup with judgement hierarchy", () => {
    const model = buildCommandCentreExperience(activate());
    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );
    expect(html).toContain("What requires executive judgement today?");
    expect(html).toContain('data-exds-hero="true"');
    expect(html).toContain('data-exds-judgement-panel="true"');
    expect(html).toContain('data-exds-heatmap="true"');
    expect(html).toContain('data-ageing-distribution="true"');
    expect(html).toContain('data-evidence-coverage="true"');
    expect(html).toContain('data-executive-value="true"');
    expect(html).toContain("Council position not yet established");
    expect(html).toContain("Evidence coverage");
    expect(html).toContain("Not currently established");
    expect(html).not.toContain("Organisation Health");
    expect(html).not.toContain("People Health");
    expect(html).not.toContain("Quarterly Strategy Review");
  });

  it("Phase 58A isolates Queue, Stream, and Council in separate sections", () => {
    const model = buildCommandCentreExperience(activate());
    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );

    expect(html).toContain('data-cc-intelligence-pair="true"');
    expect(html).toContain('data-judgement-queue="true"');
    expect(html).toContain('data-intelligence-stream="true"');
    expect(html).toContain('data-cc-council="true"');
    expect(html).toContain('data-cc-honesty="true"');

    const queueIdx = html.indexOf('data-judgement-queue="true"');
    const streamIdx = html.indexOf('data-intelligence-stream="true"');
    const councilIdx = html.indexOf('data-cc-council="true"');
    const honestyIdx = html.indexOf('data-cc-honesty="true"');

    expect(queueIdx).toBeGreaterThan(-1);
    expect(streamIdx).toBeGreaterThan(queueIdx);
    expect(councilIdx).toBeGreaterThan(streamIdx);
    expect(honestyIdx).toBeGreaterThan(councilIdx);

    expect(html).not.toMatch(/absolute\s+inset-0/);
    expect(html).not.toMatch(/z-\[([5-9]|\d{2,})\]/);
  });

  it("Phase 58B applies executive visual DNA markers and editorial surfaces", () => {
    const model = buildCommandCentreExperience(activate());
    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );

    expect(html).toContain('data-visual-dna="executive"');
    expect(html).toContain('data-exds-hero="true"');
    expect(html).toContain('data-exds-evidence-surface="true"');
    expect(html).toContain('data-exds-council="dark"');
    expect(html).toContain('data-exds-decision-statement="true"');
    expect(html).toMatch(/What requires (your|executive) judgement/);
    expect(html).toContain("Where is ageing accumulating?");
    expect(html).toMatch(/01|02/);
  });

  it("Phase 58C projects profile-aware rail, focus, overnight, and insight", () => {
    const model = buildCommandCentreExperience(activate());

    expect(model.profileId).toBe("commercial");
    expect(model.talkTrack.length).toBeGreaterThan(0);
    expect(model.talkTrack.length).toBeLessThanOrEqual(3);
    expect(model.walkItems.length).toBeGreaterThan(0);
    expect(model.walkItems.length).toBeLessThanOrEqual(4);
    expect(model.walkItems[0]?.index).toMatch(/01/);
    expect(model.focusDomains.map((d) => d.label)).toEqual(
      expect.arrayContaining(["Pipeline", "Customers", "Forecast", "Product"]),
    );
    expect(
      model.focusDomains.every(
        (d) => !/Factory|Inventory|Dealer/i.test(d.label),
      ),
    ).toBe(true);
    expect(model.overnight.length).toBeGreaterThan(0);
    expect(model.executiveInsight).toMatch(/forecast|judgement|ageing|next-step/i);
    expect(containsDemoBusinessPhrase(model.executiveInsight)).toBe(false);

    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );
    expect(html).toContain('data-exds-context-rail="true"');
    expect(html).toContain('data-evidence-lab="true"');
    expect(html).toContain('data-exds-overnight="true"');
    expect(html).toContain('data-exds-insight-bar="true"');
    expect(html).toContain("Command Centre");
    expect(html).toContain("Executive Brief");
    expect(html).toContain('data-exds-briefing-index="true"');
    expect(html).toContain("Walk the experience");
    expect(html).toContain("Priority decisions");
    expect(html).toContain("Executive insight");
    expect(html).toContain("Pipeline");
    expect(html).not.toContain("Factory Reality");
    expect(html).not.toContain("Demand Signals");
  });

  it("Phase 58C manufacturing profile uses manufacturing focus domains", () => {
    const commercial = activate();
    clearExecutiveSnapshotLibrary();
    sessionStorage.clear();
    const manufacturing = activateExecutiveSnapshotContext({
      studioId: "studio_phase58_mfg",
      snapshotId: "snap_phase58_mfg",
      organisationId: "org_phase58_mfg",
      profileId: "manufacturing",
      profileLabel: "Manufacturing Executive Intelligence",
      sourceKind: "excel",
      filename: "mfg.xls",
      recordCount: 10,
      confidenceOverall: 70,
      readiness: minimalReadiness(),
      portfolio: portfolio(),
      analysis: undefined,
      commercialBrief: undefined,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });
    const model = buildCommandCentreExperience(manufacturing);
    expect(model.focusDomains.map((d) => d.label)).toEqual(
      expect.arrayContaining(["Demand", "Factory", "Inventory", "Capacity"]),
    );
    expect(
      model.focusDomains.every((d) => !/Pipeline|Forecast/i.test(d.label)),
    ).toBe(true);
    expect(commercial.profileId).toBe("commercial");
  });

  it("Phase 58D / 66–68 composes visual intelligence hierarchy without card walls", () => {
    const model = buildCommandCentreExperience(activate());
    expect(model.darkPanel.headline).toMatch(/53|threshold|ageing/i);
    expect(model.darkPanel.evidenceStrip.length).toBeGreaterThan(0);
    expect(model.evidenceMetrics.length).toBeLessThanOrEqual(4);
    expect(model.walkItems.length).toBeLessThanOrEqual(4);

    const html = renderToStaticMarkup(
      createElement(CommandCentreExperience, { model }),
    );
    expect(html).toContain('data-command-centre-experience="phase-68"');
    expect(html).toContain('data-visual-refinement="visual-intelligence"');
    expect(html).toContain('data-evidence-lab="true"');
    expect(html).toContain('data-cc-hierarchy="brief-investigate-decide-execute"');
    expect(html).toContain("Evidence strip");
    expect(html).toContain("What requires your judgement?");
    expect(html).toContain("Where is commercial exposure concentrated?");
    expect(html).toContain("Ageing");
    expect(html).not.toContain("Key evidence sequence");
    expect(html).not.toContain("Helix");
    expect(html).not.toContain("Northline");
  });

  it("EXDS primitives render Lead Judgement and dark panel", () => {
    const narrative = renderToStaticMarkup(
      createElement(ExecutiveNarrative, {
        judgement: "Test judgement",
        evidenceMetrics: [
          { id: "a", label: "Ageing", value: "53", tone: "attention" },
        ],
      }),
    );
    expect(narrative).toContain("Executive judgement");
    expect(narrative).toContain("53");

    const panel = renderToStaticMarkup(
      createElement(ExecutiveJudgementPanel, {
        judgement: "Credibility constrained",
        evidence: [{ id: "1", text: "53 beyond threshold" }],
        requiresJudgement: "Which opportunities remain credible?",
        confidence: 76,
      }),
    );
    expect(panel).toContain("What requires your judgement?");
    expect(panel).toContain("Credibility constrained");

    const heat = renderToStaticMarkup(
      createElement(ExecutiveHeatMap, {
        title: "Opportunity Exposure",
        question: "Where is exposure concentrated?",
        cells: [
          { id: "1", label: "Proposal", value: 80, tone: "attention" },
        ],
      }),
    );
    expect(heat).toContain("Opportunity Exposure");
    expect(heat).toContain("Semantic colour legend");
  });
});
