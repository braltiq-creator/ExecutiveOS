/**
 * Executive Intelligence Models (EIM) — Phase 50
 *
 * Behavioural reasoning models for executives.
 * Research (EIRL) explains how executives think.
 * Models explain how executives reason.
 * Packs supply industry context — they do not redefine behaviour.
 *
 * Not Core. Not product UI. Not industry packs.
 */

export type EimSemVer = {
  major: number;
  minor: number;
  patch: number;
};

/** Broader than today's permanent Council — future Council expansion inherits these. */
export type ExecutiveIntelligenceRoleId =
  | "ceo"
  | "cfo"
  | "coo"
  | "cro"
  | "cso"
  | "cco"
  | "cio"
  | "cto"
  | "cpo"
  | "crisk";

export type IndustryOverlayId =
  | "manufacturing"
  | "mining"
  | "utilities"
  | "healthcare"
  | "construction"
  | "government"
  | "professional_services"
  | "technology"
  | "financial_services"
  | "retail"
  | "logistics"
  | "field_services"
  | "generic";

/** 1. Observation — what is continuously monitored */
export type ObservationModel = {
  monitors: string[];
  leadingIndicators: string[];
  laggingIndicators: string[];
  earlyWarningSignals: string[];
  escalationTriggers: string[];
};

/** 2. Diagnosis — how conditions are interpreted */
export type DiagnosisModel = {
  rootCauseLenses: string[];
  patternLibrary: string[];
  dependencyChecks: string[];
  tradeOffDimensions: string[];
  interpretationPrinciples: string[];
};

/** 3. Challenge — questions before supporting a recommendation */
export type ChallengeModel = {
  challengeQuestions: string[];
  alternativeExplanations: string[];
  evidenceThresholds: string[];
  confidenceRequirements: string[];
  biasesToCounter: string[];
};

/** 4. Recommendation — typical response posture */
export type RecommendationModel = {
  responseOptions: string[];
  riskAssessmentLens: string[];
  businessImpactLens: string[];
  outcomeAlignmentTests: string[];
  decisionCriteria: string[];
};

/** 5. Communication — how recommendations are explained */
export type CommunicationModel = {
  tone: string;
  structure: string[];
  escalationStyle: string;
  boardCommunication: string[];
  peerCommunication: string[];
};

/** 6. Learning — prediction → variance → refinement */
export type LearningModel = {
  predictionFocus: string[];
  outcomeMeasures: string[];
  varianceQuestions: string[];
  lessonCapture: string[];
  confidenceAdjustmentRules: string[];
  behaviourRefinements: string[];
};

/** 7. Council interaction — allies, challengers, conflict */
export type CouncilInteractionModel = {
  naturalAllies: ExecutiveIntelligenceRoleId[];
  naturalChallengers: ExecutiveIntelligenceRoleId[];
  typicalDisagreements: Array<{
    withRole: ExecutiveIntelligenceRoleId;
    pattern: string;
  }>;
  consensusBehaviours: string[];
  conflictResolutionPatterns: string[];
};

/**
 * Role identity — stable across industries.
 * Describes behaviour thesis, not a job description.
 */
export type ExecutiveIdentity = {
  roleId: ExecutiveIntelligenceRoleId;
  title: string;
  shortTitle: string;
  /** One-sentence behavioural thesis */
  behaviouralThesis: string;
  /** Stable reasoning purpose — industry-independent */
  reasoningPurpose: string;
  /** Mental models that persist across industries */
  durableMentalModels: string[];
};

export type ExecutiveIntelligenceModel = {
  readonly version: EimSemVer;
  readonly versionLabel: string;
  readonly identity: ExecutiveIdentity;
  readonly observation: ObservationModel;
  readonly diagnosis: DiagnosisModel;
  readonly challenge: ChallengeModel;
  readonly recommendation: RecommendationModel;
  readonly communication: CommunicationModel;
  readonly learning: LearningModel;
  readonly councilInteraction: CouncilInteractionModel;
  /** Paths into EIRL research docs */
  readonly researchRefs: string[];
};

/**
 * Industry overlay — modifies observations, priorities, thresholds.
 * Never rewrites identity or durable mental models.
 */
export type IndustryBehaviourOverlay = {
  industry: IndustryOverlayId;
  roleId: ExecutiveIntelligenceRoleId;
  /** Additional or emphasised monitors */
  observationAdds?: Partial<ObservationModel>;
  /** Diagnosis emphasis without replacing core lenses */
  diagnosisAdds?: Partial<DiagnosisModel>;
  /** Extra challenge questions / thresholds */
  challengeAdds?: Partial<ChallengeModel>;
  /** Industry-typical response options / criteria */
  recommendationAdds?: Partial<RecommendationModel>;
  /** Communication nuances */
  communicationAdds?: Partial<
    Pick<
      CommunicationModel,
      "boardCommunication" | "peerCommunication" | "escalationStyle"
    >
  >;
  /** Learning emphasis */
  learningAdds?: Partial<LearningModel>;
  /** Priority shifts — ordered emphasis, does not change identity */
  priorityEmphasis?: string[];
  /** Threshold / trigger language specific to industry */
  thresholdOverrides?: string[];
};

/** Model after overlay application — identity preserved. */
export type ResolvedExecutiveIntelligenceModel = ExecutiveIntelligenceModel & {
  industry: IndustryOverlayId | null;
  priorityEmphasis: string[];
  thresholdOverrides: string[];
  overlayApplied: boolean;
};
