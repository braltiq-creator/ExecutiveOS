/**
 * Phase 57F — Command Centre context integrity.
 * Real Executive Snapshot projection must never mix Northline/Helix demo state.
 *
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import { createIsolatedIntentProfile } from "@/intelligence/executive-intelligence/lib/isolated-context";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
  getActiveExecutiveSnapshot,
} from "@/executive-snapshot-studio/launch";
import type { CommercialAnalysis } from "@/executive-snapshot-studio/intelligence/commercial-analysis";
import type { CommercialExecutiveBrief } from "@/executive-snapshot-studio/intelligence/commercial-brief";
import { buildMissionKpis, buildExecutivePulse } from "@/experience/mission-control/derive";
import {
  DEMO_BUSINESS_PHRASES,
  assertNoDemoBusinessContext,
  buildSnapshotCommercialBriefView,
  buildSnapshotCouncilBrief,
  buildSnapshotIntegrityKpis,
  buildSnapshotIntegrityPulse,
  buildSnapshotIntelligenceStream,
  buildSnapshotJudgementQueue,
  containsDemoBusinessPhrase,
  hasCommercialObservations,
} from "@/experience/mission-control/snapshot-integrity";
import { scoreExecutiveReadiness } from "@/executive-snapshot-studio/readiness";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

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

function commercialAnalysis(): CommercialAnalysis {
  return {
    recordCount: 476,
    openCount: 135,
    closedCount: 341,
    totalPipelineValue: 12_000_000,
    openPipelineValue: 4_200_000,
    recurringOpenValue: 1_100_000,
    pastCloseOpenValue: 890_000,
    ageingOpenValue: 1_450_000,
    fieldCoverage: [],
    stageDistribution: [],
    ownerConcentration: [],
    productConcentration: [],
    insights: [
      {
        id: "ins-ageing",
        category: "stage_risk",
        title: "Open opportunities are ageing in stage",
        detail: "A material share of open records exceeds expected stage duration.",
        implication: "Forecast clarity erodes while ageing continues.",
        confidence: 78,
        posture: "investigate",
        evidence: ["Stage duration distribution from snapshot"],
        evidenceCoverage: 72,
      },
      {
        id: "ins-past-close",
        category: "stale_opportunity",
        title: "Past-close opportunities require judgement",
        detail: "Open records with close dates in the past remain in view.",
        confidence: 82,
        posture: "act",
        evidence: ["Close date vs as-of"],
        evidenceCoverage: 80,
      },
      {
        id: "ins-next-step",
        category: "data_quality",
        title: "Next-step evidence is thin",
        detail: "Many open records lack a documented next step.",
        confidence: 74,
        posture: "investigate",
        evidence: ["Next Step field coverage"],
        evidenceCoverage: 40,
      },
      {
        id: "ins-book",
        category: "executive_judgement",
        title: "Open commercial book requires judgement",
        detail: "135 open records remain in the Executive Snapshot.",
        confidence: 80,
        posture: "investigate",
        evidence: ["Open count 135"],
        evidenceCoverage: 90,
      },
    ],
    missingInformation: ["Activity history not present in this export"],
    unsupportedConclusions: ["Cannot claim enterprise people health from CRM"],
    executiveValue: {
      pipelineInView: 4_200_000,
      potentialRevenue: null,
      forecastExposure: null,
      valueAtRisk: null,
      valueProtected: null,
      narrative: "Not yet quantified — pipeline in view only",
      quantified: false,
    },
    asOf: new Date().toISOString(),
  };
}

function commercialBrief(): CommercialExecutiveBrief {
  return {
    title: "Commercial Executive Brief",
    executiveJudgement:
      "Commercial evidence currently indicates ageing open opportunities and thin next-step evidence. Strategic priorities have not yet been established.",
    evidence: [
      "Open opportunities ageing in stage",
      "Past-close opportunities in view",
      "Thin Next Step evidence",
    ],
    businessImplication:
      "Commercial uncertainty compounds while ageing and evidence gaps remain unexamined.",
    councilPosition: "",
    councilDisagreement: [],
    uncertainty: ["Activity history not present"],
    recommendedJudgement: [
      "Investigate ageing open opportunities",
      "Investigate thin next-step evidence",
    ],
    executiveValue: "Not yet quantified",
    dataConfidence: "Calibrated to Salesforce opportunity export evidence",
    executiveSummary: "Commercial book requires judgement",
    commercialHealth: "Establishing — commercial uncertainty present",
    pipeline: "Pipeline in view across open records",
    forecastConfidence: "Constrained by missing activity evidence",
    materialChanges: ["Ageing open opportunities"],
    priorityJudgements: ["Open commercial book requires judgement"],
    recommendedActions: ["Investigate"],
    confidence: 76,
    asOf: new Date().toISOString(),
  };
}

function commercialPortfolio(label: string): OutcomePortfolio {
  return {
    overallScore: 72,
    statusLabel: "Commercial attention required",
    refreshedAt: new Date().toISOString(),
    executiveName: "Executive",
    outcomes: [
      {
        id: "outcome-ageing",
        name: "Ageing open opportunities",
        description: label,
        status: "watching",
        healthScore: 58,
        yesterdayMovement: 0,
        yesterdayMovementLabel: "Unchanged",
        expectedTrajectory: {
          direction: "stable",
          summary: "Requires judgement",
          horizonLabel: "This cycle",
        },
        decisionIds: ["decision-ageing"],
        contributingInsights: [],
        pendingActions: [],
        confidence: 74,
        owner: "CRO",
        targetDate: new Date().toISOString().slice(0, 10),
        businessImpact: label,
        timeline: [],
        contributors: [],
        blockers: [],
        recommendations: [],
        forecast: {
          horizonLabel: "Near term",
          expectedScore: 58,
          direction: "stable",
          narrative: label,
          assumptions: [],
        },
        history: [],
        relationships: [],
        overnightSignals: [],
        calendarContext: [],
      },
    ],
    decisions: [
      {
        id: "decision-ageing",
        question: "Open commercial book requires judgement",
        outcomeIds: ["outcome-ageing"],
        status: "under_review",
        owner: "CRO",
        deadline: "This week",
        confidence: 74,
        businessImpact: label,
        expectedOutcomeImpact: label,
        costOfDelay: "Commercial uncertainty compounds",
        whatChanged: "Ageing book",
        why: label,
        whatShouldHappenNext: "Investigate",
        stakeholders: [],
        evidence: [],
        alternatives: [],
        tradeOffs: [],
        relationships: [],
        timeline: [],
        history: [],
        approvalWorkflow: [],
        recommendationSummary: "Investigate",
      },
    ],
    intent: {
      id: "intent-commercial",
      title: "Protect commercial forecast clarity",
      narrative: "Evidence-based commercial judgement",
      priority: "high",
      horizon: "This quarter",
      reviewDate: new Date().toISOString().slice(0, 10),
      reviewCadence: "Weekly",
      focusOutcomeIds: ["outcome-ageing"],
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

function activateCommercial(studioId: string, snapshotId: string, label: string) {
  return activateExecutiveSnapshotContext({
    studioId,
    snapshotId,
    organisationId: `org-${studioId}`,
    organisationName: undefined,
    profileId: "commercial",
    profileLabel: "Commercial Executive Intelligence",
    sourceKind: "excel",
    filename: "report1786533305012.xls",
    recordCount: 476,
    confidenceOverall: 90,
    readiness: minimalReadiness(),
    portfolio: commercialPortfolio(label),
    analysis: commercialAnalysis(),
    commercialBrief: commercialBrief(),
    councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
    advisorNames: ["Go-to-Market Advisor"],
  });
}

function demoPresentationSnapshot(): ExecutiveSnapshot {
  return {
    asOf: new Date().toISOString(),
    greeting: "Good morning, Alex",
    pulse: {
      level: "attention",
      label: "Organisation Attention",
      why: "Leadership capacity overdrawn",
      confidence: 69,
      aiConfidence: 70,
      refreshedAt: new Date().toISOString(),
      refreshedLabel: "Updated just now",
      href: "/today",
    },
    compass: { dimensions: [] },
    executiveState: {
      decisionLoad: "high",
      capacity: "overdrawn",
      attentionBudget: "fragmented",
      summary: "Quarterly Strategy Review context",
      href: "/today",
    },
    metrics: [],
    outcomes: MOCK_OUTCOME_PORTFOLIO.outcomes.slice(0, 6).map((o) => ({
      id: o.id,
      name: o.name,
      status: o.status,
      healthScore: o.healthScore,
      movementLabel: o.yesterdayMovementLabel,
      href: `/outcomes/${o.id}`,
    })),
    priorityDecisions: MOCK_OUTCOME_PORTFOLIO.decisions.slice(0, 3).map((d) => ({
      id: d.id,
      title: d.question,
      status: d.status,
      href: `/decisions/${d.id}`,
      why: d.why,
    })),
    recommendedActions: [
      {
        id: "act-option",
        title: "Have counsel circulate the option paper",
        why: "Needs option paper",
        href: "/decisions",
        expectedOutcome: "Prepared",
        expectedImpact: "Clarity",
      },
    ],
    sinceYesterday: [],
    calendarContext: [],
  } as unknown as ExecutiveSnapshot;
}

describe("Phase 57F Command Centre context integrity", () => {
  beforeEach(() => {
    clearExecutiveSnapshotLibrary();
    sessionStorage.clear();
  });

  it("real snapshot KPIs prevent demo health / outcomes / decisions scores", () => {
    const active = activateCommercial("studio_a", "snap_a", "Commercial A");
    const kpis = buildSnapshotIntegrityKpis({ active });
    const blob = kpis.map((k) => `${k.label}:${k.value}`).join("|");

    expect(blob).not.toMatch(/\b69\b/);
    expect(blob).not.toMatch(/\b74\b/);
    expect(blob).not.toMatch(/\b36\b/);
    expect(blob).not.toMatch(/\b68\b/);
    expect(kpis.find((k) => k.id === "organisation_health")?.value).toBe(
      "Not yet established",
    );
    expect(kpis.find((k) => k.id === "customer_health")?.value).toBe(
      "Not yet established",
    );
    expect(kpis.find((k) => k.id === "people_health")?.value).toBe(
      "Not yet established",
    );
    expect(kpis.find((k) => k.id === "system_health")?.value).toBe(
      "Not yet established",
    );
    expect(kpis.find((k) => k.id === "strategic_outcomes")?.value).toBe(
      "Not yet established",
    );
    expect(kpis.find((k) => k.id === "priority_decisions")?.value).toMatch(
      /candidates|Judgement required/i,
    );
    expect(kpis.find((k) => k.id === "executive_value")?.value).toMatch(
      /Not yet quantified/i,
    );
    expect(kpis.find((k) => k.id === "commercial_health")?.value).toMatch(
      /Establishing|uncertain/i,
    );
    assertNoDemoBusinessContext(blob);
  });

  it("real snapshot pulse prevents demo Revenue / Leadership capacity statements", () => {
    const active = activateCommercial("studio_a", "snap_a", "Commercial A");
    const pulse = buildSnapshotIntegrityPulse({ active });
    const blob = pulse.signals.map((s) => s.text).join(" ");

    expect(blob).not.toContain("Revenue improving");
    expect(blob).not.toContain("Leadership capacity overdrawn");
    expect(blob.toLowerCase()).toMatch(/commercial evidence|ageing|next.?step|past.?close/);
    assertNoDemoBusinessContext(blob);
  });

  it("real snapshot council prevents Proceed / Majority / Watch COO", () => {
    const active = activateCommercial("studio_a", "snap_a", "Commercial A");
    const council = buildSnapshotCouncilBrief(active);
    const blob = `${council.brief.headline} ${council.brief.agreementLabel} ${council.outcomeName}`;

    expect(council.brief.headline).toMatch(/not yet established/i);
    expect(blob).not.toContain("Proceed");
    expect(blob).not.toContain("Majority agreement");
    expect(blob).not.toContain("Watch COO");
    expect(council.outcomeName).toMatch(/not yet established/i);
  });

  it("real snapshot meeting pack is not prepared", () => {
    const active = activateCommercial("studio_a", "snap_a", "Commercial A");
    const brief = buildSnapshotCommercialBriefView(active);
    expect(brief.meetingPackAvailable).toBe(false);
    expect(brief.meetingPackLabel).toMatch(/not yet prepared/i);
    expect(brief.title).toBe("Commercial Executive Brief");
    expect(brief.judgement).not.toContain("Quarterly Strategy Review");
  });

  it("real snapshot judgement queue and stream keep commercial items only", () => {
    const active = activateCommercial("studio_a", "snap_a", "Commercial A");
    const queue = buildSnapshotJudgementQueue(active);
    const stream = buildSnapshotIntelligenceStream(active);
    const blob = [
      ...queue.map((q) => q.title + q.whyItMatters),
      ...stream.map((e) => e.title + (e.detail ?? "")),
    ].join("\n");

    expect(queue.some((q) => /ageing|next.?step|past.?close|commercial book/i.test(q.title))).toBe(
      true,
    );
    expect(stream.some((e) => /ageing|next.?step|past.?close|commercial/i.test(e.title))).toBe(
      true,
    );
    expect(containsDemoBusinessPhrase(blob)).toBe(false);
    expect(blob).not.toContain("Have counsel circulate the option paper");
    expect(blob).not.toContain("Increase Enterprise ARR");
  });

  it("Commercial Intelligence observations remain available", () => {
    const active = activateCommercial("studio_a", "snap_a", "Commercial A");
    expect(hasCommercialObservations(active.analysis, active.commercialBrief)).toBe(
      true,
    );
    expect(active.recordCount).toBe(476);
    expect(active.snapshotId).toBe("snap_a");
    expect(getActiveExecutiveSnapshot()?.snapshotId).toBe("snap_a");
  });

  it("no silent fallback to demo KPI / pulse templates when snapshot active", () => {
    const active = activateCommercial("studio_a", "snap_a", "Commercial A");
    const integrity = buildSnapshotIntegrityKpis({ active });
    const demoSnap = demoPresentationSnapshot();
    const demoKpis = buildMissionKpis({
      snapshot: demoSnap,
      strategicOutcomes: [],
      monthlyValue: 59000,
      valueTrend: "up",
      valueConfidence: 80,
    });
    const demoPulse = buildExecutivePulse({
      snapshot: demoSnap,
      valueTrend: "up",
    });

    expect(demoKpis.find((k) => k.id === "organisation_health")?.value).not.toBe(
      integrity.find((k) => k.id === "organisation_health")?.value,
    );
    expect(demoPulse.signals.some((s) => s.text.includes("Revenue improving"))).toBe(
      true,
    );
    expect(
      buildSnapshotIntegrityPulse({ active }).signals.some((s) =>
        s.text.includes("Revenue improving"),
      ),
    ).toBe(false);
  });

  it("isolated intent profile does not require option paper for real snapshots", () => {
    const profile = createIsolatedIntentProfile({ executiveName: "Executive" });
    expect(profile.preferences.decision.requiresOptionPaper).toBe(false);
  });

  it("Snapshot A and Snapshot B remain isolated in integrity projection", () => {
    activateCommercial("studio_a", "snap_a", "Commercial Isolation A");
    const b = activateCommercial("studio_b", "snap_b", "Commercial Isolation B");
    expect(getActiveExecutiveSnapshot()?.snapshotId).toBe("snap_b");
    expect(getActiveExecutiveSnapshot()?.studioId).toBe("studio_b");
    expect(b.portfolio.outcomes[0]?.businessImpact).toContain(
      "Commercial Isolation B",
    );
    expect(b.portfolio.outcomes[0]?.businessImpact).not.toContain(
      "Commercial Isolation A",
    );
    expect(b.demoIsolation).toBe(true);

    const stream = buildSnapshotIntelligenceStream(b);
    expect(stream.every((e) => !containsDemoBusinessPhrase(e.title))).toBe(true);
  });

  it("demo phrase guard catches known seeded business context", () => {
    expect(() =>
      assertNoDemoBusinessContext(
        "Today is the Quarterly Strategy Review. Proceed — Majority agreement. Watch COO.",
      ),
    ).toThrow(/Demo business context/);
    for (const phrase of DEMO_BUSINESS_PHRASES.slice(0, 5)) {
      expect(containsDemoBusinessPhrase(phrase)).toBe(true);
    }
  });
});
