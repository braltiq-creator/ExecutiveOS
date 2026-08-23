/**
 * Phase 57E — Intelligence profile resolution after snapshot context handoff.
 *
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import { COUNCIL_AGENT_IDS } from "@/agents";
import { activateDomainAdvisorsForIndustry } from "@/domain-advisors";
import { getIntelligenceProfile, isIntelligenceProfileId } from "@/profiles";
import { bootstrapExecutiveSnapshotRuntime } from "@/runtime";
import { clearTenantRegistry } from "@/runtime/tenant";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
  getActiveExecutiveSnapshot,
  isSnapshotWorkflowId,
  resolveIntelligenceProfileFromSnapshot,
  resolveIntelligenceProfileIdFromBusinessProfile,
  SNAPSHOT_WORKFLOW_IDS,
} from "@/executive-snapshot-studio/launch";
import { getStudioIndustryLabel } from "@/executive-snapshot-studio/profile-detection";
import { scoreExecutiveReadiness } from "@/executive-snapshot-studio/readiness";
import type { OutcomePortfolio } from "@/lib/outcomes/types";

function readiness() {
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
    datasetShape: "flat_commercial",
  });
}

function portfolio(): OutcomePortfolio {
  return {
    overallScore: 70,
    statusLabel: "Commercial book",
    refreshedAt: new Date().toISOString(),
    executiveName: "Executive",
    outcomes: [],
    decisions: [],
    intent: {
      id: "intent-commercial-snapshot",
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

describe("Phase 57E intelligence profile resolution", () => {
  beforeEach(() => {
    clearExecutiveSnapshotLibrary();
    clearTenantRegistry();
    sessionStorage.clear();
  });

  it("rejects executive_snapshot as an intelligence profile", () => {
    expect(isSnapshotWorkflowId("executive_snapshot")).toBe(true);
    expect(isIntelligenceProfileId("executive_snapshot")).toBe(false);
    expect(() =>
      resolveIntelligenceProfileFromSnapshot({
        businessProfileId: "commercial",
        intelligenceProfileId: "executive_snapshot",
      }),
    ).toThrow(/workflow identifier/i);
    expect(SNAPSHOT_WORKFLOW_IDS).toContain("executive_snapshot");
  });

  it("allows executive_snapshot as Snapshot Studio workflow/context kind", () => {
    const ctx = activateExecutiveSnapshotContext({
      studioId: "studio_sf",
      snapshotId: "snap_sf",
      organisationId: "org_sf",
      profileId: "commercial",
      profileLabel: "Commercial Executive Intelligence",
      sourceKind: "excel",
      recordCount: 476,
      confidenceOverall: 90,
      readiness: readiness(),
      portfolio: portfolio(),
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });
    expect(ctx.kind).toBe("executive_snapshot");
    expect(ctx.intelligenceProfileId).not.toBe("executive_snapshot");
  });

  it("resolves Commercial Executive Intelligence to commercial_executive", () => {
    const profile = resolveIntelligenceProfileFromSnapshot({
      businessProfileId: "commercial",
    });
    expect(profile.id).toBe("commercial_executive");
    expect(profile.name).toMatch(/Commercial/i);
    expect(
      resolveIntelligenceProfileIdFromBusinessProfile("commercial"),
    ).toBe("commercial_executive");
  });

  it("Salesforce-shaped commercial snapshot activates Commercial Intelligence", () => {
    const ctx = activateExecutiveSnapshotContext({
      studioId: "studio_sf",
      snapshotId: "snap_sf_476",
      organisationId: "org_sf",
      profileId: "commercial",
      profileLabel: "Commercial Executive Intelligence",
      sourceKind: "excel",
      filename: "report1786533305012.xls",
      recordCount: 476,
      confidenceOverall: 92,
      readiness: readiness(),
      portfolio: portfolio(),
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });

    expect(ctx.recordCount).toBe(476);
    expect(ctx.intelligenceProfileId).toBe("commercial_executive");
    expect(getIntelligenceProfile(ctx.intelligenceProfileId).id).toBe(
      "commercial_executive",
    );

    const boot = bootstrapExecutiveSnapshotRuntime({
      organisationId: ctx.organisationId,
      profileLabel: ctx.profileLabel,
      snapshotId: ctx.snapshotId,
      intelligenceProfileId: ctx.intelligenceProfileId,
    });
    expect(boot.context.tenant.configuration.intelligenceProfileId).toBe(
      "commercial_executive",
    );
    expect(boot.context.tenant.configuration.intelligenceProfileId).not.toBe(
      "executive_snapshot",
    );
    expect(boot.context.tenant.configuration.snapshotWorkflowId).toBe(
      "executive_snapshot",
    );
  });

  it("bootstrap refuses executive_snapshot as intelligenceProfileId", () => {
    expect(() =>
      bootstrapExecutiveSnapshotRuntime({
        organisationId: "org_x",
        profileLabel: "Commercial Executive Intelligence",
        snapshotId: "snap_x",
        intelligenceProfileId: "executive_snapshot" as never,
      }),
    ).toThrow(/workflow identifier/i);
  });

  it("does not inherit demo organisation names in resolved commercial context", () => {
    const ctx = activateExecutiveSnapshotContext({
      studioId: "studio_sf",
      snapshotId: "snap_sf",
      organisationId: "org_sf",
      profileId: "commercial",
      profileLabel: "Commercial Executive Intelligence",
      sourceKind: "excel",
      recordCount: 476,
      confidenceOverall: 90,
      readiness: readiness(),
      portfolio: portfolio(),
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });
    const blob = JSON.stringify(ctx);
    expect(blob).not.toMatch(/Helix|Northline|Alex Rivera|Increase Enterprise ARR/i);
    expect(getActiveExecutiveSnapshot()?.intelligenceProfileId).toBe(
      "commercial_executive",
    );
  });

  it("Commercial Domain Advisors resolve from the commercial industry label", () => {
    const industry = getStudioIndustryLabel("commercial");
    const activated = activateDomainAdvisorsForIndustry(industry);
    expect(activated.activated).toBe(true);
    expect(activated.catalogue?.entries.length).toBeGreaterThan(0);
  });

  it("Council remains CEO/CFO/COO/CRO/CSO", () => {
    expect(COUNCIL_AGENT_IDS).toEqual(["ceo", "cfo", "coo", "cro", "cso"]);
  });

  it("/today receives commercial_executive from an active commercial snapshot", () => {
    const ctx = activateExecutiveSnapshotContext({
      studioId: "studio_today",
      snapshotId: "snap_today",
      organisationId: "org_today",
      profileId: "commercial",
      profileLabel: "Commercial Executive Intelligence",
      sourceKind: "excel",
      recordCount: 476,
      confidenceOverall: 90,
      readiness: readiness(),
      portfolio: portfolio(),
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });
    const active = getActiveExecutiveSnapshot();
    expect(active?.snapshotId).toBe(ctx.snapshotId);
    expect(active?.intelligenceProfileId).toBe("commercial_executive");
  });

  it("maps non-commercial studio profiles to operations_executive", () => {
    expect(
      resolveIntelligenceProfileIdFromBusinessProfile("manufacturing"),
    ).toBe("operations_executive");
    expect(resolveIntelligenceProfileIdFromBusinessProfile("mining")).toBe(
      "operations_executive",
    );
    expect(
      resolveIntelligenceProfileIdFromBusinessProfile("field_services"),
    ).toBe("operations_executive");
  });

  it("keeps Snapshot A and B intelligence profiles isolated with context", () => {
    activateExecutiveSnapshotContext({
      studioId: "studio_a",
      snapshotId: "snap_a",
      organisationId: "org_a",
      profileId: "commercial",
      profileLabel: "Commercial Executive Intelligence",
      sourceKind: "excel",
      recordCount: 100,
      confidenceOverall: 80,
      readiness: readiness(),
      portfolio: portfolio(),
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });
    activateExecutiveSnapshotContext({
      studioId: "studio_b",
      snapshotId: "snap_b",
      organisationId: "org_b",
      profileId: "manufacturing",
      profileLabel: "Manufacturing Forecast Intelligence",
      sourceKind: "csv",
      recordCount: 50,
      confidenceOverall: 70,
      readiness: readiness(),
      portfolio: portfolio(),
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });
    expect(getActiveExecutiveSnapshot()?.intelligenceProfileId).toBe(
      "operations_executive",
    );
    activateExecutiveSnapshotContext({
      ...getActiveExecutiveSnapshot()!,
      studioId: "studio_a",
      snapshotId: "snap_a",
      profileId: "commercial",
      profileLabel: "Commercial Executive Intelligence",
      intelligenceProfileId: undefined,
    });
    expect(getActiveExecutiveSnapshot()?.intelligenceProfileId).toBe(
      "commercial_executive",
    );
  });
});
