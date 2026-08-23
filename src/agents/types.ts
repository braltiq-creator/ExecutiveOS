/**
 * Executive Council — specialised executive reasoning agents.
 * Not a chatbot. No invented facts. No LLM dependency.
 */

import type { ConfidenceScore } from "@/intelligence/executive-intelligence/types";

/** Permanent Executive Council — exactly five seats. */
export const COUNCIL_AGENT_IDS = [
  "ceo",
  "cfo",
  "coo",
  "cro",
  "cso",
] as const;

export type CouncilAgentId = (typeof COUNCIL_AGENT_IDS)[number];

/**
 * Specialty / legacy lenses — not Council seats.
 * Domain Advisors remain separate; these must never appear in Council briefs.
 */
export const SPECIALTY_AGENT_IDS = [
  "chief_of_staff",
  "chief_risk_officer",
  "chief_people_officer",
  "chief_customer_officer",
] as const;

export type SpecialtyAgentId = (typeof SPECIALTY_AGENT_IDS)[number];

export type RegisteredAgentId = CouncilAgentId | SpecialtyAgentId;

export type AgentStance =
  | "proceed"
  | "delay"
  | "investigate"
  | "escalate"
  | "delegate"
  | "watch"
  | "challenge";

export type AgentSignal = {
  id: string;
  label: string;
  severity: "critical" | "high" | "moderate" | "low";
  evidence: string[];
  relatedEntityIds: string[];
};

export type AgentRecommendation = {
  id: string;
  stance: AgentStance;
  title: string;
  rationale: string;
  evidence: string[];
  relatedDecisionIds: string[];
  relatedOutcomeIds: string[];
};

export type AgentChallenge = {
  id: string;
  target: string;
  challenge: string;
  evidence: string[];
};

export type AgentReview = {
  agentId: RegisteredAgentId;
  asOf: string;
  summary: string;
  priorities: string[];
  recommendations: AgentRecommendation[];
  challenges: AgentChallenge[];
  risks: AgentSignal[];
  opportunities: AgentSignal[];
  confidence: ConfidenceScore;
  reasoning: string[];
  /** Systems / artefacts consulted — never invented */
  sources: string[];
};

export type CouncilConflict = {
  id: string;
  topic: string;
  relatedDecisionId?: string;
  positions: Array<{
    agentId: CouncilAgentId;
    agentTitle: string;
    stance: AgentStance;
    statement: string;
  }>;
  /** CEO facilitation note — not a resolution */
  facilitation: string;
};

export type CouncilPerspective = {
  agentId: CouncilAgentId;
  title: string;
  shortTitle: string;
  focusAreas: string[];
  review: AgentReview;
};

export type ExecutiveCouncilBrief = {
  asOf: string;
  /** One-line council framing — not a single recommendation */
  framing: string;
  perspectives: CouncilPerspective[];
  conflicts: CouncilConflict[];
  /** Attention sequencing from CEO synthesis */
  decisionSequence: string[];
  closingNote: string;
};

/** Presentation model for Today */
export type CouncilPerspectiveView = {
  agentId: CouncilAgentId;
  title: string;
  shortTitle: string;
  summary: string;
  stanceLabel: string;
  priorities: string[];
  recommendations: string[];
  challenges: string[];
  risks: string[];
  opportunities: string[];
  confidence: number;
  reasoning: string[];
};

export type ExecutiveCouncilView = {
  framing: string;
  perspectives: CouncilPerspectiveView[];
  conflicts: Array<{
    topic: string;
    positions: Array<{ agent: string; stance: string; statement: string }>;
    facilitation: string;
  }>;
  decisionSequence: string[];
  closingNote: string;
};
