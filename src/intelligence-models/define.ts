/**
 * Define and validate Executive Intelligence Models.
 */

import type {
  ExecutiveIntelligenceModel,
  EimSemVer,
  ExecutiveIdentity,
  ObservationModel,
  DiagnosisModel,
  ChallengeModel,
  RecommendationModel,
  CommunicationModel,
  LearningModel,
  CouncilInteractionModel,
} from "@/intelligence-models/types";

export type DefineExecutiveIntelligenceModelInput = {
  version?: EimSemVer;
  identity: ExecutiveIdentity;
  observation: ObservationModel;
  diagnosis: DiagnosisModel;
  challenge: ChallengeModel;
  recommendation: RecommendationModel;
  communication: CommunicationModel;
  learning: LearningModel;
  councilInteraction: CouncilInteractionModel;
  researchRefs: string[];
};

function versionLabel(version: EimSemVer): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

export function defineExecutiveIntelligenceModel(
  input: DefineExecutiveIntelligenceModelInput,
): ExecutiveIntelligenceModel {
  const version = input.version ?? { major: 1, minor: 0, patch: 0 };
  return {
    version,
    versionLabel: versionLabel(version),
    identity: input.identity,
    observation: input.observation,
    diagnosis: input.diagnosis,
    challenge: input.challenge,
    recommendation: input.recommendation,
    communication: input.communication,
    learning: input.learning,
    councilInteraction: input.councilInteraction,
    researchRefs: input.researchRefs,
  };
}

/**
 * Structural validation — behaviour completeness, not job-description checks.
 */
export function validateExecutiveIntelligenceModel(
  model: ExecutiveIntelligenceModel,
): { ok: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!model.identity.behaviouralThesis) {
    errors.push("identity.behaviouralThesis required");
  }
  if (!model.identity.reasoningPurpose) {
    errors.push("identity.reasoningPurpose required");
  }
  if (model.identity.durableMentalModels.length === 0) {
    errors.push("durableMentalModels must not be empty");
  }

  const sections: Array<[string, string[]]> = [
    ["observation.monitors", model.observation.monitors],
    ["observation.escalationTriggers", model.observation.escalationTriggers],
    ["diagnosis.rootCauseLenses", model.diagnosis.rootCauseLenses],
    ["diagnosis.tradeOffDimensions", model.diagnosis.tradeOffDimensions],
    ["challenge.challengeQuestions", model.challenge.challengeQuestions],
    ["challenge.biasesToCounter", model.challenge.biasesToCounter],
    ["recommendation.responseOptions", model.recommendation.responseOptions],
    ["recommendation.decisionCriteria", model.recommendation.decisionCriteria],
    ["communication.structure", model.communication.structure],
    ["learning.confidenceAdjustmentRules", model.learning.confidenceAdjustmentRules],
    [
      "councilInteraction.consensusBehaviours",
      model.councilInteraction.consensusBehaviours,
    ],
  ];

  for (const [label, values] of sections) {
    if (values.length === 0) errors.push(`${label} must not be empty`);
  }

  // Behaviour smell: responsibility-language without reasoning verbs
  const thesis = model.identity.behaviouralThesis.toLowerCase();
  if (
    thesis.includes("responsible for") &&
    !thesis.includes("reason") &&
    !thesis.includes("judge") &&
    !thesis.includes("protect") &&
    !thesis.includes("arbitrate")
  ) {
    warnings.push(
      "behaviouralThesis reads like a job description — prefer reasoning verbs",
    );
  }

  if (model.researchRefs.length === 0) {
    warnings.push("No EIRL researchRefs linked");
  }

  return { ok: errors.length === 0, errors, warnings };
}
