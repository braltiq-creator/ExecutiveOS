/**
 * Assign Executive Intelligence Packs at provision time.
 * Composition only — register/activate via EIPF registry. Never modifies packs.
 */

import {
  createIntelligencePackRegistry,
  getIntelligencePackRegistry,
  setIntelligencePackRegistry,
} from "@/intelligence-packs/registry";
import { registerManufacturingPack } from "@/intelligence-packs/packs/manufacturing/register";
import { MANUFACTURING_PACK_ID } from "@/intelligence-packs/packs/manufacturing/constants";
import type { ProvisioningProfileDefinition } from "@/provisioning/executive-profile/catalog";

export type PackAssignmentResult = {
  ok: boolean;
  packIds: string[];
  errors: string[];
  detail: string;
};

/**
 * Ensure required packs are registered and activated for this tenant profile.
 * Tenant-scoped intent is recorded; registry is process-level (mock-first).
 */
export function assignIntelligencePacks(
  profile: ProvisioningProfileDefinition,
): PackAssignmentResult {
  if (profile.packIds.length === 0) {
    return {
      ok: true,
      packIds: [],
      errors: [],
      detail: "No industry pack required for this executive profile",
    };
  }

  let registry = getIntelligencePackRegistry();
  // Fresh registry if empty — safe for tests / first provision
  if (registry.list().length === 0) {
    registry = createIntelligencePackRegistry();
    setIntelligencePackRegistry(registry);
  }

  const errors: string[] = [];
  const activated: string[] = [];

  for (const packId of profile.packIds) {
    if (packId === MANUFACTURING_PACK_ID) {
      if (!registry.get(MANUFACTURING_PACK_ID)) {
        const result = registerManufacturingPack(registry, {
          activate: true,
        });
        if (!result.ok) {
          errors.push(...result.errors);
          continue;
        }
      } else {
        registry.activate(MANUFACTURING_PACK_ID);
      }
      activated.push(MANUFACTURING_PACK_ID);
    } else {
      errors.push(`Unknown pack assignment: ${packId}`);
    }
  }

  return {
    ok: errors.length === 0,
    packIds: activated,
    errors,
    detail:
      activated.length > 0
        ? `Activated packs: ${activated.join(", ")}`
        : "No packs activated",
  };
}
