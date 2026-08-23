/**
 * Executive Domain Advisor Framework — Phase 52A
 *
 * Specialist domain experts that advise the Executive Council.
 * They are NOT Council members. Permanent Council remains:
 * CEO · CFO · COO · CRO · CSO
 *
 * Activated by Industry Intelligence Packs (industry label).
 * Not Core. Not Council redesign. Not chat advisors (`src/lib/agents`).
 *
 * Design philosophy inherits Executive Intelligence Models (EIM):
 * observation → diagnosis → challenge → recommendation → learning → explainability
 */

import type { IndustryOverlayId } from "@/intelligence-models/types";

/** Permanent Council only — Domain Advisors never join this set. */
export type PermanentCouncilRoleId = "ceo" | "cfo" | "coo" | "cro" | "cso";

export type DomainAdvisorIndustryId = Exclude<IndustryOverlayId, "generic">;

export type DomainAdvisorSemVer = {
  major: number;
  minor: number;
  patch: number;
};

/** Advisor identity — specialist, not executive seat. */
export type DomainAdvisorIdentity = {
  id: string;
  name: string;
  industry: DomainAdvisorIndustryId;
  title: string;
  /** Why this advisor exists for the Council */
  purpose: string;
  expertise: string[];
  /** EIM-aligned behavioural thesis — how the specialist reasons */
  behaviouralThesis: string;
};

export type DomainObservationModel = {
  monitors: string[];
  leadingIndicators: string[];
  laggingIndicators: string[];
  earlyWarningSignals: string[];
  escalationTriggers: string[];
};

export type DomainDiagnosisModel = {
  rootCauseLenses: string[];
  patternLibrary: string[];
  dependencyChecks: string[];
  tradeOffDimensions: string[];
  interpretationPrinciples: string[];
};

export type DomainChallengeModel = {
  challengeQuestions: string[];
  alternativeExplanations: string[];
  evidenceThresholds: string[];
  confidenceRequirements: string[];
  biasesToCounter: string[];
};

export type DomainRecommendationStyle = {
  posture: string;
  responseOptions: string[];
  riskAssessmentLens: string[];
  businessImpactLens: string[];
  outcomeAlignmentTests: string[];
  decisionCriteria: string[];
};

export type DomainConfidenceModel = {
  confidenceDrivers: string[];
  uncertaintySources: string[];
  calibrationRules: string[];
  withholdWhen: string[];
};

export type DomainEvidenceSource = {
  id: string;
  label: string;
  kind: "system_of_record" | "operating_signal" | "human_input" | "derived";
  notes?: string;
};

/** How this advisor informs each permanent Council role — never replaces them. */
export type ExecutiveRelationshipMap = Record<PermanentCouncilRoleId, string>;

export type DomainLearningModel = {
  predictionFocus: string[];
  outcomeMeasures: string[];
  varianceQuestions: string[];
  lessonCapture: string[];
  confidenceAdjustmentRules: string[];
};

export type DomainIndustryOverlay = {
  industry: DomainAdvisorIndustryId;
  vocabulary: string[];
  contextNotes: string[];
};

export type DomainExplainabilityModel = {
  alwaysDisclose: string[];
  evidencePresentation: string[];
  dissentHandling: string[];
  humanAuthorityStatement: string;
};

/**
 * Full Executive Domain Advisor — specialist contribution before Council recommendation.
 */
export type ExecutiveDomainAdvisor = {
  version: DomainAdvisorSemVer;
  versionLabel: string;
  identity: DomainAdvisorIdentity;
  mission: string;
  primaryDecisions: string[];
  continuousObservations: string[];
  leadingIndicators: string[];
  laggingIndicators: string[];
  questionsAsked: string[];
  executiveInteractions: string[];
  escalationTriggers: string[];
  typicalRecommendations: string[];
  observation: DomainObservationModel;
  diagnosis: DomainDiagnosisModel;
  challenge: DomainChallengeModel;
  recommendationStyle: DomainRecommendationStyle;
  confidence: DomainConfidenceModel;
  evidenceSources: DomainEvidenceSource[];
  executiveRelationships: ExecutiveRelationshipMap;
  learning: DomainLearningModel;
  industryOverlay: DomainIndustryOverlay;
  explainability: DomainExplainabilityModel;
  researchRefs: string[];
};

/**
 * Catalogue entry — industries without a full Phase-52 pack ship catalogues first.
 * Expandable later into ExecutiveDomainAdvisor without Core changes.
 */
export type DomainAdvisorCatalogueEntry = {
  id: string;
  name: string;
  industry: DomainAdvisorIndustryId;
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
};

export type DomainAdvisorCatalogue = {
  industry: DomainAdvisorIndustryId;
  packAffinity: string;
  description: string;
  /** Advisor IDs in recommended activation order */
  advisorIds: string[];
  entries: DomainAdvisorCatalogueEntry[];
};
