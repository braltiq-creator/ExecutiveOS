/**
 * Experience intent — prevents silent demo fallback after Design Partner use.
 * sessionStorage only; never invents tenant data.
 */

export type ExperienceIntent = "demo" | "executive_snapshot";

const INTENT_KEY = "executiveos.experienceIntent.v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function setExperienceIntent(intent: ExperienceIntent): void {
  if (!canUseStorage()) return;
  sessionStorage.setItem(INTENT_KEY, intent);
}

export function getExperienceIntent(): ExperienceIntent | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (raw === "demo" || raw === "executive_snapshot") return raw;
    return null;
  } catch {
    return null;
  }
}

export function clearExperienceIntent(): void {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(INTENT_KEY);
}

/**
 * True when /today must not silently load Northline/demo.
 *
 * Pilot access rule (M3.1): authenticated / production sessions never
 * silently fall into demo. Explicit `?demo=1` or intent `demo` only.
 */
export function shouldForbidDemoFallback(input: {
  studioParam?: string | null;
  hasActiveSnapshot: boolean;
  libraryCount: number;
  demoParam?: string | null;
  intent?: ExperienceIntent | null;
  /** When true (default), forbid silent demo even for first-time empty sessions. */
  forbidSilentDemo?: boolean;
}): boolean {
  if (input.demoParam === "1" || input.intent === "demo") return false;
  if (input.forbidSilentDemo !== false) return true;
  if (input.hasActiveSnapshot) return true;
  if (input.studioParam) return true;
  if (input.intent === "executive_snapshot") return true;
  if (input.libraryCount > 0) return true;
  return false;
}
