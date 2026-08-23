import { defineIntelligencePack } from "@/intelligence-packs/define";
import type { ExecutiveIntelligencePack } from "@/intelligence-packs/contract";
import { MANUFACTURING_OUTCOMES } from "@/intelligence-packs/packs/manufacturing/catalog/outcomes";
import { MANUFACTURING_ONTOLOGY } from "@/intelligence-packs/packs/manufacturing/catalog/ontology";
import { MANUFACTURING_KPIS } from "@/intelligence-packs/packs/manufacturing/catalog/kpis";
import { MANUFACTURING_COUNCIL } from "@/intelligence-packs/packs/manufacturing/catalog/council";
import { MANUFACTURING_EVENTS } from "@/intelligence-packs/packs/manufacturing/catalog/events";
import { MANUFACTURING_FRAMEWORKS } from "@/intelligence-packs/packs/manufacturing/catalog/frameworks";
import { MANUFACTURING_REASONING_RULES } from "@/intelligence-packs/packs/manufacturing/catalog/reasoning";
import { MANUFACTURING_BENCHMARKS } from "@/intelligence-packs/packs/manufacturing/catalog/benchmarks";
import { MANUFACTURING_MEETING_PACKS } from "@/intelligence-packs/packs/manufacturing/catalog/meeting-packs";
import {
  MANUFACTURING_RECOMMENDATIONS,
  MANUFACTURING_REPORTS,
} from "@/intelligence-packs/packs/manufacturing/catalog/reports-recommendations";
import {
  MANUFACTURING_LEARNING_RULES,
  MANUFACTURING_VALIDATION_RULES,
} from "@/intelligence-packs/packs/manufacturing/catalog/validation-learning";
import { buildManufacturingRealityLab } from "@/intelligence-packs/packs/manufacturing/reality-lab/scenarios";
import {
  MANUFACTURING_INDUSTRY,
  MANUFACTURING_PACK_ID,
} from "@/intelligence-packs/packs/manufacturing/constants";
import { MANUFACTURING_SUPPORTED_CONNECTORS } from "@/intelligence-packs/packs/manufacturing/providers/dynamics";

/** Authoritative factory for the Manufacturing Executive Intelligence Pack. */
export function createManufacturingExecutivePack(): ExecutiveIntelligencePack {
  return defineIntelligencePack({
    id: MANUFACTURING_PACK_ID,
    name: "Manufacturing Executive Intelligence Pack",
    industry: MANUFACTURING_INDUSTRY,
    description:
      "Executive intelligence for heavy equipment manufacturers, industrial distributors, and OEMs — demand, factory planning, inventory, dealers, supply resilience, working capital, mix, and capacity. Industry context only.",
    version: { major: 1, minor: 0, patch: 0 },
    author: "ExecutiveOS",
    provides: [
      "outcomes",
      "ontology",
      "kpis",
      "council",
      "reality-lab",
      "benchmarks",
      "meeting-packs",
      "reasoning",
      "validation",
      "learning",
      "recommendations",
      "reports",
      "dynamics-ready",
      "domain-advisors",
    ],
    outcomes: MANUFACTURING_OUTCOMES,
    ontology: MANUFACTURING_ONTOLOGY,
    kpis: MANUFACTURING_KPIS,
    councilKnowledge: MANUFACTURING_COUNCIL,
    decisionFrameworks: MANUFACTURING_FRAMEWORKS,
    reasoningRules: MANUFACTURING_REASONING_RULES,
    benchmarks: MANUFACTURING_BENCHMARKS,
    businessEvents: MANUFACTURING_EVENTS,
    realityLab: buildManufacturingRealityLab(),
    meetingPacks: MANUFACTURING_MEETING_PACKS,
    reports: MANUFACTURING_REPORTS,
    recommendations: MANUFACTURING_RECOMMENDATIONS,
    validationRules: MANUFACTURING_VALIDATION_RULES,
    learningRules: MANUFACTURING_LEARNING_RULES,
    supportedConnectors: [...MANUFACTURING_SUPPORTED_CONNECTORS],
  });
}
