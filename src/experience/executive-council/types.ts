import type { CouncilRoleId } from "@/experience/executive-council/members";

export type CouncilPosition =
  | "approve"
  | "approve_with_conditions"
  | "defer"
  | "reject"
  | "watch";

export type CouncilOpinion = {
  roleId: CouncilRoleId;
  title: string;
  shortTitle: string;
  position: CouncilPosition;
  positionLabel: string;
  reasoning: string;
  businessImpact: string;
  confidence: number;
  keyRisks: string[];
  suggestedAction: string;
};

export type CouncilConsensus = {
  recommendation: string;
  agreementLevel: string;
  agreementPct: number;
  confidence: number;
  consensusAreas: string[];
  disagreementAreas: string[];
  tradeOffs: string[];
  recommendedDecision: string;
};

export type CouncilLearning = {
  originalRecommendation: string;
  decisionTaken: string;
  predictedOutcome: string;
  actualOutcome: string;
  learning: string;
  confidenceBefore: number;
  confidenceAfter: number;
  confidenceAdjustment: string;
};

export type CouncilBrief = {
  headline: string;
  agreementLabel: string;
  confidence: number;
  focusRole: string;
};

export type ObservationUrgency = "today" | "this_week" | "watch";

export type CouncilObservation = {
  id: string;
  roleId: CouncilRoleId;
  raisedBy: string;
  headline: string;
  reasoning: string;
  businessImpact: string;
  confidence: number;
  urgency: ObservationUrgency;
  urgencyLabel: string;
  recommendedNextStep: string;
  linkedOutcome: string;
  linkedOutcomeId: string | null;
  linkedDecision: string;
  linkedDecisionHref: string;
  rankScore: number;
  discussionHref: string;
};

export type CollaborationStance =
  | "agree"
  | "disagree"
  | "support"
  | "challenge"
  | "extend"
  | "refine";

export type CouncilCollaboration = {
  id: string;
  fromRoleId: CouncilRoleId;
  fromShortTitle: string;
  toRoleId: CouncilRoleId;
  toShortTitle: string;
  stance: CollaborationStance;
  stanceLabel: string;
  note: string;
  observationId: string;
};

export type AgencyConsensus = {
  consensus: string;
  agreementAreas: string[];
  disagreementAreas: string[];
  tradeOffs: string[];
  remainingUncertainty: string;
  recommendedJudgement: string;
  confidence: number;
};

export type CouncilDiscussionLearning = {
  initialObservations: string[];
  discussion: string[];
  finalRecommendation: string;
  decisionTaken: string;
  predictedOutcome: string;
  actualOutcome: string;
  learning: string;
  confidenceAdjustment: string;
};

export type ExecutiveAgencyView = {
  observations: CouncilObservation[];
  /** Highest-priority only — for Today Executive Brief. */
  briefingObservations: CouncilObservation[];
  collaborations: CouncilCollaboration[];
  agencyConsensus: AgencyConsensus;
  discussionLearning: CouncilDiscussionLearning | null;
};

export type ExecutiveCouncilView = {
  opinions: CouncilOpinion[];
  consensus: CouncilConsensus;
  learning: CouncilLearning | null;
  brief: CouncilBrief;
  decisionTitle: string;
  outcomeName: string;
  agency: ExecutiveAgencyView;
};
