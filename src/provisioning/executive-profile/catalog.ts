/**
 * Provisioning executive profile catalog.
 * Maps customer choice → Intelligence Profile + pack assignment.
 * Does not modify profiles framework or pack internals.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { ProvisioningExecutiveProfileId } from "@/provisioning/types";
import { MANUFACTURING_PACK_ID } from "@/intelligence-packs/packs/manufacturing/constants";

export type ProvisioningProfileDefinition = {
  id: ProvisioningExecutiveProfileId;
  name: string;
  summary: string;
  /** Existing Intelligence Profile — Manufacturing maps onto Operations + pack */
  intelligenceProfileId: IntelligenceProfileId;
  /** EIPF pack ids to register/activate — never edits pack code */
  packIds: string[];
  commercialEditionId: "operations_executive" | "commercial_executive";
  industryDefault: string;
};

export const PROVISIONING_PROFILES: Record<
  ProvisioningExecutiveProfileId,
  ProvisioningProfileDefinition
> = {
  operations_executive: {
    id: "operations_executive",
    name: "Operations Executive",
    summary:
      "Delivery, capacity, and operational resilience for operations leaders.",
    intelligenceProfileId: "operations_executive",
    packIds: [],
    commercialEditionId: "operations_executive",
    industryDefault: "Field Services",
  },
  commercial_executive: {
    id: "commercial_executive",
    name: "Commercial Executive",
    summary:
      "Pipeline, revenue system, and commercial confidence for growth leaders.",
    intelligenceProfileId: "commercial_executive",
    packIds: [],
    commercialEditionId: "commercial_executive",
    industryDefault: "B2B SaaS",
  },
  manufacturing_executive: {
    id: "manufacturing_executive",
    name: "Manufacturing Executive",
    summary:
      "Demand, factory planning, inventory, dealers, and working capital — Manufacturing Intelligence Pack.",
    intelligenceProfileId: "operations_executive",
    packIds: [MANUFACTURING_PACK_ID],
    commercialEditionId: "operations_executive",
    industryDefault: "Manufacturing",
  },
};

export function getProvisioningProfile(
  id: ProvisioningExecutiveProfileId,
): ProvisioningProfileDefinition {
  return PROVISIONING_PROFILES[id];
}

export function listProvisioningProfiles(): ProvisioningProfileDefinition[] {
  return Object.values(PROVISIONING_PROFILES);
}
