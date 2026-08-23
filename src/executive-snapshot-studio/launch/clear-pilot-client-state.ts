/**
 * Clear ExecutiveOS pilot browser session state on logout.
 * Does not touch Supabase data or unrelated keys (e.g. theme, trial intent).
 */

import { clearActiveStudioContext } from "./active-context";
import { clearExperienceIntent } from "./experience-intent";
import { clearExecutiveSnapshotLibrary } from "./executive-snapshot-context";
import { mockPortfolioRepository } from "@/services/portfolio/mock-repository";

const PILOT_SESSION_KEYS = [
  "executiveos.activeExecutiveSnapshot.v1",
  "executiveos.executiveSnapshotLibrary.v1",
  "executiveos.experienceIntent.v1",
] as const;

/**
 * Removes pilot snapshot/context identifiers from sessionStorage and the
 * transient portfolio UI cache. Safe to call from the client before signOut.
 */
export function clearPilotClientState(): void {
  clearExecutiveSnapshotLibrary();
  clearExperienceIntent();
  clearActiveStudioContext();
  mockPortfolioRepository.reset();

  if (typeof window === "undefined") return;
  for (const key of PILOT_SESSION_KEYS) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
