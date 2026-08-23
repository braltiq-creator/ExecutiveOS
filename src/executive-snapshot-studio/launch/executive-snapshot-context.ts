/**
 * Authoritative Executive Snapshot context for Command Centre handoff.
 *
 * Persisted in sessionStorage so navigation from Snapshot Studio → /today
 * keeps the same business context (server module memory does not).
 *
 * Real snapshot ALWAYS takes precedence over demo / Northline / Helix state.
 */

import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type { UdgSourceKind } from "@/data-gateway";
import type { IntelligenceProfileId } from "@/profiles";
import type {
  StudioBusinessProfileId,
  StudioIntelligenceActivation,
  StudioReadiness,
} from "../types";
import type { CommercialAnalysis } from "../intelligence/commercial-analysis";
import type { CommercialExecutiveBrief } from "../intelligence/commercial-brief";
import type { ManufacturingAnalysis } from "../intelligence/manufacturing-analysis";
import type { ManufacturingExecutiveBrief } from "../intelligence/manufacturing-brief";
import type { StudioBriefPreview } from "../types";
import { resolveIntelligenceProfileIdFromBusinessProfile } from "./resolve-intelligence-profile";
import { setExperienceIntent } from "./experience-intent";

const ACTIVE_KEY = "executiveos.activeExecutiveSnapshot.v1";
const LIBRARY_KEY = "executiveos.executiveSnapshotLibrary.v1";

export type ActiveExecutiveSnapshotContext = {
  /** Workflow / context kind — not an Intelligence Profile id. */
  kind: "executive_snapshot";
  studioId: string;
  snapshotId: string;
  organisationId: string;
  /** Only set when known from the session — never invent Helix/Northline. */
  organisationName?: string;
  profileId: StudioBusinessProfileId;
  profileLabel: string;
  /**
   * Resolved Intelligence Profile catalogue id (e.g. commercial_executive).
   * Never "executive_snapshot".
   */
  intelligenceProfileId: IntelligenceProfileId;
  sourceKind: UdgSourceKind;
  filename?: string;
  recordCount: number;
  confidenceOverall: number;
  readiness: StudioReadiness;
  /** Authoritative portfolio for OutcomeProvider / EIE — never MOCK_OUTCOME_PORTFOLIO. */
  portfolio: OutcomePortfolio;
  /** Commercial analysis — only when commercial snapshot is active. */
  analysis?: CommercialAnalysis;
  commercialBrief?: CommercialExecutiveBrief;
  /** Manufacturing Forecasting analysis — only when manufacturing snapshot is active. */
  manufacturingAnalysis?: ManufacturingAnalysis;
  manufacturingBrief?: ManufacturingExecutiveBrief;
  briefPreview?: StudioBriefPreview;
  intelligence?: StudioIntelligenceActivation;
  councilSeats: string[];
  advisorNames: string[];
  activatedAt: string;
  demoIsolation: true;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function readLibrary(): Record<string, ActiveExecutiveSnapshotContext> {
  if (!canUseStorage()) return {};
  try {
    const raw = sessionStorage.getItem(LIBRARY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ActiveExecutiveSnapshotContext>;
  } catch {
    return {};
  }
}

function writeLibrary(
  library: Record<string, ActiveExecutiveSnapshotContext>,
): void {
  if (!canUseStorage()) return;
  sessionStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
}

/**
 * Activate an Executive Snapshot as the authoritative session context.
 * Replaces any prior active snapshot (A → B switching).
 */
export function activateExecutiveSnapshotContext(
  ctx: Omit<ActiveExecutiveSnapshotContext, "intelligenceProfileId" | "kind" | "demoIsolation" | "activatedAt"> &
    Partial<
      Pick<
        ActiveExecutiveSnapshotContext,
        "intelligenceProfileId" | "kind" | "demoIsolation" | "activatedAt"
      >
    >,
): ActiveExecutiveSnapshotContext {
  const intelligenceProfileId =
    ctx.intelligenceProfileId ??
    resolveIntelligenceProfileIdFromBusinessProfile(ctx.profileId);

  const next: ActiveExecutiveSnapshotContext = {
    ...ctx,
    kind: "executive_snapshot",
    demoIsolation: true,
    intelligenceProfileId,
    activatedAt: ctx.activatedAt || new Date().toISOString(),
    councilSeats:
      ctx.councilSeats.length > 0
        ? ctx.councilSeats
        : ["CEO", "CFO", "COO", "CRO", "CSO"],
  };

  if (canUseStorage()) {
    sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
    const library = readLibrary();
    library[next.studioId] = next;
    writeLibrary(library);
    setExperienceIntent("executive_snapshot");
    // Durable SoT — sessionStorage is transient UX only.
    void import("@/pilot-persistence/actions")
      .then((m) => m.persistPilotSnapshotAction({ context: next }))
      .catch(() => {
        /* non-blocking; server will reject unauthenticated */
      });
  }

  return next;
}

/** Resolve the currently active Executive Snapshot (if any). */
export function getActiveExecutiveSnapshot(): ActiveExecutiveSnapshotContext | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveExecutiveSnapshotContext;
    if (parsed?.kind !== "executive_snapshot" || !parsed.snapshotId) {
      return null;
    }
    // Backfill intelligence profile for contexts activated before Phase 57E.
    if (!parsed.intelligenceProfileId && parsed.profileId) {
      parsed.intelligenceProfileId =
        resolveIntelligenceProfileIdFromBusinessProfile(parsed.profileId);
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Alias for architectural clarity. */
export function getActiveExecutiveSnapshotContext(): ActiveExecutiveSnapshotContext | null {
  return getActiveExecutiveSnapshot();
}

/**
 * Resolve by studioId (library / ?studio=) and activate it.
 * Returns null when the studio context cannot be found — callers must NOT
 * silently fall back to demo data.
 */
export function resolveAndActivateExecutiveSnapshot(
  studioId: string,
): ActiveExecutiveSnapshotContext | null {
  const library = readLibrary();
  const found = library[studioId];
  if (!found) {
    const active = getActiveExecutiveSnapshot();
    if (active?.studioId === studioId) return active;
    return null;
  }
  return activateExecutiveSnapshotContext(found);
}

export function clearActiveExecutiveSnapshot(): void {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(ACTIVE_KEY);
}

export function clearExecutiveSnapshotLibrary(): void {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(LIBRARY_KEY);
  sessionStorage.removeItem(ACTIVE_KEY);
}

export function listStoredExecutiveSnapshots(): ActiveExecutiveSnapshotContext[] {
  return Object.values(readLibrary()).sort((a, b) =>
    b.activatedAt.localeCompare(a.activatedAt),
  );
}

export function isDemoOrganisationName(name: string | undefined | null): boolean {
  if (!name) return false;
  return /helix|northline|alex\s*rivera/i.test(name);
}

export function snapshotCommandCentreTitle(
  ctx: ActiveExecutiveSnapshotContext,
): string {
  if (ctx.profileId === "commercial") {
    return "Commercial Executive Brief";
  }
  return `${ctx.profileLabel}`;
}
