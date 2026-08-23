/**
 * Phase 63 — Design Partner Manufacturing Forecasting pilot readiness.
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAuditStore,
  clearLineageStore,
  clearMappingStore,
  clearSnapshotStore,
  recordAudit,
  listAudit,
} from "@/data-gateway";
import {
  buildDesignPartnerCheckpoints,
  buildDesignPartnerMetricsSnapshot,
  buildDesignPartnerReadinessSummary,
  buildDesignPartnerSecurityPosture,
  buildDesignPartnerStatus,
  buildManufacturingExpansionSignals,
  clearDesignPartnerAudit,
  clearDesignPartnerFeedback,
  clearDesignPartnerMetrics,
  compareManufacturingSnapshots,
  DESIGN_PARTNER_PILOT_EXCLUDES,
  DESIGN_PARTNER_PILOT_INCLUDES,
  listDesignPartnerAudit,
  probeDesignPartnerIsolation,
  recordDesignPartnerAudit,
  recordDesignPartnerFeedback,
  recordDecisionLogged,
  recordTimeToFirstInsight,
  recordWouldStartHere,
} from "@/design-partner";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
} from "@/executive-snapshot-studio/launch";
import {
  clearStudioStores,
  upsertLibraryEntry,
} from "@/executive-snapshot-studio";
import { runManufacturingValidationFromTabular } from "@/executive-snapshot-studio/intelligence";
import { scoreExecutiveReadiness } from "@/executive-snapshot-studio/readiness";
import {
  markPilotStarted,
  provisionDesignPartner,
  resetPilotRegistry,
} from "@/pilot";

const MFG_FIXTURE = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);

function mfgText() {
  return readFileSync(MFG_FIXTURE, "utf8");
}

describe("Phase 63 Design Partner Readiness", () => {
  beforeEach(() => {
    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();
    clearExecutiveSnapshotLibrary();
    clearDesignPartnerAudit();
    clearDesignPartnerFeedback();
    clearDesignPartnerMetrics();
    resetPilotRegistry();
  });

  it("provisions a manufacturing forecasting Design Partner without customer hard-coding", () => {
    const result = provisionDesignPartner({
      partnerName: "Design Partner Manufacturing",
      industry: "Manufacturing",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "pilot@example.com",
      environment: "pilot",
      focusModule: "manufacturing_forecasting",
      tenantSlug: "dp-mfg-63",
    });

    expect(result.pilot.focusModule).toBe("manufacturing_forecasting");
    expect(result.pilot.pilotStartedAt).toBeNull();
    expect(result.message).not.toMatch(/Hitachi/i);
    expect(result.playbookId).toBe("playbook-manufacturing-forecasting");

    const status = buildDesignPartnerStatus({
      mode: "executive_snapshot",
      pilot: result.pilot,
    });
    expect(status.label).toBe("DESIGN PARTNER ENVIRONMENT");
    expect(status.focusLabel).toBe("MANUFACTURING FORECASTING");
    expect(status.pilotDayLabel).toMatch(/not yet started/i);
    expect(status.retentionPolicyLabel).toMatch(/not yet configured/i);
  });

  it("shows Day N only after pilotStartedAt is set", () => {
    const { pilot } = provisionDesignPartner({
      partnerName: "Design Partner Manufacturing",
      industry: "Manufacturing",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "pilot@example.com",
      focusModule: "manufacturing_forecasting",
      tenantSlug: "dp-mfg-63b",
    });
    const started = markPilotStarted({
      pilotId: pilot.id,
      startedAt: "2026-08-01T00:00:00.000Z",
    });
    expect(started?.pilotStartedAt).toBe("2026-08-01T00:00:00.000Z");

    const status = buildDesignPartnerStatus({
      mode: "executive_snapshot",
      pilot: started,
      asOf: "2026-08-07T12:00:00.000Z",
    });
    expect(status.pilotDay).toBe(7);
    expect(status.pilotDayLabel).toBe("Design Partner · Day 7 of 30");
    expect(status.pilotWeek).toBe("week_1");

    const checkpoints = buildDesignPartnerCheckpoints({
      pilotStartedAt: started!.pilotStartedAt,
      asOf: "2026-08-07T12:00:00.000Z",
    });
    expect(checkpoints[0]?.status).toBe("current");
    expect(checkpoints[1]?.status).toBe("upcoming");
  });

  it("keeps dataset readiness separate from judgement readiness", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: mfgText(),
      organisationId: "org_dp_63",
      filename: "demo-manufacturing-forecast.csv",
    });
    expect(result.readiness).toBeDefined();
    const summary = buildDesignPartnerReadinessSummary({
      readiness: result.readiness!,
      analysis: result.analysis,
      recordCount: result.snapshot?.meta.recordCount,
      sourceLabel: "demo-manufacturing-forecast.csv",
    });
    expect(summary.datasetReadiness).toBeGreaterThan(0);
    expect(summary.executiveJudgementReadiness).toBe(
      result.readiness!.executiveReadiness,
    );
    expect(summary.whatWeReceived.join(" ")).toMatch(/Universal Data Gateway/i);
  });

  it("compares manufacturing snapshots without inventing unsupported deltas", () => {
    const a = runManufacturingValidationFromTabular({
      tabularText: mfgText(),
      organisationId: "org_dp_63_a",
      filename: "demo-manufacturing-forecast.csv",
    });
    const b = runManufacturingValidationFromTabular({
      tabularText: mfgText(),
      organisationId: "org_dp_63_b",
      filename: "demo-manufacturing-forecast.csv",
    });
    const comparison = compareManufacturingSnapshots({
      currentId: a.snapshot!.meta.snapshotId,
      previousId: b.snapshot!.meta.snapshotId,
      currentConfidence: a.snapshot!.meta.confidence.overall,
      previousConfidence: b.snapshot!.meta.confidence.overall,
      currentReadiness: a.readiness ?? null,
      previousReadiness: b.readiness ?? null,
      currentAnalysis: a.analysis!,
      previousAnalysis: b.analysis!,
    });
    expect(comparison.changes.some((c) => c.category === "confidence")).toBe(
      true,
    );
    // Identical fixture → demand deltas may be empty; unsupported may list incomplete sides
    for (const change of comparison.changes) {
      expect(change.detail.length).toBeGreaterThan(0);
    }
  });

  it("records pilot metrics and feedback without fabrication", () => {
    recordTimeToFirstInsight({
      organisationId: "org_dp_63",
      ms: 45_000,
      snapshotId: "snap_1",
    });
    recordDecisionLogged({
      organisationId: "org_dp_63",
      decisionId: "dec_1",
      snapshotId: "snap_1",
    });
    recordWouldStartHere({
      organisationId: "org_dp_63",
      would: true,
      screen: "command_centre",
    });
    recordDesignPartnerFeedback({
      organisationId: "org_dp_63",
      kind: "useful",
      snapshotId: "snap_1",
      screen: "command_centre",
    });

    const metrics = buildDesignPartnerMetricsSnapshot({
      organisationId: "org_dp_63",
    });
    expect(metrics.timeToFirstInsightMs).toBe(45_000);
    expect(metrics.decisionsLogged).toBe(1);
    expect(metrics.wouldStartHereYes).toBe(1);
    expect(metrics.explanation).toMatch(/Measured/);
  });

  it("security posture forbids unsupported certifications", () => {
    const posture = buildDesignPartnerSecurityPosture();
    expect(posture.forbiddenClaims).toEqual(
      expect.arrayContaining(["SOC 2 certified", "ISO 27001 certified"]),
    );
    expect(
      posture.claims.every((c) => !/SOC 2 certified|ISO 27001/i.test(c.statement)),
    ).toBe(true);
    expect(posture.retentionLabel).toMatch(/not yet configured/i);
  });

  it("expansion signals mark future modules NOT ACTIVE", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: mfgText(),
      organisationId: "org_dp_63_exp",
      filename: "demo-manufacturing-forecast.csv",
    });
    const signals = buildManufacturingExpansionSignals({
      analysis: result.analysis,
      forecastingActive: true,
    });
    expect(signals.find((s) => s.id === "manufacturing_forecasting")?.status).toBe(
      "active",
    );
    expect(
      signals
        .filter((s) => s.id !== "manufacturing_forecasting")
        .every((s) => s.status === "not_active"),
    ).toBe(true);
  });

  it("enforces organisation isolation across library, audit, metrics, feedback", () => {
    const a = runManufacturingValidationFromTabular({
      tabularText: mfgText(),
      organisationId: "org_tenant_a",
      filename: "demo-manufacturing-forecast.csv",
    });
    const b = runManufacturingValidationFromTabular({
      tabularText: mfgText(),
      organisationId: "org_tenant_b",
      filename: "demo-manufacturing-forecast.csv",
    });

    const baseSession = {
      profileId: "manufacturing",
      productId: "executiveos",
      mappingConfirmed: true,
      sourceKind: "excel" as const,
      step: "brief" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      selectedProfileId: "manufacturing" as const,
    };

    if (a.snapshot && a.readiness) {
      upsertLibraryEntry({
        ...baseSession,
        studioId: "studio_a",
        organisationId: "org_tenant_a",
        actorId: "exec_a",
        udgSnapshot: a.snapshot,
        readiness: a.readiness,
      });
    }
    if (b.snapshot && b.readiness) {
      upsertLibraryEntry({
        ...baseSession,
        studioId: "studio_b",
        organisationId: "org_tenant_b",
        actorId: "exec_b",
        udgSnapshot: b.snapshot,
        readiness: b.readiness,
      });
    }

    recordAudit({
      action: "snapshot_created",
      organisationId: "org_tenant_a",
      snapshotId: a.snapshot?.meta.snapshotId,
      detail: "Tenant A snapshot",
    });
    recordAudit({
      action: "snapshot_created",
      organisationId: "org_tenant_b",
      snapshotId: b.snapshot?.meta.snapshotId,
      detail: "Tenant B snapshot",
    });
    recordDesignPartnerAudit({
      kind: "snapshot_created",
      organisationId: "org_tenant_a",
      actorId: "exec_a",
      summary: "Snapshot created",
      objectType: "snapshot",
      objectId: a.snapshot?.meta.snapshotId ?? null,
      snapshotId: a.snapshot?.meta.snapshotId ?? null,
      decisionId: null,
      actionId: null,
    });
    recordDesignPartnerAudit({
      kind: "snapshot_created",
      organisationId: "org_tenant_b",
      actorId: "exec_b",
      summary: "Snapshot created",
      objectType: "snapshot",
      objectId: b.snapshot?.meta.snapshotId ?? null,
      snapshotId: b.snapshot?.meta.snapshotId ?? null,
      decisionId: null,
      actionId: null,
    });
    recordTimeToFirstInsight({
      organisationId: "org_tenant_a",
      ms: 10_000,
    });
    recordTimeToFirstInsight({
      organisationId: "org_tenant_b",
      ms: 20_000,
    });
    recordDesignPartnerFeedback({
      organisationId: "org_tenant_a",
      kind: "useful",
    });
    recordDesignPartnerFeedback({
      organisationId: "org_tenant_b",
      kind: "missing",
    });

    expect(listAudit("org_tenant_a").every((e) => e.organisationId === "org_tenant_a")).toBe(
      true,
    );
    expect(
      listDesignPartnerAudit("org_tenant_a").every(
        (e) => e.organisationId === "org_tenant_a",
      ),
    ).toBe(true);

    const probe = probeDesignPartnerIsolation("org_tenant_a", "org_tenant_b");
    expect(probe.ok).toBe(true);
    expect(probe.failures).toEqual([]);
  });

  it("keeps pilot boundary includes/excludes honest", () => {
    expect(DESIGN_PARTNER_PILOT_INCLUDES).toEqual(
      expect.arrayContaining(["Manufacturing Forecasting", "Excel / CSV ingestion via Universal Data Gateway"]),
    );
    expect(DESIGN_PARTNER_PILOT_EXCLUDES).toEqual(
      expect.arrayContaining(["Live ERP integration", "SAP integration"]),
    );
  });

  it("does not leak Hitachi into manufacturing activation context", () => {
    const result = runManufacturingValidationFromTabular({
      tabularText: mfgText(),
      organisationId: "org_dp_63_no_hit",
      organisationName: "Design Partner Manufacturing",
      filename: "demo-manufacturing-forecast.csv",
    });
    const active = activateExecutiveSnapshotContext({
      studioId: "studio_dp_63",
      snapshotId: result.snapshot!.meta.snapshotId,
      organisationId: "org_dp_63_no_hit",
      organisationName: "Design Partner Manufacturing",
      profileId: "manufacturing",
      profileLabel: "Manufacturing Forecast Intelligence",
      sourceKind: "excel",
      filename: "demo-manufacturing-forecast.csv",
      recordCount: result.snapshot!.meta.recordCount,
      confidenceOverall: result.snapshot!.meta.confidence.overall,
      readiness:
        result.readiness ??
        scoreExecutiveReadiness({
          confidence: result.snapshot!.meta.confidence,
          validation: {
            status: "passed",
            issues: [],
            errorCount: 0,
            warningCount: 0,
            checkedAt: new Date().toISOString(),
          },
          datasetShape: "hierarchical",
        }),
      portfolio: result.portfolio!,
      manufacturingAnalysis: result.analysis,
      manufacturingBrief: result.brief,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: [],
    });
    const blob = JSON.stringify(active);
    expect(blob).not.toMatch(/Hitachi/i);
    expect(active.organisationName).toBe("Design Partner Manufacturing");
  });
});
