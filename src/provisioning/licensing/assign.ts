/**
 * Trial licensing for self-service provisioning.
 */

import { issueLicense } from "@/commercial/licensing";
import type { CommercialLicense } from "@/commercial/framework/types";
import type { ProvisioningProfileDefinition } from "@/provisioning/executive-profile/catalog";

export function assignTrialLicence(input: {
  tenantId: string;
  profile: ProvisioningProfileDefinition;
  asOf: string;
}): CommercialLicense {
  return issueLicense({
    tenantId: input.tenantId,
    editionId: input.profile.commercialEditionId,
    tier: "trial",
    seats: 3,
    executives: 1,
    startsAt: input.asOf,
    notes: `Self-service 30-day trial — ${input.profile.name}`,
  });
}
