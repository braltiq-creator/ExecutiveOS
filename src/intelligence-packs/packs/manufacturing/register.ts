/**
 * Register + activate Manufacturing pack on an EIPF registry.
 * Composition-time only — no Core boot wiring required.
 */

import type { IntelligencePackRegistry } from "@/intelligence-packs/registry";
import { createManufacturingExecutivePack } from "@/intelligence-packs/packs/manufacturing/factory";
import { MANUFACTURING_PACK_ID } from "@/intelligence-packs/packs/manufacturing/constants";

export function registerManufacturingPack(
  registry: IntelligencePackRegistry,
  options?: { activate?: boolean; exclusive?: boolean },
): { ok: boolean; packId: string; errors: string[] } {
  const pack = createManufacturingExecutivePack();
  const result = registry.register(pack);
  if (!result.ok) {
    return {
      ok: false,
      packId: MANUFACTURING_PACK_ID,
      errors: result.errors,
    };
  }

  if (options?.activate !== false) {
    if (options?.exclusive) {
      registry.setActive([MANUFACTURING_PACK_ID]);
    } else {
      registry.activate(MANUFACTURING_PACK_ID);
    }
  }

  return { ok: true, packId: MANUFACTURING_PACK_ID, errors: [] };
}
