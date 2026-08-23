/**
 * Phase 65 — Pilot Continuity & Accountability.
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
} from "@/data-gateway";
import {
  buildContinuityBundle,
  buildDesignPartnerStatus,
  clearDesignPartnerMetrics,
  findPreviousSnapshot,
  pilotDayOf,
  resolveJudgementContinuity,
} from "@/design-partner";
import { shouldForbidDemoFallback as forbidFromLaunch } from "@/executive-snapshot-studio/launch/experience-intent";
import { clearStudioStores } from "@/executive-snapshot-studio";
import { runManufacturingValidationFromTabular } from "@/executive-snapshot-studio/intelligence";
import { buildManufacturingDecisionPaper } from "@/executive-snapshot-studio/intelligence/manufacturing-decision-frame";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
} from "@/executive-snapshot-studio/launch";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import {
  assignActionAccountability,
  createActionFromSelectedDecision,
  selectDecisionOption,
} from "@/lib/decisions/decision-execution-linkage";
import {
  getPilotByOrganisation,
  markPilotStarted,
  provisionDesignPartner,
  resetPilotRegistry,
} from "@/pilot";
import { runCommercialValidationFromTabular } from "@/executive-snapshot-studio";
import { portfolioFromCommercialAnalysis } from "@/executive-snapshot-studio";

const MFG = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);
const SF = resolve(
  process.cwd(),
  "fixtures/validation/salesforce-opportunity-export.csv",
);

describe("Phase 65 Pilot Continuity & Accountability", () => {
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

  describe("active snapshot integrity (P0)", () => {
    it("forbids silent demo fallback for empty and post-studio sessions (M3.1)", () => {
      // Authenticated empty state must NOT allow silent Northline.
      expect(
        forbidFromLaunch({
          hasActiveSnapshot: false,
          libraryCount: 0,
          intent: null,
          demoParam: null,
        }),
      ).toBe(true);

      expect(
        forbidFromLaunch({
          hasActiveSnapshot: false,
          libraryCount: 1,
          intent: null,
          demoParam: null,
        }),
      ).toBe(true);

      expect(
        forbidFromLaunch({
          hasActiveSnapshot: false,
          libraryCount: 0,
          intent: "executive_snapshot",
          demoParam: null,
        }),
      ).toBe(true);

      expect(
        forbidFromLaunch({
          hasActiveSnapshot: false,
          libraryCount: 2,
          intent: "executive_snapshot",
          demoParam: "1",
        }),
      ).toBe(false);

      expect(
        forbidFromLaunch({
          hasActiveSnapshot: true,
          libraryCount: 0,
          intent: "executive_snapshot",
          demoParam: null,
        }),
      ).toBe(true);
    });
  });

  describe("pilot Day N binding", () => {
    it("binds Day N to organisationId and pilotStartedAt", () => {
      const { pilot, tenantId } = provisionDesignPartner({
        partnerName: "Design Partner Manufacturing",
        industry: "Manufacturing",
        intelligenceProfileId: "operations_executive",
        administratorEmail: "pilot@example.com",
        focusModule: "manufacturing_forecasting",
        tenantSlug: "phase65-mfg",
      });
      expect(pilot.organisationId).toBe("org-phase65-mfg");
      expect(getPilotByOrganisation("org-phase65-mfg")?.tenantId).toBe(
        tenantId,
      );

      expect(pilotDayOf(null, "2026-08-20T00:00:00.000Z")).toBeNull();
      expect(
        pilotDayOf("2026-08-20T00:00:00.000Z", "2026-08-19T00:00:00.000Z"),
      ).toBeNull();

      const started = markPilotStarted({
        pilotId: pilot.id,
        startedAt: "2026-08-01T00:00:00.000Z",
      })!;

      const day1 = buildDesignPartnerStatus({
        mode: "executive_snapshot",
        pilot: started,
        asOf: "2026-08-01T12:00:00.000Z",
      });
      expect(day1.pilotDay).toBe(1);
      expect(day1.pilotDayLabel).toBe("Design Partner · Day 1 of 30");

      const day7 = buildDesignPartnerStatus({
        mode: "executive_snapshot",
        pilot: started,
        asOf: "2026-08-07T12:00:00.000Z",
      });
      expect(day7.pilotDay).toBe(7);

      const day30 = buildDesignPartnerStatus({
        mode: "executive_snapshot",
        pilot: started,
        asOf: "2026-08-30T12:00:00.000Z",
      });
      expect(day30.pilotDay).toBe(30);

      const notStarted = buildDesignPartnerStatus({
        mode: "executive_snapshot",
        pilot,
        asOf: "2026-08-07T12:00:00.000Z",
      });
      // original pilot without startedAt before mark — re-fetch
      expect(
        buildDesignPartnerStatus({
          mode: "executive_snapshot",
          pilot: { ...pilot, pilotStartedAt: null },
        }).pilotDayLabel,
      ).toMatch(/not yet started/i);
    });
  });

  describe("continuity + accountability", () => {
    it("builds since-last-looked, judgement continuity, owner/due assignment", () => {
      const a = runManufacturingValidationFromTabular({
        tabularText: readFileSync(MFG, "utf8"),
        organisationId: "org-phase65-mfg",
        organisationName: "Design Partner Manufacturing",
        filename: "demo-manufacturing-forecast.csv",
      });
      const paper = buildManufacturingDecisionPaper(a.analysis!, a.brief);

      const activeA = activateExecutiveSnapshotContext({
        studioId: "studio_65_a",
        snapshotId: a.snapshot!.meta.snapshotId,
        organisationId: "org-phase65-mfg",
        organisationName: "Design Partner Manufacturing",
        profileId: "manufacturing",
        profileLabel: "Manufacturing Forecast Intelligence",
        sourceKind: "excel",
        filename: "aug-forecast.csv",
        recordCount: a.snapshot!.meta.recordCount,
        confidenceOverall: a.snapshot!.meta.confidence.overall,
        readiness: a.readiness!,
        portfolio: a.portfolio!,
        manufacturingAnalysis: a.analysis,
        manufacturingBrief: a.brief,
        councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
        advisorNames: [],
        activatedAt: "2026-08-01T10:00:00.000Z",
      });

      let portfolio = a.portfolio!;
      const selected = selectDecisionOption(portfolio, {
        decisionId: paper.decisionId!,
        alternativeId: paper.options[0]!.id,
        actor: "Executive",
        snapshotId: a.snapshot!.meta.snapshotId,
      });
      portfolio = selected.portfolio;
      const acted = createActionFromSelectedDecision(portfolio, {
        decisionId: paper.decisionId!,
        actor: "Executive",
      });
      portfolio = acted.portfolio;

      expect(acted.action.recommendation.owner).toBe("Owner not yet assigned.");
      const assigned = assignActionAccountability(portfolio, {
        actionId: acted.action.id,
        owner: "Operations Planning",
        dueDate: "2026-08-28",
        actor: "Executive",
      });
      expect(assigned.action.recommendation.owner).toBe("Operations Planning");
      expect(assigned.action.recommendation.deadline).toBe("2026-08-28");
      portfolio = assigned.portfolio;

      const b = runManufacturingValidationFromTabular({
        tabularText: readFileSync(MFG, "utf8"),
        organisationId: "org-phase65-mfg",
        filename: "sep-forecast.csv",
      });
      const activeB = activateExecutiveSnapshotContext({
        studioId: "studio_65_b",
        snapshotId: b.snapshot!.meta.snapshotId,
        organisationId: "org-phase65-mfg",
        organisationName: "Design Partner Manufacturing",
        profileId: "manufacturing",
        profileLabel: "Manufacturing Forecast Intelligence",
        sourceKind: "excel",
        filename: "sep-forecast.csv",
        recordCount: b.snapshot!.meta.recordCount,
        confidenceOverall: b.snapshot!.meta.confidence.overall,
        readiness: b.readiness!,
        portfolio: b.portfolio!,
        manufacturingAnalysis: b.analysis,
        manufacturingBrief: b.brief,
        councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
        advisorNames: [],
        activatedAt: "2026-09-01T10:00:00.000Z",
      });

      expect(activeB.snapshotId).not.toBe(activeA.snapshotId);
      expect(acted.decision.originSnapshotId).toBe(a.snapshot!.meta.snapshotId);
      expect(acted.action.snapshotId).toBe(a.snapshot!.meta.snapshotId);

      const previous = findPreviousSnapshot(activeB, [activeA, activeB]);
      expect(previous?.snapshotId).toBe(activeA.snapshotId);

      const lead =
        b.brief?.whatChanged?.[0] ??
        b.analysis!.insights.find((i) => i.category === "demand_movement")!
          .title;
      const bundle = buildContinuityBundle({
        current: activeB,
        previous: activeA,
        portfolio,
        leadJudgement: lead,
      });
      expect(bundle.isolationDisclosure).toMatch(/Manufacturing Forecast Snapshot/i);
      expect(bundle.accountability.length).toBeGreaterThan(0);
      expect(bundle.accountability[0]!.owner).toBe("Operations Planning");
      expect(bundle.judgement.currentJudgement).toBeTruthy();

      const jc = resolveJudgementContinuity({
        currentJudgement: lead,
        previousJudgement: lead,
        materialDemandChange: false,
        demandResolved: false,
      });
      expect(jc.state).toBe("UNCHANGED");

      const model = buildCommandCentreExperience(activeB, portfolio);
      expect(model.continuity).toBeDefined();
      expect(model.designPartner?.isolationDisclosure).toMatch(/active/i);
      expect(model.ageing).toBeNull();
    });
  });

  describe("commercial regression", () => {
    it("keeps commercial instruments without manufacturing continuity leak", () => {
      const commercial = runCommercialValidationFromTabular({
        tabularText: readFileSync(SF, "utf8"),
        organisationId: "org_sf_65",
        profileId: "commercial",
        filename: "salesforce-opportunity-export.csv",
      });
      const portfolio = portfolioFromCommercialAnalysis(commercial.analysis!);
      const active = activateExecutiveSnapshotContext({
        studioId: "studio_sf_65",
        snapshotId: commercial.snapshot!.meta.snapshotId,
        organisationId: "org_sf_65",
        profileId: "commercial",
        profileLabel: "Commercial Executive Intelligence",
        sourceKind: "excel",
        recordCount: 476,
        confidenceOverall: 80,
        readiness: commercial.readiness!,
        portfolio,
        analysis: commercial.analysis,
        commercialBrief: commercial.brief,
        councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
        advisorNames: [],
      });
      const model = buildCommandCentreExperience(active, portfolio);
      expect(model.experienceModule).toBe("commercial");
      expect(model.forecastVsActual).toBeUndefined();
      expect(model.continuity == null || model.continuity === null).toBe(true);
    });
  });
});
