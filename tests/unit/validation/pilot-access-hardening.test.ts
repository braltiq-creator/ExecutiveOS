/**
 * Pilot access hardening — M3 / M4 / M5.
 * Mock fail-safe, no silent demo, Studio auth, durable org-scoped persistence.
 * @vitest-environment jsdom
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPilotPersistenceMemory,
  createMemoryPilotPersistence,
  getPilotPersistence,
  setPilotPersistenceOverride,
} from "@/pilot-persistence";
import {
  persistPilotSnapshotAction,
  loadPilotSnapshotAction,
} from "@/pilot-persistence/actions";
import {
  isMockMode,
  isProductionMockConfigSafe,
  isProductionRuntime,
} from "@/lib/mock/mode";
import { shouldForbidDemoFallback } from "@/executive-snapshot-studio/launch/experience-intent";
import { requireStudioActor, requireStudioSession } from "@/executive-snapshot-studio/server/auth";
import { createExecutiveSnapshotAction } from "@/executive-snapshot-studio/server/actions";
import {
  activateExecutiveSnapshotContext,
  clearExecutiveSnapshotLibrary,
} from "@/executive-snapshot-studio/launch";
import {
  assignActionAccountability,
  createActionFromSelectedDecision,
  selectDecisionOption,
} from "@/lib/decisions/decision-execution-linkage";
import { runManufacturingValidationFromTabular } from "@/executive-snapshot-studio/intelligence";
import { clearStudioStores } from "@/executive-snapshot-studio";
import {
  clearAuditStore,
  clearLineageStore,
  clearMappingStore,
  clearSnapshotStore,
} from "@/data-gateway";
import { clearExecutiveSnapshotLibrary as clearLib } from "@/executive-snapshot-studio/launch";
import { resetPilotRegistry } from "@/pilot";
import * as authActions from "@/lib/auth/actions";
import * as orgQueries from "@/lib/organizations/queries";
import type { UdgMappingDefinition } from "@/data-gateway";

const MFG = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);

describe("M3 — production mock auth fail-safe", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllEnvs();
  });

  it("disables mock in production even when MOCK is unset", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    delete process.env.NEXT_PUBLIC_EXECUTIVEOS_MOCK;
    expect(isProductionRuntime()).toBe(true);
    expect(isMockMode()).toBe(false);
  });

  it("disables mock in production even when MOCK=true (fail-safe)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "true");
    expect(isMockMode()).toBe(false);
  });

  it("flags missing explicit MOCK=false in production for ops", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.NEXT_PUBLIC_EXECUTIVEOS_MOCK;
    expect(isProductionMockConfigSafe()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");
    expect(isProductionMockConfigSafe()).toBe(true);
  });
});

describe("M3.1 — authenticated empty state is not demo", () => {
  it("forbids silent demo without explicit demo param", () => {
    expect(
      shouldForbidDemoFallback({
        hasActiveSnapshot: false,
        libraryCount: 0,
        intent: null,
        demoParam: null,
      }),
    ).toBe(true);
  });

  it("allows explicit demo only", () => {
    expect(
      shouldForbidDemoFallback({
        hasActiveSnapshot: false,
        libraryCount: 0,
        intent: "demo",
        demoParam: null,
      }),
    ).toBe(false);
    expect(
      shouldForbidDemoFallback({
        hasActiveSnapshot: false,
        libraryCount: 0,
        intent: null,
        demoParam: "1",
      }),
    ).toBe(false);
  });
});

describe("M3.2 — Studio server action authentication", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated Studio create action", async () => {
    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue(null);
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");
    vi.stubEnv("NODE_ENV", "development");

    const emptyMapping: UdgMappingDefinition = {
      id: "map",
      name: "empty",
      organisationId: "org-a",
      sourceKind: "excel",
      version: 1,
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await createExecutiveSnapshotAction({
      organisationId: "org-a",
      profileId: "manufacturing",
      sourceKind: "excel",
      selectedProfileId: "manufacturing",
      mapping: emptyMapping,
    });

    expect(result.success).toBe(false);
    expect(result.errors.join(" ")).toMatch(/Authentication required/i);
  });

  it("rejects authenticated but wrong organisation", async () => {
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue({
      id: "user-a",
      email: "a@example.com",
    } as Awaited<ReturnType<typeof authActions.getAuthenticatedUser>>);
    vi.spyOn(orgQueries, "fetchActiveMembership").mockResolvedValue({
      member: {
        id: "m1",
        organization_id: "org-a",
        user_id: "user-a",
        role: "executive",
        status: "active",
        email: "a@example.com",
        display_name: "A",
        joined_at: null,
        invited_at: null,
        created_at: new Date().toISOString(),
      },
      organization: {
        id: "org-a",
        name: "Org A",
        legal_name: null,
        industry: null,
        company_size: null,
        country: null,
        timezone: "UTC",
        website: null,
        logo_url: null,
        subscription_plan: "free",
        created_by: "user-a",
        archived_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    const denied = await requireStudioActor("org-b");
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.code).toBe("FORBIDDEN");

    const allowed = await requireStudioActor("org-a");
    expect(allowed.ok).toBe(true);
  });

  it("requireStudioSession rejects when unauthenticated", async () => {
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue(null);
    const session = await requireStudioSession();
    expect(session.ok).toBe(false);
    if (!session.ok) expect(session.code).toBe("UNAUTHENTICATED");
  });
});

describe("M4 — durable org-scoped manufacturing persistence", () => {
  beforeEach(() => {
    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();
    clearLib();
    clearExecutiveSnapshotLibrary();
    clearPilotPersistenceMemory();
    setPilotPersistenceOverride(createMemoryPilotPersistence());
    resetPilotRegistry();
  });

  afterEach(() => {
    setPilotPersistenceOverride(null);
    clearPilotPersistenceMemory();
  });

  async function seedOrgSnapshot(organisationId: string, organisationName: string) {
    const validation = runManufacturingValidationFromTabular({
      tabularText: readFileSync(MFG, "utf8"),
      organisationId,
      organisationName,
      filename: "demo-manufacturing-forecast.csv",
    });
    expect(validation.portfolio).toBeTruthy();
    const ctx = activateExecutiveSnapshotContext({
      studioId: `studio-${organisationId}`,
      snapshotId: validation.snapshot!.meta.snapshotId,
      organisationId,
      organisationName,
      profileId: "manufacturing",
      profileLabel: "Manufacturing Forecast Intelligence",
      sourceKind: "excel",
      filename: "demo-manufacturing-forecast.csv",
      recordCount: validation.snapshot!.meta.recordCount,
      confidenceOverall: validation.snapshot!.meta.confidence.overall,
      readiness: validation.readiness!,
      portfolio: validation.portfolio!,
      manufacturingAnalysis: validation.analysis,
      manufacturingBrief: validation.brief,
      councilSeats: ["CEO", "CFO", "COO"],
      advisorNames: [],
    });

    const store = getPilotPersistence();
    await store.saveSnapshot({
      snapshotId: ctx.snapshotId,
      organisationId,
      studioId: ctx.studioId,
      profileId: ctx.profileId,
      profileLabel: ctx.profileLabel,
      organisationName,
      sourceKind: ctx.sourceKind,
      filename: ctx.filename,
      recordCount: ctx.recordCount,
      confidenceOverall: ctx.confidenceOverall,
      context: ctx,
      createdBy: `user-${organisationId}`,
      createdAt: ctx.activatedAt,
    });

    return { ctx, portfolio: structuredClone(validation.portfolio!), validation };
  }

  it("isolates snapshots, decisions, and actions across organisations", async () => {
    const a = await seedOrgSnapshot("org-a", "Partner A");
    const b = await seedOrgSnapshot("org-b", "Partner B");
    const store = getPilotPersistence();

    expect(await store.getSnapshot("org-a", a.ctx.snapshotId)).toBeTruthy();
    expect(await store.getSnapshot("org-b", a.ctx.snapshotId)).toBeNull();
    expect(await store.getSnapshot("org-a", b.ctx.snapshotId)).toBeNull();

    const decisionA = a.portfolio.decisions[0];
    expect(decisionA).toBeTruthy();
    const selected = selectDecisionOption(a.portfolio, {
      decisionId: decisionA!.id,
      alternativeId: decisionA!.alternatives[0]!.id,
      actor: "Exec A",
      snapshotId: a.ctx.snapshotId,
    });
    const acted = createActionFromSelectedDecision(selected.portfolio, {
      decisionId: decisionA!.id,
      actor: "Exec A",
    });
    const assigned = assignActionAccountability(acted.portfolio, {
      actionId: acted.action.id,
      owner: "Ops A",
      dueDate: "2026-09-01",
      actor: "Exec A",
    });

    await store.savePortfolio({
      organisationId: "org-a",
      originSnapshotId: a.ctx.snapshotId,
      portfolio: assigned.portfolio,
    });

    // Cross-org snapshot access denied
    expect(await store.getPortfolio("org-b", a.ctx.snapshotId)).toBeNull();
    expect(await store.getPortfolio("org-a", b.ctx.snapshotId)).toBeNull();

    const aPortfolio = await store.getPortfolio("org-a", a.ctx.snapshotId);
    const bPortfolio = await store.getPortfolio("org-b", b.ctx.snapshotId);
    expect(aPortfolio).toBeTruthy();
    expect(bPortfolio).toBeTruthy();

    const aDecisionState = aPortfolio!.decisions.find((d) => d.id === decisionA!.id)
      ?.executiveSelectionState;
    const bDecisionState = bPortfolio!.decisions.find((d) => d.id === decisionA!.id)
      ?.executiveSelectionState;
    expect(aDecisionState).toMatch(/OPTION_SELECTED|DECISION_/);
    // Same fixture may share decision ids, but B must not inherit A's selection.
    expect(bDecisionState === "OPTION_SELECTED").toBe(false);

    const aActions = await store.listActions("org-a");
    const bActions = await store.listActions("org-b");
    expect(aActions.some((x) => x.id === acted.action.id)).toBe(true);
    expect(bActions.some((x) => x.id === acted.action.id)).toBe(false);
    expect(aActions.some((x) => x.action.recommendation.owner === "Ops A")).toBe(
      true,
    );
  });

  it("preserves snapshot immutability and originSnapshotId lineage", async () => {
    const day1 = await seedOrgSnapshot("org-lineage", "Lineage Co");
    const decision = day1.portfolio.decisions[0]!;
    const afterSelect = selectDecisionOption(day1.portfolio, {
      decisionId: decision.id,
      alternativeId: decision.alternatives[0]!.id,
      actor: "Exec",
      snapshotId: day1.ctx.snapshotId,
    });
    expect(afterSelect.decision.originSnapshotId).toBe(day1.ctx.snapshotId);

    const afterAction = createActionFromSelectedDecision(afterSelect.portfolio, {
      decisionId: decision.id,
      actor: "Exec",
    });
    expect(afterAction.action.snapshotId).toBe(day1.ctx.snapshotId);
    expect(afterAction.action.decisionId).toBe(decision.id);

    await getPilotPersistence().savePortfolio({
      organisationId: "org-lineage",
      originSnapshotId: day1.ctx.snapshotId,
      portfolio: afterAction.portfolio,
    });

    const day2 = await seedOrgSnapshot("org-lineage", "Lineage Co");
    expect(day2.ctx.snapshotId).not.toBe(day1.ctx.snapshotId);

    const reloaded = await getPilotPersistence().getPortfolio(
      "org-lineage",
      day1.ctx.snapshotId,
    );
    expect(reloaded).toBeTruthy();
    const historic = reloaded!.decisions.find((d) => d.id === decision.id);
    expect(historic?.originSnapshotId).toBe(day1.ctx.snapshotId);
  });

  it("survives browser restart (session clear) via durable store", async () => {
    const seeded = await seedOrgSnapshot("org-restart", "Restart Co");
    const decision = seeded.portfolio.decisions[0]!;
    let portfolio = selectDecisionOption(seeded.portfolio, {
      decisionId: decision.id,
      alternativeId: decision.alternatives.find((a) => !/defer/i.test(a.label))
        ?.id ?? decision.alternatives[0]!.id,
      actor: "Exec",
      snapshotId: seeded.ctx.snapshotId,
    }).portfolio;
    portfolio = createActionFromSelectedDecision(portfolio, {
      decisionId: decision.id,
      actor: "Exec",
    }).portfolio;
    portfolio = assignActionAccountability(portfolio, {
      actionId: portfolio.outcomes
        .flatMap((o) => o.pendingActions)
        .find((a) => a.decisionId === decision.id)!.id,
      owner: "Planning",
      dueDate: "2026-09-15",
      actor: "Exec",
    }).portfolio;

    await getPilotPersistence().savePortfolio({
      organisationId: "org-restart",
      originSnapshotId: seeded.ctx.snapshotId,
      portfolio,
    });

    // Simulate browser restart.
    sessionStorage.clear();
    clearExecutiveSnapshotLibrary();

    const restored = await getPilotPersistence().getPortfolio(
      "org-restart",
      seeded.ctx.snapshotId,
    );
    expect(restored).toBeTruthy();
    const d = restored!.decisions.find((x) => x.id === decision.id);
    expect(d?.executiveSelectionState).toMatch(/OPTION_SELECTED|DECISION_/);
    expect(d?.originSnapshotId).toBe(seeded.ctx.snapshotId);
    const action = restored!.outcomes
      .flatMap((o) => o.pendingActions)
      .find((a) => a.decisionId === decision.id);
    expect(action?.recommendation.owner).toBe("Planning");
    expect(action?.recommendation.deadline).toBe("2026-09-15");

    // Continuity derives from durable portfolio — not sessionStorage.
    expect(
      restored!.decisions.some(
        (d) =>
          d.id === decision.id && d.originSnapshotId === seeded.ctx.snapshotId,
      ),
    ).toBe(true);
  });

  it("User A / User B multi-browser isolation", async () => {
    const userA = await seedOrgSnapshot("org-user-a", "User A Co");
    const userB = await seedOrgSnapshot("org-user-b", "User B Co");
    const store = getPilotPersistence();

    expect(
      (await store.listSnapshots("org-user-a")).map((s) => s.snapshotId),
    ).toContain(userA.ctx.snapshotId);
    expect(
      (await store.listSnapshots("org-user-a")).map((s) => s.snapshotId),
    ).not.toContain(userB.ctx.snapshotId);

    expect(
      (await store.listSnapshots("org-user-b")).map((s) => s.snapshotId),
    ).toContain(userB.ctx.snapshotId);
    expect(
      (await store.listSnapshots("org-user-b")).map((s) => s.snapshotId),
    ).not.toContain(userA.ctx.snapshotId);
  });

  it("persist actions require auth when mock is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue(null);

    const denied = await persistPilotSnapshotAction({
      context: {
        kind: "executive_snapshot",
        studioId: "s",
        snapshotId: "snap",
        organisationId: "org-x",
        profileId: "manufacturing",
        profileLabel: "MFG",
        intelligenceProfileId: "operations_executive",
        sourceKind: "excel",
        recordCount: 1,
        confidenceOverall: 0.5,
        readiness: {
          dataQuality: 50,
          coverage: 50,
          freshness: 50,
          confidence: 50,
          relationshipIntegrity: 50,
          evidenceCoverage: 50,
          commercialDatasetReadiness: 50,
          executiveReadiness: 50,
          judgementReadiness: {
            forecastOpportunityEvidence: "insufficient",
            activityBasedJudgement: "insufficient",
            concentrationJudgement: "insufficient",
            narrative: [],
          },
          recommendations: [],
          scoredAt: new Date().toISOString(),
        },
        portfolio: {
          overallScore: 0,
          statusLabel: "x",
          refreshedAt: new Date().toISOString(),
          executiveName: "x",
          outcomes: [],
          decisions: [],
          intent: {
            id: "i",
            title: "t",
            narrative: "n",
            priority: "high",
            horizon: "q",
            reviewDate: "2026-01-01",
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
        },
        councilSeats: [],
        advisorNames: [],
        activatedAt: new Date().toISOString(),
        demoIsolation: true,
      },
    });
    expect(denied.ok).toBe(false);

    const loadDenied = await loadPilotSnapshotAction({ snapshotId: "snap" });
    expect(loadDenied.ok).toBe(false);
  });
});

describe("Commercial isolation remains intact", () => {
  beforeEach(() => {
    clearPilotPersistenceMemory();
    setPilotPersistenceOverride(createMemoryPilotPersistence());
  });

  afterEach(() => {
    setPilotPersistenceOverride(null);
  });

  it("does not leak manufacturing portfolio into another org", async () => {
    const store = getPilotPersistence();
    const mfg = runManufacturingValidationFromTabular({
      tabularText: readFileSync(MFG, "utf8"),
      organisationId: "org-mfg",
      organisationName: "MFG Co",
      filename: "demo-manufacturing-forecast.csv",
    });
    const ctx = activateExecutiveSnapshotContext({
      studioId: "studio-mfg",
      snapshotId: mfg.snapshot!.meta.snapshotId,
      organisationId: "org-mfg",
      organisationName: "MFG Co",
      profileId: "manufacturing",
      profileLabel: "Manufacturing Forecast Intelligence",
      sourceKind: "excel",
      recordCount: mfg.snapshot!.meta.recordCount,
      confidenceOverall: mfg.snapshot!.meta.confidence.overall,
      readiness: mfg.readiness!,
      portfolio: mfg.portfolio!,
      manufacturingAnalysis: mfg.analysis,
      manufacturingBrief: mfg.brief,
      councilSeats: [],
      advisorNames: [],
    });
    await store.saveSnapshot({
      snapshotId: ctx.snapshotId,
      organisationId: "org-mfg",
      profileId: "manufacturing",
      recordCount: ctx.recordCount,
      context: ctx,
      createdAt: ctx.activatedAt,
    });

    expect(await store.getPortfolio("org-commercial", ctx.snapshotId)).toBeNull();
    expect(await store.listDecisions("org-commercial")).toHaveLength(0);
  });
});
