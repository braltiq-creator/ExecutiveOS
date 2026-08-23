import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";
import { INTENT_PROFILES } from "@/intelligence/executive-intent/profiles/mock-profiles";

/**
 * Intent provider — mock profiles today, HRIS / goals systems tomorrow.
 */
export type ExecutiveIntentProvider = {
  readonly id: string;
  readonly label: string;
  getExecutiveIntent(): ExecutiveIntentProfile;
};

export function createMockExecutiveIntentProvider(
  role: ExecutiveIntentProfile["role"] = "CEO",
): ExecutiveIntentProvider {
  const profile = INTENT_PROFILES[role];
  return {
    id: `mock-intent-${role.toLowerCase()}`,
    label: `Mock ${profile.title} Intent`,
    getExecutiveIntent: () => profile,
  };
}
