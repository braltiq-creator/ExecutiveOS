/**
 * Attach adaptive ranking/personalisation to Today recommendations.
 * Presentation only — Core engines unchanged.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import { ensureAdaptiveProfile } from "@/adaptive/preferences/store";
import { buildPersonalisationPlan } from "@/adaptive/personalisation/plan";
import { rankRecommendationsForExecutive } from "@/adaptive/ranking/order";
import { isAdaptiveEnabled } from "@/adaptive/governance/controls";

export function attachAdaptiveLearningToTodayActions(
  snapshot: ExecutiveSnapshot,
  tenantId: string,
  profileId?: IntelligenceProfileId,
  executiveId = "executive-primary",
): ExecutiveSnapshot {
  const resolvedProfile = profileId ?? "operations_executive";
  ensureAdaptiveProfile({
    tenantId,
    executiveId,
    profileId: resolvedProfile,
  });

  if (!isAdaptiveEnabled(tenantId, executiveId)) {
    return snapshot;
  }

  const plan = buildPersonalisationPlan({
    tenantId,
    executiveId,
    profileId: resolvedProfile,
  });

  const recommendedActions = rankRecommendationsForExecutive({
    tenantId,
    executiveId,
    actions: snapshot.recommendedActions,
    plan,
  });

  return {
    ...snapshot,
    recommendedActions,
  };
}
