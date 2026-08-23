/**
 * Pack reports & recommendations — uniform discovery surfaces.
 */

import type {
  ExecutiveIntelligencePack,
  PackRecommendationTemplate,
  PackReportTemplate,
} from "@/intelligence-packs/contract";
import type { IntelligencePackRegistry } from "@/intelligence-packs/registry";

export function collectReportTemplates(
  registry: IntelligencePackRegistry,
  packIds?: string[],
): Array<PackReportTemplate & { packId: string }> {
  const packs = resolvePacks(registry, packIds);
  return packs.flatMap((pack) =>
    pack.reports().map((report) => ({ ...report, packId: pack.manifest.id })),
  );
}

export function collectRecommendationTemplates(
  registry: IntelligencePackRegistry,
  packIds?: string[],
): Array<PackRecommendationTemplate & { packId: string }> {
  const packs = resolvePacks(registry, packIds);
  return packs.flatMap((pack) =>
    pack
      .recommendations()
      .map((recommendation) => ({
        ...recommendation,
        packId: pack.manifest.id,
      })),
  );
}

function resolvePacks(
  registry: IntelligencePackRegistry,
  packIds?: string[],
): ExecutiveIntelligencePack[] {
  if (packIds) {
    return packIds
      .map((id) => registry.get(id))
      .filter((pack): pack is ExecutiveIntelligencePack => Boolean(pack));
  }
  return registry.activePacks().length > 0
    ? registry.activePacks()
    : registry.list();
}
