/**
 * Executive Intent Engine (EInE)
 *
 * Understands the executive leading the organisation.
 * Filters every recommendation through personal strategic intent.
 */

export type * from "@/intelligence/executive-intent/types";
export { ALIGNMENT_LABELS } from "@/intelligence/executive-intent/types";

export {
  scoreAgainstIntent,
  calculateStrategicAlignment,
  calculateAttentionPriority,
  recommendDelegation,
  generateIntentNarrative,
} from "@/intelligence/executive-intent/engine";

export { applyExecutiveIntent } from "@/intelligence/executive-intent/apply-intent";

export type { ExecutiveIntentProvider } from "@/intelligence/executive-intent/provider";
export { createMockExecutiveIntentProvider } from "@/intelligence/executive-intent/provider";

export {
  CEO_INTENT_PROFILE,
  COO_INTENT_PROFILE,
  CFO_INTENT_PROFILE,
  CHIEF_OF_STAFF_INTENT_PROFILE,
  INTENT_PROFILES,
} from "@/intelligence/executive-intent/profiles/mock-profiles";

import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";
import type { ExecutiveIntentProvider } from "@/intelligence/executive-intent/provider";
import { createMockExecutiveIntentProvider } from "@/intelligence/executive-intent/provider";

let defaultProvider: ExecutiveIntentProvider | null = null;

export function setExecutiveIntentProvider(
  provider: ExecutiveIntentProvider,
): void {
  defaultProvider = provider;
}

export function getExecutiveIntentProvider(): ExecutiveIntentProvider {
  if (!defaultProvider) {
    defaultProvider = createMockExecutiveIntentProvider("CEO");
  }
  return defaultProvider;
}

/** Primary accessor — active executive intent profile. */
export function getExecutiveIntent(): ExecutiveIntentProfile {
  return getExecutiveIntentProvider().getExecutiveIntent();
}

/** Resolve profile by role (tests / multi-executive scenarios). */
export function getExecutiveIntentForRole(
  role: ExecutiveIntentProfile["role"],
): ExecutiveIntentProfile {
  return createMockExecutiveIntentProvider(role).getExecutiveIntent();
}
