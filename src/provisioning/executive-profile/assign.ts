/**
 * Assign Intelligence Profile to tenant (compose existing profiles API).
 */

import { selectTenantIntelligenceProfile } from "@/profiles";
import type { ProvisioningProfileDefinition } from "@/provisioning/executive-profile/catalog";

export function assignExecutiveProfile(input: {
  tenantId: string;
  profile: ProvisioningProfileDefinition;
  asOf: string;
}): void {
  selectTenantIntelligenceProfile({
    tenantId: input.tenantId,
    profileId: input.profile.intelligenceProfileId,
    source: "manual",
    recommendedProfileId: input.profile.intelligenceProfileId,
    explanation: `Self-service provisioning — ${input.profile.name}`,
    asOf: input.asOf,
  });
}
