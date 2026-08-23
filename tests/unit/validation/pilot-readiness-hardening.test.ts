/**
 * Pilot readiness hardening — durable write failures + logout session isolation.
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activateExecutiveSnapshotContext,
  clearPilotClientState,
  getActiveExecutiveSnapshot,
  listStoredExecutiveSnapshots,
  persistActivatedExecutiveSnapshot,
  revokeFailedExecutiveSnapshotActivation,
} from "@/executive-snapshot-studio/launch";
import { getExperienceIntent } from "@/executive-snapshot-studio/launch/experience-intent";
import {
  clearPilotPersistenceMemory,
  createMemoryPilotPersistence,
  setPilotPersistenceOverride,
} from "@/pilot-persistence";
import type { PilotPersistenceBackend } from "@/pilot-persistence/types";
import { usePortfolioStore } from "@/store/portfolio-store";
import { mockPortfolioRepository } from "@/services/portfolio/mock-repository";
import { runManufacturingValidationFromTabular } from "@/executive-snapshot-studio/intelligence";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as authActions from "@/lib/auth/actions";
import * as orgQueries from "@/lib/organizations/queries";

const MFG = resolve(
  process.cwd(),
  "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
);

function buildCtx(organisationId = "org-pilot-harden") {
  const validation = runManufacturingValidationFromTabular({
    tabularText: readFileSync(MFG, "utf8"),
    organisationId,
    organisationName: "Pilot Harden Co",
    filename: "demo-manufacturing-forecast.csv",
  });
  expect(validation.portfolio).toBeTruthy();
  return activateExecutiveSnapshotContext({
    studioId: `studio-${organisationId}`,
    snapshotId: validation.snapshot!.meta.snapshotId,
    organisationId,
    organisationName: "Pilot Harden Co",
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
}

describe("Pilot readiness — durable persistence failure surfaces", () => {
  beforeEach(() => {
    sessionStorage?.clear?.();
    try {
      localStorage?.clear?.();
    } catch {
      /* jsdom may omit localStorage */
    }
    clearPilotPersistenceMemory();
    setPilotPersistenceOverride(null);
    usePortfolioStore.getState().resetPortfolio();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    setPilotPersistenceOverride(null);
    clearPilotPersistenceMemory();
    vi.unstubAllEnvs();
  });

  it("surfaces snapshot persist failure and does not claim durable success", async () => {
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue({
      id: "user-a",
    } as Awaited<ReturnType<typeof authActions.getAuthenticatedUser>>);
    vi.spyOn(orgQueries, "fetchActiveMembership").mockResolvedValue({
      member: {
        id: "m1",
        organization_id: "org-pilot-harden",
        user_id: "user-a",
        role: "owner",
        status: "active",
        invited_by: null,
        invited_at: null,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      organization: {
        id: "org-pilot-harden",
        name: "Pilot Harden Co",
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

    const failing: PilotPersistenceBackend = {
      kind: "memory",
      async saveSnapshot() {
        throw new Error("Unable to persist Executive Snapshot.");
      },
      async getSnapshot() {
        return null;
      },
      async listSnapshots() {
        return [];
      },
      async savePortfolio() {},
      async getPortfolio() {
        return null;
      },
      async listDecisions() {
        return [];
      },
      async listActions() {
        return [];
      },
    };
    setPilotPersistenceOverride(failing);

    const ctx = buildCtx();
    expect(getActiveExecutiveSnapshot()?.snapshotId).toBe(ctx.snapshotId);

    const result = await persistActivatedExecutiveSnapshot(ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/Unable to persist Executive Snapshot/i);
    }

    revokeFailedExecutiveSnapshotActivation(ctx.studioId);
    expect(getActiveExecutiveSnapshot()).toBeNull();
    expect(
      listStoredExecutiveSnapshots().some((s) => s.studioId === ctx.studioId),
    ).toBe(false);
  });

  it("does not update portfolio store when durable portfolio persist fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue({
      id: "user-a",
    } as Awaited<ReturnType<typeof authActions.getAuthenticatedUser>>);
    vi.spyOn(orgQueries, "fetchActiveMembership").mockResolvedValue({
      member: {
        id: "m1",
        organization_id: "org-pilot-harden",
        user_id: "user-a",
        role: "owner",
        status: "active",
        invited_by: null,
        invited_at: null,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      organization: {
        id: "org-pilot-harden",
        name: "Pilot Harden Co",
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

    const memory = createMemoryPilotPersistence();
    setPilotPersistenceOverride(memory);
    const ctx = buildCtx();
    await persistActivatedExecutiveSnapshot(ctx);
    usePortfolioStore.getState().loadExternalPortfolio(ctx.portfolio, {
      snapshotId: ctx.snapshotId,
      persist: true,
    });

    const before = usePortfolioStore.getState().portfolio;
    const decision = before.decisions[0];
    expect(decision).toBeTruthy();

    setPilotPersistenceOverride({
      ...memory,
      async savePortfolio() {
        throw new Error("Unable to persist portfolio state.");
      },
    });

    await expect(
      usePortfolioStore.getState().selectDecisionOption({
        decisionId: decision!.id,
        alternativeId: decision!.alternatives[0]!.id,
        actor: "Exec",
      }),
    ).rejects.toThrow(/Unable to persist/i);

    const after = usePortfolioStore.getState();
    expect(after.portfolio).toEqual(before);
    expect(after.lastPersistError).toMatch(/Unable to persist/i);
    expect(
      after.portfolio.decisions.find((d) => d.id === decision!.id)
        ?.executiveSelectionState === "OPTION_SELECTED",
    ).toBe(false);
  });

  it("persists successfully when Supabase-backed contract succeeds", async () => {
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue({
      id: "user-a",
    } as Awaited<ReturnType<typeof authActions.getAuthenticatedUser>>);
    vi.spyOn(orgQueries, "fetchActiveMembership").mockResolvedValue({
      member: {
        id: "m1",
        organization_id: "org-pilot-harden",
        user_id: "user-a",
        role: "owner",
        status: "active",
        invited_by: null,
        invited_at: null,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      organization: {
        id: "org-pilot-harden",
        name: "Pilot Harden Co",
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

    const memory = createMemoryPilotPersistence();
    setPilotPersistenceOverride(memory);
    const ctx = buildCtx();
    const snap = await persistActivatedExecutiveSnapshot(ctx);
    expect(snap.ok).toBe(true);

    usePortfolioStore.getState().loadExternalPortfolio(ctx.portfolio, {
      snapshotId: ctx.snapshotId,
      persist: true,
    });
    const decision = usePortfolioStore.getState().portfolio.decisions[0]!;
    await usePortfolioStore.getState().selectDecisionOption({
      decisionId: decision.id,
      alternativeId: decision.alternatives[0]!.id,
      actor: "Exec",
    });

    const stored = await memory.getPortfolio(
      "org-pilot-harden",
      ctx.snapshotId,
    );
    expect(stored).toBeTruthy();
    expect(
      stored!.decisions.find((d) => d.id === decision.id)
        ?.executiveSelectionState,
    ).toMatch(/OPTION_SELECTED|DECISION_/);
    expect(usePortfolioStore.getState().lastPersistError).toBeNull();
  });
});

describe("Pilot readiness — logout session isolation", () => {
  beforeEach(() => {
    sessionStorage?.clear?.();
    try {
      localStorage?.clear?.();
    } catch {
      /* jsdom may omit localStorage */
    }
    usePortfolioStore.getState().resetPortfolio();
  });

  it("clears pilot sessionStorage and active snapshot on clearPilotClientState", () => {
    const ctx = buildCtx("org-user-a");
    expect(getActiveExecutiveSnapshot()?.organisationId).toBe("org-user-a");
    expect(listStoredExecutiveSnapshots().length).toBeGreaterThan(0);
    expect(getExperienceIntent()).toBe("executive_snapshot");
    mockPortfolioRepository.save(ctx.portfolio);
    const hadPortfolioCache =
      typeof localStorage !== "undefined" &&
      localStorage.getItem("executiveos.portfolio.v1");

    clearPilotClientState();

    expect(getActiveExecutiveSnapshot()).toBeNull();
    expect(listStoredExecutiveSnapshots()).toEqual([]);
    expect(getExperienceIntent()).toBeNull();
    expect(sessionStorage.getItem("executiveos.activeExecutiveSnapshot.v1")).toBeNull();
    expect(sessionStorage.getItem("executiveos.executiveSnapshotLibrary.v1")).toBeNull();
    expect(sessionStorage.getItem("executiveos.experienceIntent.v1")).toBeNull();
    if (typeof localStorage !== "undefined") {
      expect(localStorage.getItem("executiveos.portfolio.v1")).toBeNull();
      sessionStorage.setItem("eos-theme", "dark");
      localStorage.setItem("eos-theme", "dark");
      clearPilotClientState();
      expect(sessionStorage.getItem("eos-theme")).toBe("dark");
      expect(localStorage.getItem("eos-theme")).toBe("dark");
    } else {
      expect(hadPortfolioCache).toBeFalsy();
      sessionStorage.setItem("eos-theme", "dark");
      clearPilotClientState();
      expect(sessionStorage.getItem("eos-theme")).toBe("dark");
    }
  });

  it("subsequent user cannot inherit previous active snapshot context", () => {
    const userA = buildCtx("org-user-a");
    expect(getActiveExecutiveSnapshot()?.snapshotId).toBe(userA.snapshotId);

    clearPilotClientState();

    expect(getActiveExecutiveSnapshot()).toBeNull();
    const userB = buildCtx("org-user-b");
    const active = getActiveExecutiveSnapshot();
    expect(active?.organisationId).toBe("org-user-b");
    expect(active?.snapshotId).toBe(userB.snapshotId);
    expect(active?.snapshotId).not.toBe(userA.snapshotId);
    expect(
      listStoredExecutiveSnapshots().every(
        (s) => s.organisationId === "org-user-b",
      ),
    ).toBe(true);
  });
});
