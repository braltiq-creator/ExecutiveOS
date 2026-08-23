/**
 * Progress tracking for the <15 minute discovery journey.
 */

import type { DiscoveryProgress } from "@/onboarding/types";
import { TARGET_ONBOARDING_MINUTES } from "@/onboarding/types";

export function createProgress(tenantId: string): DiscoveryProgress {
  return {
    tenantId,
    phase: "welcome",
    percent: 0,
    elapsedSeconds: 0,
    targetMinutes: TARGET_ONBOARDING_MINUTES,
    message: "Welcome — I'll learn your organisation from connected systems.",
    discoveriesFound: 0,
    systemsConnected: [],
  };
}

export function advanceProgress(
  progress: DiscoveryProgress,
  update: Partial<DiscoveryProgress>,
): DiscoveryProgress {
  const next = { ...progress, ...update };
  const phaseFloor: Record<DiscoveryProgress["phase"], number> = {
    welcome: 0,
    questions: 10,
    connecting: 25,
    discovering: 45,
    validating: 70,
    briefing: 88,
    complete: 100,
  };
  next.percent = Math.max(
    phaseFloor[next.phase],
    Math.min(100, update.percent ?? next.percent),
  );
  return next;
}

export function estimateRemainingMinutes(progress: DiscoveryProgress): number {
  const remainingPct = Math.max(0, 100 - progress.percent);
  return Math.max(
    1,
    Math.round((remainingPct / 100) * progress.targetMinutes),
  );
}
