import { defineDomainAdvisor, relationships } from "@/domain-advisors/define";
import type {
  ExecutiveDomainAdvisor,
  ExecutiveRelationshipMap,
} from "@/domain-advisors/types";
import {
  MFG_CONFIDENCE,
  MFG_EVIDENCE,
  MFG_EXPLAINABILITY,
  MFG_LEARNING,
} from "@/domain-advisors/advisors/manufacturing/shared";

type MfgAdvisorInput = {
  id: string;
  name: string;
  title: string;
  purpose: string;
  expertise: string[];
  behaviouralThesis: string;
  mission: string;
  primaryDecisions: string[];
  continuousObservations: string[];
  leadingIndicators: string[];
  laggingIndicators: string[];
  questionsAsked: string[];
  executiveInteractions: string[];
  escalationTriggers: string[];
  typicalRecommendations: string[];
  executiveRelationships: ExecutiveRelationshipMap;
  rootCauseLenses: string[];
  patternLibrary: string[];
  tradeOffDimensions: string[];
  biasesToCounter: string[];
  responseOptions: string[];
  researchRefs?: string[];
};

/** Compact authoring helper — expands into full EIM-aligned advisor model. */
export function defineManufacturingAdvisor(
  input: MfgAdvisorInput,
): ExecutiveDomainAdvisor {
  return defineDomainAdvisor({
    identity: {
      id: input.id,
      name: input.name,
      industry: "manufacturing",
      title: input.title,
      purpose: input.purpose,
      expertise: input.expertise,
      behaviouralThesis: input.behaviouralThesis,
    },
    mission: input.mission,
    primaryDecisions: input.primaryDecisions,
    continuousObservations: input.continuousObservations,
    leadingIndicators: input.leadingIndicators,
    laggingIndicators: input.laggingIndicators,
    questionsAsked: input.questionsAsked,
    executiveInteractions: input.executiveInteractions,
    escalationTriggers: input.escalationTriggers,
    typicalRecommendations: input.typicalRecommendations,
    observation: {
      monitors: input.continuousObservations,
      leadingIndicators: input.leadingIndicators,
      laggingIndicators: input.laggingIndicators,
      earlyWarningSignals: input.escalationTriggers.slice(0, 3),
      escalationTriggers: input.escalationTriggers,
    },
    diagnosis: {
      rootCauseLenses: input.rootCauseLenses,
      patternLibrary: input.patternLibrary,
      dependencyChecks: [
        "Outcome linkage",
        "Capacity constraint",
        "Channel truth",
        "Working capital impact",
      ],
      tradeOffDimensions: input.tradeOffDimensions,
      interpretationPrinciples: [
        "Separate dealer aspiration from committed demand",
        "Protect enterprise outcomes over local optimisation",
        "Name capital and service trade-offs explicitly",
      ],
    },
    challenge: {
      challengeQuestions: input.questionsAsked,
      alternativeExplanations: [
        "Data lag rather than true demand shift",
        "Local gaming of allocation",
        "One-off vs structural change",
      ],
      evidenceThresholds: [
        "At least two independent signal classes",
        "Freshness within operating cadence",
      ],
      confidenceRequirements: [
        "State confidence band before recommending",
        "Disclose what would change the recommendation",
      ],
      biasesToCounter: input.biasesToCounter,
    },
    recommendationStyle: {
      posture:
        "Advise with evidence and challenge — never seat-level judgement",
      responseOptions: input.responseOptions,
      riskAssessmentLens: [
        "Service risk",
        "Excess inventory risk",
        "Supplier / capacity risk",
        "Reputation with dealers",
      ],
      businessImpactLens: [
        "Revenue timing",
        "Working capital",
        "Factory utilisation",
        "Strategic account health",
      ],
      outcomeAlignmentTests: [
        "Does this move Focus Outcomes?",
        "Does it create a later capital or capacity problem?",
      ],
      decisionCriteria: [
        "Outcome impact",
        "Evidence strength",
        "Reversibility",
        "Council trade-off visibility",
      ],
    },
    confidence: MFG_CONFIDENCE,
    evidenceSources: MFG_EVIDENCE,
    executiveRelationships: relationships(input.executiveRelationships),
    learning: MFG_LEARNING,
    industryOverlay: {
      industry: "manufacturing",
      vocabulary: [
        "Build slot",
        "Order bank",
        "Dealer allocation",
        "Model / variant mix",
        "Factory capacity",
        "Working capital",
      ],
      contextNotes: [
        "Dealer demand is not B2B SaaS pipeline",
        "Pack context only — Core unchanged",
      ],
    },
    explainability: MFG_EXPLAINABILITY,
    researchRefs: input.researchRefs ?? [
      "docs/intelligence-packs/manufacturing/",
      "docs/research/industries/",
    ],
  });
}
