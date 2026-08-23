/**
 * Outcome Engine consumer — every pack through the same contract.
 * Does not modify the Outcome Engine; produces a uniform seed shape.
 */

import type {
  ExecutiveIntelligencePack,
  PackOutcomeEngineSeed,
} from "@/intelligence-packs/contract";
import type { IntelligencePackRegistry } from "@/intelligence-packs/registry";

/**
 * Project a pack into the Outcome Engine seed contract.
 * Identical shape regardless of industry.
 */
export function toOutcomeEngineSeed(
  pack: ExecutiveIntelligencePack,
): PackOutcomeEngineSeed {
  return {
    packId: pack.manifest.id,
    industry: pack.industry(),
    outcomes: pack.outcomes().map((outcome) => ({
      id: outcome.id,
      name: outcome.name,
      description: outcome.description,
      owner: String(outcome.ownerRole),
      successMeasures: [...outcome.successMeasures],
      supportingKpis: [...outcome.supportingKpiIds],
      strategicImportance: outcome.strategicImportance,
    })),
  };
}

/**
 * Merge outcome seeds from multiple active packs.
 * Core still receives a single uniform list — no industry branching.
 */
export function collectOutcomeEngineSeeds(
  registry: IntelligencePackRegistry,
  packIds?: string[],
): PackOutcomeEngineSeed[] {
  const packs = packIds
    ? packIds
        .map((id) => registry.get(id))
        .filter((pack): pack is ExecutiveIntelligencePack => Boolean(pack))
    : registry.activePacks().length > 0
      ? registry.activePacks()
      : registry.list();

  return packs.map(toOutcomeEngineSeed);
}

/** Outcome names for discovery seeding — pack-agnostic string list. */
export function packOutcomeNames(pack: ExecutiveIntelligencePack): string[] {
  return pack.outcomes().map((outcome) => outcome.name);
}
