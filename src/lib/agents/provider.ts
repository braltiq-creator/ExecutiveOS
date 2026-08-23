import { AI_DEFAULTS, getChiefOfStaffModel } from "@/lib/ai/models";
import { getAIProvider } from "@/lib/ai/provider";
import {
  buildAgentRolePrompt,
  buildReasoningPrompt,
  buildRecommendationPrompt,
} from "@/lib/agents/prompts";
import { prepareAgentContext } from "@/lib/agents/context";
import { retrieveAgentKnowledge } from "@/lib/agents/memory";
import { getAgentDefinition } from "@/lib/agents/registry";
import type {
  AgentCycleInput,
  AgentKnowledge,
  AgentPreparedContext,
  AgentReasoning,
  AgentRecommendation,
  AgentSummary,
  ExecutiveAgentContract,
} from "@/lib/agents/types";
import { AGENT_IDS } from "@/lib/agents/types";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

function parseRecommendationResponse(content: string): {
  priority: "high" | "medium" | "low";
  recommendation: string;
  actions: string[];
} {
  const priorityMatch = content.match(/PRIORITY:\s*(high|medium|low)/i);
  const recommendationMatch = content.match(/RECOMMENDATION:\s*([\s\S]*?)(?=ACTIONS:|$)/i);
  const actionsSection = content.split(/ACTIONS:/i)[1] ?? "";

  const actions = actionsSection
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

  const priority = (priorityMatch?.[1]?.toLowerCase() ?? "medium") as
    | "high"
    | "medium"
    | "low";

  return {
    priority,
    recommendation: recommendationMatch?.[1]?.trim() || content.trim(),
    actions: actions.length > 0 ? actions.slice(0, 5) : ["Review and act on the recommendation."],
  };
}

function buildSummaryBullets(recommendation: string, actions: string[]): string[] {
  const sentences = recommendation
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const bullets = sentences.slice(0, 2);
  if (actions[0]) {
    bullets.push(`Next: ${actions[0]}`);
  }

  return bullets.slice(0, 4);
}

export class ExecutiveAgent implements ExecutiveAgentContract {
  readonly definition;

  constructor(agentId: ExecutiveAgentContract["definition"]["id"]) {
    this.definition = getAgentDefinition(agentId);
  }

  prepareContext(intelligence: ExecutiveIntelligenceResult): AgentPreparedContext {
    return prepareAgentContext(this.definition, intelligence);
  }

  async retrieveKnowledge(
    prepared: AgentPreparedContext,
    intelligence: ExecutiveIntelligenceResult,
  ): Promise<AgentKnowledge> {
    return retrieveAgentKnowledge(this.definition, prepared, intelligence);
  }

  async reason(
    input: AgentCycleInput,
    prepared: AgentPreparedContext,
    knowledge: AgentKnowledge,
  ): Promise<AgentReasoning> {
    const rolePrompt = buildAgentRolePrompt(
      this.definition.id,
      prepared,
      knowledge,
      input.priorSummaries,
    );
    const systemPrompt = buildReasoningPrompt(
      this.definition.id,
      rolePrompt,
      input.question,
    );
    const provider = getAIProvider();

    const completion = await provider.complete({
      systemPrompt,
      messages: [{ role: "user", content: input.question }],
      model: getChiefOfStaffModel(),
      temperature: AI_DEFAULTS.temperature,
      maxTokens: 700,
    });

    return {
      agentId: this.definition.id,
      analysis: completion.content.trim(),
    };
  }

  async recommend(
    input: AgentCycleInput,
    prepared: AgentPreparedContext,
    knowledge: AgentKnowledge,
    reasoning: AgentReasoning,
  ): Promise<AgentRecommendation> {
    const rolePrompt = buildAgentRolePrompt(
      this.definition.id,
      prepared,
      knowledge,
      input.priorSummaries,
    );
    const systemPrompt = buildRecommendationPrompt(
      this.definition.id,
      rolePrompt,
      input.question,
      reasoning.analysis,
    );
    const provider = getAIProvider();

    const completion = await provider.complete({
      systemPrompt,
      messages: [{ role: "user", content: input.question }],
      model: getChiefOfStaffModel(),
      temperature: AI_DEFAULTS.temperature,
      maxTokens: 600,
    });

    const parsed = parseRecommendationResponse(completion.content);

    return {
      agentId: this.definition.id,
      recommendation: parsed.recommendation,
      priority: parsed.priority,
      actions: parsed.actions,
    };
  }

  summarize(
    reasoning: AgentReasoning,
    recommendation: AgentRecommendation,
  ): AgentSummary {
    const headline =
      recommendation.recommendation.length > 120
        ? `${recommendation.recommendation.slice(0, 117)}...`
        : recommendation.recommendation;

    const bullets = buildSummaryBullets(
      recommendation.recommendation,
      recommendation.actions,
    );

    if (bullets.length === 0 && reasoning.analysis) {
      bullets.push(reasoning.analysis.slice(0, 160));
    }

    return {
      agentId: this.definition.id,
      headline,
      bullets,
    };
  }
}

const agentCache = new Map<string, ExecutiveAgent>();

export function getExecutiveAgent(
  agentId: ExecutiveAgentContract["definition"]["id"],
): ExecutiveAgent {
  const cached = agentCache.get(agentId);
  if (cached) {
    return cached;
  }

  const agent = new ExecutiveAgent(agentId);
  agentCache.set(agentId, agent);
  return agent;
}

export function listExecutiveAgents(): ExecutiveAgent[] {
  return AGENT_IDS.map((agentId) => getExecutiveAgent(agentId));
}
