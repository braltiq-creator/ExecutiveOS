/**
 * Executive Intelligence Pack Framework (EIPF)
 *
 * Industry capability extends ExecutiveOS through packs — never Core forks.
 * Every pack inherits the same contract and the Executive Experience System.
 */

export type * from "@/intelligence-packs/contract";

export {
  defineIntelligencePack,
  validatePackContract,
} from "@/intelligence-packs/define";
export type { DefineIntelligencePackInput } from "@/intelligence-packs/define";

export {
  IntelligencePackRegistry,
  createIntelligencePackRegistry,
  getIntelligencePackRegistry,
  setIntelligencePackRegistry,
} from "@/intelligence-packs/registry";
export type { PackRegistrationResult } from "@/intelligence-packs/registry";

export {
  toOutcomeEngineSeed,
  collectOutcomeEngineSeeds,
  packOutcomeNames,
} from "@/intelligence-packs/consumers/outcomes";

export {
  resolvePackOntology,
  collectOntology,
  explainOntologyTerm,
} from "@/intelligence-packs/consumers/ontology";
export type { ResolvedOntology } from "@/intelligence-packs/consumers/ontology";

export {
  buildCouncilOverlay,
  resolveCouncilKnowledgeForRole,
  collectCouncilOverlays,
  councilIndustryPreface,
} from "@/intelligence-packs/consumers/council";

export {
  loadPackRealityLab,
  discoverPackScenarios,
  collectRealityLabBundles,
  validatePackRealityLab,
} from "@/intelligence-packs/consumers/reality-lab";
export type { PackRealityLabBundle } from "@/intelligence-packs/consumers/reality-lab";

export {
  collectReportTemplates,
  collectRecommendationTemplates,
} from "@/intelligence-packs/consumers/reports";

export { intelligencePackFromKnowledgePack } from "@/intelligence-packs/adapters/from-knowledge-pack";

export { createReferenceIntelligencePack } from "@/intelligence-packs/fixtures/reference-pack";

export {
  createManufacturingExecutivePack,
  registerManufacturingPack,
  validateManufacturingPack,
  MANUFACTURING_PACK_ID,
  MANUFACTURING_INDUSTRY,
  createMockDynamicsManufacturingProvider,
} from "@/intelligence-packs/packs/manufacturing";

export { reviewIntelligencePackFramework } from "@/intelligence-packs/self-review";
export type { EipfSelfReview } from "@/intelligence-packs/self-review";
