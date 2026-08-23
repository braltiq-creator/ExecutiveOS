/**
 * Phase 57D — Executive Snapshot context propagation & demo isolation.
 *
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import { COUNCIL_AGENT_IDS } from "@/agents";
import { activateDomainAdvisorsForIndustry } from "@/domain-advisors";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { buildMissionKpis } from "@/experience/mission-control/derive";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
  getActiveExecutiveSnapshot,
  isDemoOrganisationName,
  resolveAndActivateExecutiveSnapshot,
  snapshotCommandCentreTitle,
} from "@/executive-snapshot-studio/launch";
import { getStudioIndustryLabel } from "@/executive-snapshot-studio/profile-detection";
import { scoreExecutiveReadiness } from "@/executive-snapshot-studio/readiness";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";

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
        description: "Open opportunities ageing beyond expected stage duration",
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
        question: "Ageing open opportunities",
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

function makeContext(
  studioId: string,
  snapshotId: string,
  label: string,
): Parameters<typeof activateExecutiveSnapshotContext>[0] {
  return {
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
    councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
    advisorNames: ["Go-to-Market Advisor"],
  };
}

function stubPresentationSnapshot(): ExecutiveSnapshot {
  return {
    asOf: new Date().toISOString(),
    greeting: "Good morning, Alex",
    pulse: {
      level: "attention",
      label: "Commercial attention",
      why: "Commercial book requires judgement",
      confidence: 78,
      aiConfidence: 70,
      refreshedAt: new Date().toISOString(),
      refreshedLabel: "Updated just now",
      href: "/today",
    },
    compass: { dimensions: [] },
    executiveState: {
      decisionLoad: "moderate",
      capacity: "available",
      attentionBudget: "focused",
      summary: "Commercial book requires judgement.",
      href: "/today",
    },
    metrics: [],
    outcomes: [],
    priorityDecisions: [],
    recommendedActions: [],
    sinceYesterday: [],
    calendarContext: [],
  } as ExecutiveSnapshot;
}

describe("Phase 57D Executive Snapshot context propagation", () => {
  beforeEach(() => {
    clearExecutiveSnapshotLibrary();
    sessionStorage.clear();
  });

  it("real snapshot context overrides demo context", () => {
    const ctx = activateExecutiveSnapshotContext(
      makeContext("studio_a", "snap_a", "Commercial A"),
    );
    const active = getActiveExecutiveSnapshot();
    expect(active?.snapshotId).toBe("snap_a");
    expect(active?.portfolio.outcomes[0]?.name).not.toMatch(/Enterprise ARR/i);
    expect(MOCK_OUTCOME_PORTFOLIO.executiveName).toBe("Alex");
    expect(active?.portfolio.executiveName).not.toBe("Alex");
    expect(ctx.demoIsolation).toBe(true);
  });

  it("does not treat Helix / Northline as valid snapshot organisation names", () => {
    expect(isDemoOrganisationName("Helix Industries")).toBe(true);
    expect(isDemoOrganisationName("Northline")).toBe(true);
    expect(isDemoOrganisationName("Alex Rivera")).toBe(true);
    expect(isDemoOrganisationName(undefined)).toBe(false);
  });

  it("Command Centre title avoids Good morning Alex for commercial snapshots", () => {
    const ctx = makeContext("studio_a", "snap_a", "Commercial A");
    expect(snapshotCommandCentreTitle(ctx)).toBe("Commercial Executive Brief");
    expect(snapshotCommandCentreTitle(ctx)).not.toMatch(/Alex|Helix|Good morning/i);
  });

  it("KPI builder never emits seeded Executive Value when unquantified", () => {
    const kpis = buildMissionKpis({
      snapshot: stubPresentationSnapshot(),
      strategicOutcomes: [],
      monthlyValue: null,
      valueTrend: "flat",
      valueConfidence: 70,
    });
    const valueKpi = kpis.find((k) => k.id === "executive_value");
    expect(valueKpi?.value).toBe("Not yet quantified");
    expect(valueKpi?.value).not.toMatch(/59000|\$59/);
  });

  it("KPI builder does not invent strategic outcomes when none exist", () => {
    const kpis = buildMissionKpis({
      snapshot: stubPresentationSnapshot(),
      strategicOutcomes: [],
      monthlyValue: null,
      valueTrend: "flat",
      valueConfidence: 70,
    });
    const outcomesKpi = kpis.find((k) => k.id === "strategic_outcomes");
    expect(outcomesKpi?.value).toBe("Not established");
    expect(outcomesKpi?.value).not.toMatch(/Increase Enterprise ARR|Board Readiness/i);
  });

  it("resolves the correct Snapshot ID for the active context", () => {
    activateExecutiveSnapshotContext(
      makeContext("studio_a", "snap_a", "Commercial A"),
    );
    expect(getActiveExecutiveSnapshot()?.snapshotId).toBe("snap_a");
  });

  it("commercial snapshot activates commercial context", () => {
    const ctx = activateExecutiveSnapshotContext(
      makeContext("studio_sf", "snap_sf", "Salesforce book"),
    );
    expect(ctx.profileId).toBe("commercial");
    expect(ctx.profileLabel).toMatch(/Commercial/i);
    expect(ctx.recordCount).toBe(476);
    expect(ctx.sourceKind).toBe("excel");
  });

  it("Council contains only CEO/CFO/COO/CRO/CSO", () => {
    const ctx = activateExecutiveSnapshotContext(
      makeContext("studio_a", "snap_a", "Commercial A"),
    );
    expect(ctx.councilSeats).toEqual(["CEO", "CFO", "COO", "CRO", "CSO"]);
    expect(COUNCIL_AGENT_IDS).toEqual(["ceo", "cfo", "coo", "cro", "cso"]);
  });

  it("Commercial advisors resolve from the Commercial/technology catalogue", () => {
    const industry = getStudioIndustryLabel("commercial");
    const activated = activateDomainAdvisorsForIndustry(industry);
    expect(activated.activated).toBe(true);
    const names = activated.catalogue?.entries.map((e) => e.name) ?? [];
    expect(names.length).toBeGreaterThan(0);
    // Seeded demo Product/Engineering/Security advisors are not required —
    // only what the commercial profile catalogue returns.
    expect(names.join(" ")).not.toMatch(/Helix/i);
  });

  it("Snapshot A and Snapshot B remain isolated", () => {
    activateExecutiveSnapshotContext(
      makeContext("studio_a", "snap_a", "Book A"),
    );
    activateExecutiveSnapshotContext(
      makeContext("studio_b", "snap_b", "Book B"),
    );
    expect(getActiveExecutiveSnapshot()?.snapshotId).toBe("snap_b");
    expect(getActiveExecutiveSnapshot()?.portfolio.outcomes[0]?.businessImpact).toBe(
      "Book B",
    );

    const restored = resolveAndActivateExecutiveSnapshot("studio_a");
    expect(restored?.snapshotId).toBe("snap_a");
    expect(getActiveExecutiveSnapshot()?.portfolio.outcomes[0]?.businessImpact).toBe(
      "Book A",
    );
  });

  it("missing studio context does not silently resolve to demo", () => {
    activateExecutiveSnapshotContext(
      makeContext("studio_a", "snap_a", "Book A"),
    );
    const missing = resolveAndActivateExecutiveSnapshot("studio_missing");
    expect(missing).toBeNull();
    // Active context remains A — caller must not swap to Helix.
    expect(getActiveExecutiveSnapshot()?.snapshotId).toBe("snap_a");
  });

  it("demo portfolio remains available when no real snapshot is active", () => {
    expect(getActiveExecutiveSnapshot()).toBeNull();
    expect(MOCK_OUTCOME_PORTFOLIO.executiveName).toBe("Alex");
    expect(
      MOCK_OUTCOME_PORTFOLIO.outcomes.some((o) =>
        /ARR|Board|meeting/i.test(o.name),
      ),
    ).toBe(true);
  });

  it("active commercial portfolio does not contain seeded Helix / ARR outcomes", () => {
    const ctx = activateExecutiveSnapshotContext(
      makeContext("studio_sf", "snap_sf", "Salesforce"),
    );
    const blob = JSON.stringify(ctx.portfolio);
    expect(blob).not.toMatch(/Helix Industries/i);
    expect(blob).not.toMatch(/Increase Enterprise ARR/i);
    expect(blob).not.toMatch(/Board Readiness/i);
    expect(blob).not.toMatch(/Reduce leadership meeting load/i);
    expect(blob).not.toMatch(/EU data residency/i);
    expect(blob).not.toMatch(/Alex Rivera/i);
  });
});
