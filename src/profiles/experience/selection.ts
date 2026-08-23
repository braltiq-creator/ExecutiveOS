/**
 * Per-tenant Intelligence Profile selection — isolated across Design Partners.
 */

import type {
  IntelligenceProfileId,
  TenantProfileSelection,
} from "@/profiles/framework/types";
import { getIntelligenceProfile } from "@/profiles/catalog";
import { recommendIntelligenceProfile } from "@/profiles/recommendations";
import type { ProviderId } from "@/profiles/framework/types";

const selections = new Map<string, TenantProfileSelection>();

export function getTenantProfileSelection(
  tenantId: string,
): TenantProfileSelection | null {
  return selections.get(tenantId) ?? null;
}

export function selectTenantIntelligenceProfile(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  source: "recommended" | "manual";
  recommendedProfileId?: IntelligenceProfileId;
  explanation?: string;
  asOf?: string;
}): TenantProfileSelection {
  // Validate exists
  getIntelligenceProfile(input.profileId);
  const recommended =
    input.recommendedProfileId ??
    recommendIntelligenceProfile({}).profileId;
  const next: TenantProfileSelection = {
    tenantId: input.tenantId,
    profileId: input.profileId,
    source: input.source,
    recommendedProfileId: recommended,
    explanation:
      input.explanation ??
      (input.source === "manual"
        ? `Manually selected ${getIntelligenceProfile(input.profileId).name}.`
        : recommendIntelligenceProfile({}).explanation),
    selectedAt: input.asOf ?? new Date().toISOString(),
  };
  selections.set(input.tenantId, next);
  return next;
}

export function applyRecommendedProfile(input: {
  tenantId: string;
  role?: string;
  primaryObjective?: string;
  industry?: string;
  connectedProviders?: ProviderId[];
  asOf?: string;
}): TenantProfileSelection {
  const recommendation = recommendIntelligenceProfile({
    role: input.role,
    primaryObjective: input.primaryObjective,
    industry: input.industry,
    connectedProviders: input.connectedProviders,
  });
  return selectTenantIntelligenceProfile({
    tenantId: input.tenantId,
    profileId: recommendation.profileId,
    source: "recommended",
    recommendedProfileId: recommendation.profileId,
    explanation: recommendation.explanation,
    asOf: input.asOf,
  });
}

export function resetTenantProfileSelections(): void {
  selections.clear();
}

export function listTenantProfileSelections(): TenantProfileSelection[] {
  return [...selections.values()];
}
