/**
 * Reality Lab consumer — industry scenarios without Core branching.
 */

import type { ExecutiveScenario } from "@/simulation/types";
import type {
  ExecutiveIntelligencePack,
  PackRealityLabDefinition,
} from "@/intelligence-packs/contract";
import type { IntelligencePackRegistry } from "@/intelligence-packs/registry";

export type PackRealityLabBundle = {
  packId: string;
  industry: string;
  definition: PackRealityLabDefinition;
};

export function loadPackRealityLab(
  pack: ExecutiveIntelligencePack,
): PackRealityLabBundle {
  return {
    packId: pack.manifest.id,
    industry: pack.industry(),
    definition: pack.realityLab(),
  };
}

/** Discover scenarios from one or many packs — Reality Lab treats them identically. */
export function discoverPackScenarios(
  registry: IntelligencePackRegistry,
  packIds?: string[],
): ExecutiveScenario[] {
  const packs = packIds
    ? packIds
        .map((id) => registry.get(id))
        .filter((pack): pack is ExecutiveIntelligencePack => Boolean(pack))
    : registry.activePacks().length > 0
      ? registry.activePacks()
      : registry.list();

  return packs.flatMap((pack) => pack.realityLab().scenarios);
}

export function collectRealityLabBundles(
  registry: IntelligencePackRegistry,
  packIds?: string[],
): PackRealityLabBundle[] {
  const packs = packIds
    ? packIds
        .map((id) => registry.get(id))
        .filter((pack): pack is ExecutiveIntelligencePack => Boolean(pack))
    : registry.activePacks().length > 0
      ? registry.activePacks()
      : registry.list();

  return packs.map(loadPackRealityLab);
}

/**
 * Structural validation of pack Reality Lab readiness before customer use.
 */
export function validatePackRealityLab(pack: ExecutiveIntelligencePack): {
  ok: boolean;
  errors: string[];
  warnings: string[];
} {
  const lab = pack.realityLab();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (lab.scenarios.length === 0) {
    errors.push("Reality Lab requires at least one scenario");
  }
  if (lab.successMeasures.length === 0) {
    warnings.push("No success measures defined");
  }
  if (lab.failureConditions.length === 0) {
    warnings.push("No failure conditions defined");
  }
  if (lab.executiveQuestions.length === 0) {
    warnings.push("No executive questions defined");
  }

  const scenarioIds = new Set(lab.scenarios.map((scenario) => scenario.id));
  for (const expected of lab.expectedOutcomes) {
    if (!scenarioIds.has(expected.scenarioId)) {
      errors.push(
        `Expected outcome references unknown scenario ${expected.scenarioId}`,
      );
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
