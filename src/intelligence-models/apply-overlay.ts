/**
 * Apply industry overlays without rewriting executive identity.
 */

import type {
  ExecutiveIntelligenceModel,
  IndustryBehaviourOverlay,
  ObservationModel,
  DiagnosisModel,
  ChallengeModel,
  RecommendationModel,
  LearningModel,
  ResolvedExecutiveIntelligenceModel,
  IndustryOverlayId,
} from "@/intelligence-models/types";

function mergeStringLists(
  base: string[],
  adds: string[] | undefined,
): string[] {
  if (!adds?.length) return [...base];
  return [...new Set([...base, ...adds])];
}

function mergeObservation(
  base: ObservationModel,
  adds?: Partial<ObservationModel>,
): ObservationModel {
  if (!adds) return { ...base, monitors: [...base.monitors] };
  return {
    monitors: mergeStringLists(base.monitors, adds.monitors),
    leadingIndicators: mergeStringLists(
      base.leadingIndicators,
      adds.leadingIndicators,
    ),
    laggingIndicators: mergeStringLists(
      base.laggingIndicators,
      adds.laggingIndicators,
    ),
    earlyWarningSignals: mergeStringLists(
      base.earlyWarningSignals,
      adds.earlyWarningSignals,
    ),
    escalationTriggers: mergeStringLists(
      base.escalationTriggers,
      adds.escalationTriggers,
    ),
  };
}

function mergeDiagnosis(
  base: DiagnosisModel,
  adds?: Partial<DiagnosisModel>,
): DiagnosisModel {
  if (!adds) return { ...base, rootCauseLenses: [...base.rootCauseLenses] };
  return {
    rootCauseLenses: mergeStringLists(base.rootCauseLenses, adds.rootCauseLenses),
    patternLibrary: mergeStringLists(base.patternLibrary, adds.patternLibrary),
    dependencyChecks: mergeStringLists(
      base.dependencyChecks,
      adds.dependencyChecks,
    ),
    tradeOffDimensions: mergeStringLists(
      base.tradeOffDimensions,
      adds.tradeOffDimensions,
    ),
    interpretationPrinciples: mergeStringLists(
      base.interpretationPrinciples,
      adds.interpretationPrinciples,
    ),
  };
}

function mergeChallenge(
  base: ChallengeModel,
  adds?: Partial<ChallengeModel>,
): ChallengeModel {
  if (!adds) return { ...base, challengeQuestions: [...base.challengeQuestions] };
  return {
    challengeQuestions: mergeStringLists(
      base.challengeQuestions,
      adds.challengeQuestions,
    ),
    alternativeExplanations: mergeStringLists(
      base.alternativeExplanations,
      adds.alternativeExplanations,
    ),
    evidenceThresholds: mergeStringLists(
      base.evidenceThresholds,
      adds.evidenceThresholds,
    ),
    confidenceRequirements: mergeStringLists(
      base.confidenceRequirements,
      adds.confidenceRequirements,
    ),
    biasesToCounter: mergeStringLists(base.biasesToCounter, adds.biasesToCounter),
  };
}

function mergeRecommendation(
  base: RecommendationModel,
  adds?: Partial<RecommendationModel>,
): RecommendationModel {
  if (!adds) return { ...base, responseOptions: [...base.responseOptions] };
  return {
    responseOptions: mergeStringLists(base.responseOptions, adds.responseOptions),
    riskAssessmentLens: mergeStringLists(
      base.riskAssessmentLens,
      adds.riskAssessmentLens,
    ),
    businessImpactLens: mergeStringLists(
      base.businessImpactLens,
      adds.businessImpactLens,
    ),
    outcomeAlignmentTests: mergeStringLists(
      base.outcomeAlignmentTests,
      adds.outcomeAlignmentTests,
    ),
    decisionCriteria: mergeStringLists(
      base.decisionCriteria,
      adds.decisionCriteria,
    ),
  };
}

function mergeLearning(
  base: LearningModel,
  adds?: Partial<LearningModel>,
): LearningModel {
  if (!adds) return { ...base, predictionFocus: [...base.predictionFocus] };
  return {
    predictionFocus: mergeStringLists(base.predictionFocus, adds.predictionFocus),
    outcomeMeasures: mergeStringLists(base.outcomeMeasures, adds.outcomeMeasures),
    varianceQuestions: mergeStringLists(
      base.varianceQuestions,
      adds.varianceQuestions,
    ),
    lessonCapture: mergeStringLists(base.lessonCapture, adds.lessonCapture),
    confidenceAdjustmentRules: mergeStringLists(
      base.confidenceAdjustmentRules,
      adds.confidenceAdjustmentRules,
    ),
    behaviourRefinements: mergeStringLists(
      base.behaviourRefinements,
      adds.behaviourRefinements,
    ),
  };
}

/**
 * Resolve a role model with optional industry overlay.
 * Identity and durable mental models are never mutated.
 */
export function applyIndustryOverlay(
  model: ExecutiveIntelligenceModel,
  overlay: IndustryBehaviourOverlay | null | undefined,
  industry: IndustryOverlayId | null = overlay?.industry ?? null,
): ResolvedExecutiveIntelligenceModel {
  if (!overlay) {
    return {
      ...model,
      identity: { ...model.identity },
      industry,
      priorityEmphasis: [],
      thresholdOverrides: [],
      overlayApplied: false,
    };
  }

  if (overlay.roleId !== model.identity.roleId) {
    throw new Error(
      `Overlay role ${overlay.roleId} does not match model ${model.identity.roleId}`,
    );
  }

  return {
    version: model.version,
    versionLabel: model.versionLabel,
    // Identity frozen — industry cannot rewrite who the executive is
    identity: {
      ...model.identity,
      durableMentalModels: [...model.identity.durableMentalModels],
    },
    observation: mergeObservation(model.observation, overlay.observationAdds),
    diagnosis: mergeDiagnosis(model.diagnosis, overlay.diagnosisAdds),
    challenge: mergeChallenge(model.challenge, overlay.challengeAdds),
    recommendation: mergeRecommendation(
      model.recommendation,
      overlay.recommendationAdds,
    ),
    communication: {
      ...model.communication,
      structure: [...model.communication.structure],
      boardCommunication: mergeStringLists(
        model.communication.boardCommunication,
        overlay.communicationAdds?.boardCommunication,
      ),
      peerCommunication: mergeStringLists(
        model.communication.peerCommunication,
        overlay.communicationAdds?.peerCommunication,
      ),
      escalationStyle:
        overlay.communicationAdds?.escalationStyle ??
        model.communication.escalationStyle,
    },
    learning: mergeLearning(model.learning, overlay.learningAdds),
    councilInteraction: {
      ...model.councilInteraction,
      naturalAllies: [...model.councilInteraction.naturalAllies],
      naturalChallengers: [...model.councilInteraction.naturalChallengers],
      typicalDisagreements: model.councilInteraction.typicalDisagreements.map(
        (item) => ({ ...item }),
      ),
      consensusBehaviours: [...model.councilInteraction.consensusBehaviours],
      conflictResolutionPatterns: [
        ...model.councilInteraction.conflictResolutionPatterns,
      ],
    },
    researchRefs: [...model.researchRefs],
    industry: industry ?? overlay.industry,
    priorityEmphasis: overlay.priorityEmphasis ?? [],
    thresholdOverrides: overlay.thresholdOverrides ?? [],
    overlayApplied: true,
  };
}

/** Prove identity invariance after overlay. */
export function identityUnchanged(
  base: ExecutiveIntelligenceModel,
  resolved: ResolvedExecutiveIntelligenceModel,
): boolean {
  return (
    base.identity.roleId === resolved.identity.roleId &&
    base.identity.behaviouralThesis === resolved.identity.behaviouralThesis &&
    base.identity.reasoningPurpose === resolved.identity.reasoningPurpose &&
    base.identity.durableMentalModels.join("|") ===
      resolved.identity.durableMentalModels.join("|")
  );
}
