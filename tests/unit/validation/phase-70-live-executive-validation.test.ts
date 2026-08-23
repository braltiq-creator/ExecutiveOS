/**
 * Phase 70 — Live Executive Design Partner Validation.
 * Protocol + evidence schema + Signature surface regression.
 * Does not invent live executive timings. Does not redesign /today.
 * @vitest-environment jsdom
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
  clearDesignPartnerFeedback,
  clearDesignPartnerMetrics,
  createLiveSessionEvidenceShell,
  hasLiveTimings,
  resolveF6906Status,
  buildLiveScorecardFromEvidence,
  finalizeLiveSessionVerdict,
  sealLiveSessionEvidence,
  LIVE_PROTOCOL_STEPS,
  LIVE_OPENING_INSTRUCTION,
  LIVE_REQUIRED_CC_SURFACES,
  EXECUTIVE_VALUE_PROMPTS,
  TRUST_PROMPT,
  VISUAL_PROMPT,
  runManufacturingPilotSimulation,
} from "@/design-partner";
import type { LiveSessionEvidence } from "@/design-partner";
import { clearStudioStores } from "@/executive-snapshot-studio";
import { clearExecutiveSnapshotLibrary } from "@/executive-snapshot-studio/launch";
import { resetPilotRegistry } from "@/pilot";

const MFG = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);

describe("Phase 70 Live Executive Validation protocol", () => {
  it("defines all six protocol windows with non-coaching prompts", () => {
    expect(LIVE_PROTOCOL_STEPS).toHaveLength(6);
    expect(LIVE_PROTOCOL_STEPS.map((s) => s.taskId)).toEqual([
      "T10S",
      "T30S",
      "T60S",
      "T2M",
      "T5M",
      "RETURN",
    ]);
    expect(LIVE_OPENING_INSTRUCTION).toMatch(/first time today/i);
    expect(LIVE_OPENING_INSTRUCTION).not.toMatch(/click|scroll|heatmap|decision paper/i);
    for (const step of LIVE_PROTOCOL_STEPS) {
      expect(step.prompt.length).toBeGreaterThan(10);
      expect(step.passCriteria.length).toBeGreaterThan(20);
    }
    expect(TRUST_PROMPT).toMatch(/hesitant/i);
    expect(VISUAL_PROMPT).toMatch(/visual evidence/i);
    expect(EXECUTIVE_VALUE_PROMPTS).toHaveLength(5);
  });

  it("creates an empty evidence shell with F69-06 OPEN and no invented timings", () => {
    const shell = createLiveSessionEvidenceShell({
      sessionId: "phase70-shell-test",
      facilitator: "test",
    });
    expect(shell.phase).toBe(70);
    expect(shell.status).toBe("PROTOCOL_READY_AWAITING_PARTICIPANT");
    expect(shell.f6906.status).toBe("OPEN");
    expect(shell.tasks).toHaveLength(6);
    expect(shell.tasks.every((t) => t.elapsedSeconds === null)).toBe(true);
    expect(shell.tasks.every((t) => t.verdict === "NOT_ESTABLISHED")).toBe(
      true,
    );
    expect(hasLiveTimings(shell)).toBe(false);
    expect(finalizeLiveSessionVerdict(shell)).toBe("NOT_ESTABLISHED");
    const sealed = sealLiveSessionEvidence(shell);
    expect(sealed.f6906.status).toBe("OPEN");
    expect(sealed.overallVerdict).toBe("NOT_ESTABLISHED");
    expect(
      Object.values(sealed.scorecard).every((v) => v === "NOT_ESTABLISHED"),
    ).toBe(true);
  });

  it("does not close F69-06 from structural completion without timings", () => {
    const shell = createLiveSessionEvidenceShell();
    const incomplete: LiveSessionEvidence = {
      ...shell,
      status: "COMPLETED",
      tasks: shell.tasks.map((t) => ({
        ...t,
        response: "placeholder",
        coachingLevel: 0,
        promptingRequired: false,
        verdict: "PASS",
        // elapsedSeconds still null
      })),
    };
    expect(resolveF6906Status(incomplete).status).toBe("OPEN");
    expect(finalizeLiveSessionVerdict(incomplete)).toBe("READY_WITH_P1_FIXES");
  });

  it("closes F69-06 only when live timings exist for every window", () => {
    const shell = createLiveSessionEvidenceShell();
    const timed: LiveSessionEvidence = {
      ...shell,
      status: "COMPLETED",
      tasks: shell.tasks.map((t, i) => ({
        ...t,
        elapsedSeconds: [8, 22, 45, 95, 210, 40][i]!,
        response: `Live response for ${t.taskId}`,
        coachingLevel: 0 as const,
        promptingRequired: false,
        verdict: "PASS" as const,
        observations: ["recorded live"],
      })),
      trust: {
        ...shell.trust,
        verbatimHesitation: "Want fresher source confirmation",
      },
      visualUsefulness: {
        heatMap: "B_USEFUL_CONFIRMATION",
        forecastVsActual: "B_USEFUL_CONFIRMATION",
        facilitatorNotes: "Confirmed live",
      },
      executiveValue: {
        wouldUseInsteadOfCurrent: "Yes, for demand movement reviews",
        wouldReturnDailyOrWeekly: "Weekly",
        expectTomorrow: "Updated movement and open action status",
        missingBeforeTrust: "Source freshness stamp",
        wouldStartReviewHere: "Yes",
      },
    };
    expect(hasLiveTimings(timed)).toBe(true);
    const sealed = sealLiveSessionEvidence(timed);
    expect(sealed.f6906.status).toBe("CLOSED");
    expect(sealed.overallVerdict).toBe("READY_FOR_DESIGN_PARTNER_PILOT");
    const scorecard = buildLiveScorecardFromEvidence(sealed);
    expect(scorecard.orientation).toBe("PASS");
    expect(scorecard.returnContinuity).toBe("PASS");
  });
});

describe("Phase 70 Signature surface regression (live prerequisites)", () => {
  beforeEach(() => {
    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();
    clearExecutiveSnapshotLibrary();
    clearDesignPartnerMetrics();
    clearDesignPartnerFeedback();
    resetPilotRegistry();
  });

  it("keeps Signature /today surfaces required for live protocol tasks", () => {
    const sim = runManufacturingPilotSimulation({
      organisationId: "org-phase70-live-surfaces",
      organisationName: "Phase 70 Surface Check",
      tabularText: readFileSync(MFG, "utf8"),
      filename: "demo-manufacturing-forecast.csv",
      preferProtectOption: true,
      owner: "Operations Planning",
      dueDate: "2026-08-28",
    });

    expect(sim.day1.htmlSurfaces).toEqual(
      expect.arrayContaining([
        "hasJudgementQuestion",
        "hasConfidence",
        "hasDecisionCta",
        "hasEvidenceLab",
        "hasHeatPreview",
        "hasForecastChart",
        "hasCouncilHonesty",
      ]),
    );
    expect(sim.day1.heatMapCells).toBeGreaterThan(0);
    expect(sim.day1.forecastPoints).toBeGreaterThan(0);
    expect(sim.day3.sinceYouLastLookedCount).toBeGreaterThan(0);
    // Protocol surfaces catalogue stays aligned with Signature markers.
    expect(LIVE_REQUIRED_CC_SURFACES).toEqual(
      expect.arrayContaining([
        "What requires executive judgement today",
        "Judgement confidence",
        "Open decision",
        "data-evidence-lab",
        "data-exds-heatmap",
        "data-exds-forecast-actual",
        "data-since-last-looked",
      ]),
    );
  });

  it("preserves Decision → Action → Return loop from Phase 69 harness", () => {
    const sim = runManufacturingPilotSimulation({
      organisationId: "org-phase70-loop",
      organisationName: "Phase 70 Loop Check",
      tabularText: readFileSync(MFG, "utf8"),
      filename: "demo-manufacturing-forecast.csv",
      preferProtectOption: true,
      owner: "Operations Planning",
      dueDate: "2026-08-28",
    });
    expect(sim.tasks.every((t) => t.verdict === "PASS" || t.verdict === "PARTIAL")).toBe(
      true,
    );
    expect(sim.day2.executionStatus).toBe("execution_underway");
    expect(sim.isolation.manufacturingOnlyOnCc).toBe(true);
    expect(sim.isolation.commercialProbeOk).toBe(true);
  });
});
