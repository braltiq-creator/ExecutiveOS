import type { ChatMessage, ConversationTurn } from "@/lib/ai/types";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

export const AGENT_IDS = [
  "chief_of_staff",
  "strategy_advisor",
  "board_advisor",
  "financial_advisor",
  "sales_advisor",
  "operations_advisor",
  "people_advisor",
  "risk_advisor",
  "execution_advisor",
  "communications_advisor",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export const KNOWLEDGE_DOMAINS = [
  "executive_memory",
  "knowledge_graph",
  "health_engine",
  "calendar",
  "organization",
  "meetings",
  "initiatives",
  "decisions",
  "objectives",
  "integrations",
] as const;

export type KnowledgeDomain = (typeof KNOWLEDGE_DOMAINS)[number];

export type AgentDefinition = {
  id: AgentId;
  name: string;
  title: string;
  description: string;
  expertise: string[];
  keywords: string[];
  knowledgeDomains: KnowledgeDomain[];
  accentColor: string;
};

export type AgentPreparedContext = {
  agentId: AgentId;
  displayName: string;
  executivePrompt: string;
  focusSections: string[];
  domainData: Record<string, string>;
};

export type AgentKnowledge = {
  agentId: AgentId;
  sources: string[];
  excerpts: string[];
  graphHighlights: string[];
};

export type AgentReasoning = {
  agentId: AgentId;
  analysis: string;
};

export type AgentRecommendation = {
  agentId: AgentId;
  recommendation: string;
  priority: "high" | "medium" | "low";
  actions: string[];
};

export type AgentSummary = {
  agentId: AgentId;
  headline: string;
  bullets: string[];
};

export type AgentCycleInput = {
  question: string;
  intelligence: ExecutiveIntelligenceResult;
  priorSummaries: AgentContribution[];
  history: ConversationTurn[];
};

export type AgentContribution = {
  agentId: AgentId;
  agentName: string;
  reasoning: AgentReasoning;
  recommendation: AgentRecommendation;
  summary: AgentSummary;
};

export type OrchestrationMode = "single" | "collaborative";

export type OrchestrationPlan = {
  mode: OrchestrationMode;
  primaryAgentId: AgentId;
  agentSequence: AgentId[];
  rationale: string;
};

export type OrchestrationResult = {
  plan: OrchestrationPlan;
  contributions: AgentContribution[];
  unifiedRecommendation: string;
  reasoningSummary: string;
};

export type AdvisorRequest = {
  message: string;
  history: ConversationTurn[];
  preferredAgentId?: AgentId;
};

export type AdvisorResponse = {
  message: ChatMessage;
  plan: OrchestrationPlan;
  contributions: AgentContribution[];
  reasoningSummary: string;
};

export type AdvisorError = {
  error: string;
};

export type AdvisorConsultResponse = AdvisorResponse | AdvisorError;

export type AdvisorsPageData = {
  agents: AgentDefinition[];
  preferredName: string;
};

export type AdvisorConversationState = {
  messages: ChatMessage[];
  lastPlan: OrchestrationPlan | null;
  lastContributions: AgentContribution[];
  lastReasoningSummary: string | null;
};

export interface ExecutiveAgentContract {
  readonly definition: AgentDefinition;
  prepareContext(intelligence: ExecutiveIntelligenceResult): AgentPreparedContext;
  retrieveKnowledge(
    prepared: AgentPreparedContext,
    intelligence: ExecutiveIntelligenceResult,
  ): Promise<AgentKnowledge>;
  reason(input: AgentCycleInput, prepared: AgentPreparedContext, knowledge: AgentKnowledge): Promise<AgentReasoning>;
  recommend(
    input: AgentCycleInput,
    prepared: AgentPreparedContext,
    knowledge: AgentKnowledge,
    reasoning: AgentReasoning,
  ): Promise<AgentRecommendation>;
  summarize(
    reasoning: AgentReasoning,
    recommendation: AgentRecommendation,
  ): AgentSummary;
}

export class AgentServiceError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AgentServiceError";
    this.code = code;
  }
}

export function isAdvisorError(
  response: AdvisorConsultResponse,
): response is AdvisorError {
  return "error" in response;
}
