/**
 * Stage 4 verification — explicit decision persistence mode.
 * Durable server writes require an activated Executive Snapshot with organisationId.
 * Without that, the portfolio store retains recordings in the UI cache only
 * (localStorage via mockPortfolioRepository) — not proof of Supabase durability.
 */

import { getActiveExecutiveSnapshot } from "@/executive-snapshot-studio/launch/executive-snapshot-context";

export type DecisionPersistenceMode =
  | "durable_eligible"
  | "ui_cache_only";

export type DecisionPersistenceStatus = {
  mode: DecisionPersistenceMode;
  reason: string;
  organisationId: string | null;
  snapshotId: string | null;
  /** True only when a durable pilot write will be attempted. */
  willAttemptServerWrite: boolean;
};

/**
 * Resolve whether the next portfolio mutation can reach pilot persistence.
 * Does not itself write — used by UI honesty banners and verification tests.
 */
export function resolveDecisionPersistenceStatus(
  activeSnapshotId: string | null | undefined,
): DecisionPersistenceStatus {
  const snapshotId = activeSnapshotId ?? null;

  // Check snapshot id before `window` so SSR and the first client paint agree
  // when no snapshot is bound (avoids Next.js hydration mismatch → Issues).
  if (!snapshotId) {
    return {
      mode: "ui_cache_only",
      reason:
        "No active snapshot id on the portfolio store — durable pilot write is skipped.",
      organisationId: null,
      snapshotId: null,
      willAttemptServerWrite: false,
    };
  }

  if (typeof window === "undefined") {
    return {
      mode: "ui_cache_only",
      reason:
        "No activated Executive Snapshot organisation context (session). Recordings stay in the UI cache until an organisation snapshot is activated. localStorage is not durable SoT.",
      organisationId: null,
      snapshotId,
      willAttemptServerWrite: false,
    };
  }

  const active = getActiveExecutiveSnapshot();
  if (!active?.organisationId) {
    return {
      mode: "ui_cache_only",
      reason:
        "No activated Executive Snapshot organisation context (session). Recordings stay in the UI cache until an organisation snapshot is activated. localStorage is not durable SoT.",
      organisationId: null,
      snapshotId,
      willAttemptServerWrite: false,
    };
  }
  return {
    mode: "durable_eligible",
    reason:
      "Active organisation snapshot present — portfolio mutations will call persistPilotPortfolioAction (Supabase in production / memory contract in mock).",
    organisationId: active.organisationId,
    snapshotId,
    willAttemptServerWrite: true,
  };
}
