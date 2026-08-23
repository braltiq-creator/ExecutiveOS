/**
 * Project Intelligence Profile onto the Today experience.
 * Core snapshot content is unchanged — only prioritisation and framing.
 */

import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { IntelligenceProfile } from "@/profiles/framework/types";
import { getIntelligenceProfile } from "@/profiles/catalog";
import {
  getTenantProfileSelection,
  applyRecommendedProfile,
} from "@/profiles/experience/selection";
import {
  primaryContextLabel,
  resolveBriefLayout,
  type BriefSectionDescriptor,
} from "@/profiles/briefings";

export type ProfileExperienceProjection = {
  profile: IntelligenceProfile;
  briefLayout: BriefSectionDescriptor[];
  briefingMode: string;
  profileBadge: string;
  /** Snapshot with context sections optionally de-emphasised by profile (still present) */
  snapshot: ExecutiveSnapshot;
};

export function resolveTenantIntelligenceProfile(
  tenantId: string,
): IntelligenceProfile {
  const selection = getTenantProfileSelection(tenantId);
  if (selection) return getIntelligenceProfile(selection.profileId);
  // Default Design Partner seed: Operations (field services) until discovery selects
  const seeded = applyRecommendedProfile({
    tenantId,
    connectedProviders: ["microsoft365", "simpro"],
    role: "Managing Director",
    primaryObjective: "Operational Excellence",
  });
  return getIntelligenceProfile(seeded.profileId);
}

export function projectProfileExperience(input: {
  tenantId: string;
  snapshot: ExecutiveSnapshot;
  profileId?: IntelligenceProfile["id"];
}): ProfileExperienceProjection {
  const profile = input.profileId
    ? getIntelligenceProfile(input.profileId)
    : resolveTenantIntelligenceProfile(input.tenantId);

  // Core identical — we only attach layout metadata for the presentation layer.
  return {
    profile,
    briefLayout: resolveBriefLayout(profile),
    briefingMode: primaryContextLabel(profile),
    profileBadge: profile.name,
    snapshot: input.snapshot,
  };
}
