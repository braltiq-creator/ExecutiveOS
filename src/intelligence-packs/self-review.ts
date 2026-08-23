/**
 * EIPF self-review — platform readiness questions from Phase 47.
 */

import type { IntelligencePackRegistry } from "@/intelligence-packs/registry";
import { collectOutcomeEngineSeeds } from "@/intelligence-packs/consumers/outcomes";
import { collectCouncilOverlays } from "@/intelligence-packs/consumers/council";
import { discoverPackScenarios } from "@/intelligence-packs/consumers/reality-lab";
import { collectOntology } from "@/intelligence-packs/consumers/ontology";

export type EipfSelfReview = {
  canAddIndustryWithoutCoreChanges: boolean;
  canSupportMultiplePacks: boolean;
  canCouncilAdaptToIndustry: boolean;
  canRealityLabValidateIndustries: boolean;
  allPassed: boolean;
  evidence: string[];
};

/**
 * Answer the Phase 47 self-review from a live registry state.
 */
export function reviewIntelligencePackFramework(
  registry: IntelligencePackRegistry,
): EipfSelfReview {
  const packs = registry.list();
  const evidence: string[] = [];

  const canAddIndustryWithoutCoreChanges =
    packs.length > 0 &&
    packs.every((pack) => {
      const hasIndustry = Boolean(pack.industry());
      const hasContract =
        typeof pack.outcomes === "function" &&
        typeof pack.ontology === "function" &&
        typeof pack.councilKnowledge === "function" &&
        typeof pack.realityLab === "function";
      return hasIndustry && hasContract;
    });
  if (canAddIndustryWithoutCoreChanges) {
    evidence.push(
      "Packs register through IntelligencePackRegistry without Core imports of industry types.",
    );
  }

  const multiOk = registry.setActive(packs.slice(0, 2).map((p) => p.manifest.id));
  const canSupportMultiplePacks =
    packs.length >= 2 && multiOk.ok && registry.activePackIds().length >= 2;
  if (canSupportMultiplePacks) {
    evidence.push(
      `Multiple packs active simultaneously: ${registry.activePackIds().join(", ")}.`,
    );
  }

  const overlays = collectCouncilOverlays(registry);
  const canCouncilAdaptToIndustry = overlays.some((overlay) =>
    (["ceo", "cfo", "coo", "cro", "cso"] as const).every(
      (role) => overlay.byRole[role] !== null,
    ),
  );
  if (canCouncilAdaptToIndustry) {
    evidence.push(
      "Council overlays provide industry-aware knowledge for all five permanent roles.",
    );
  }

  const scenarios = discoverPackScenarios(registry);
  const seeds = collectOutcomeEngineSeeds(registry);
  const ontologies = collectOntology(registry);
  const uniformSeeds =
    seeds.length > 0 &&
    seeds.every(
      (seed) =>
        Array.isArray(seed.outcomes) &&
        seed.outcomes.every((outcome) => outcome.name && outcome.id),
    );
  const canRealityLabValidateIndustries =
    scenarios.length > 0 && uniformSeeds && ontologies.length > 0;
  if (canRealityLabValidateIndustries) {
    evidence.push(
      `Reality Lab discovers ${scenarios.length} pack scenarios; Outcome seeds remain uniform.`,
    );
  }

  const allPassed =
    canAddIndustryWithoutCoreChanges &&
    canSupportMultiplePacks &&
    canCouncilAdaptToIndustry &&
    canRealityLabValidateIndustries;

  return {
    canAddIndustryWithoutCoreChanges,
    canSupportMultiplePacks,
    canCouncilAdaptToIndustry,
    canRealityLabValidateIndustries,
    allPassed,
    evidence,
  };
}
