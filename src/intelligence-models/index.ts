/**
 * Executive Intelligence Models (EIM) — Phase 50
 *
 * Behavioural layer between EIRL research and Intelligence Pack implementation.
 * Industry packs supply context; these models supply reasoning behaviour.
 *
 * Not Core. Not product UI. Not industry pack implementations.
 */

export type * from "@/intelligence-models/types";

export {
  defineExecutiveIntelligenceModel,
  validateExecutiveIntelligenceModel,
} from "@/intelligence-models/define";
export type { DefineExecutiveIntelligenceModelInput } from "@/intelligence-models/define";

export {
  applyIndustryOverlay,
  identityUnchanged,
} from "@/intelligence-models/apply-overlay";

export {
  EXECUTIVE_INTELLIGENCE_MODELS,
  PERMANENT_COUNCIL_ROLE_IDS,
  getExecutiveIntelligenceModel,
  CEO_INTELLIGENCE_MODEL,
  CFO_INTELLIGENCE_MODEL,
  COO_INTELLIGENCE_MODEL,
  CRO_INTELLIGENCE_MODEL,
  CSO_INTELLIGENCE_MODEL,
  CCO_INTELLIGENCE_MODEL,
  CIO_INTELLIGENCE_MODEL,
  CTO_INTELLIGENCE_MODEL,
  CPO_INTELLIGENCE_MODEL,
  CRISK_INTELLIGENCE_MODEL,
} from "@/intelligence-models/roles";

export {
  ALL_INDUSTRY_OVERLAYS,
  MANUFACTURING_OVERLAYS,
  MINING_OVERLAYS,
  UTILITIES_OVERLAYS,
  HEALTHCARE_OVERLAYS,
  FIELD_SERVICES_OVERLAYS,
  TECHNOLOGY_OVERLAYS,
  getIndustryOverlay,
  listOverlaysForIndustry,
} from "@/intelligence-models/overlays";

export { resolveExecutiveIntelligence } from "@/intelligence-models/resolve";

export {
  toPackCouncilKnowledge,
  packCouncilKnowledgeFromModels,
} from "@/intelligence-models/bridge-pack";

export { reviewExecutiveIntelligenceModels } from "@/intelligence-models/self-review";
export type { EimSelfReview } from "@/intelligence-models/self-review";
