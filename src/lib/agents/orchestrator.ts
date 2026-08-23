import { buildSynthesisPrompt } from "@/lib/agents/prompts";
import { getExecutiveAgent } from "@/lib/agents/provider";
import { getAgentName } from "@/lib/agents/registry";
import { AI_DEFAULTS, getChiefOfStaffModel } from "@/lib/ai/models";
import { getAIProvider } from "@/lib/ai/provider";
import type {
  AgentContribution,
  AgentCycleInput,
  OrchestrationPlan,
  OrchestrationResult,
} from "@/lib/agents/types";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";
import type { ConversationTurn } from "@/lib/ai/types";

async function runAgentCycle(
  agentId: OrchestrationPlan["agentSequence"][number],
  question: string,
  intelligence: ExecutiveIntelligenceResult,
  priorSummaries: AgentContribution[],
  history: ConversationTurn[],
): Promise<AgentContribution> {
  const agent = getExecutiveAgent(agentId);
  const input: AgentCycleInput = {
    question,
    intelligence,
    priorSummaries,
    history,
  };

  const prepared = agent.prepareContext(intelligence);
  const knowledge = await agent.retrieveKnowledge(prepared, intelligence);
  const reasoning = await agent.reason(input, prepared, knowledge);
  const recommendation = await agent.recommend(input, prepared, knowledge, reasoning);
  const summary = agent.summarize(reasoning, recommendation);

  return {
    agentId,
    agentName: getAgentName(agentId),
    reasoning,
    recommendation,
    summary,
  };
}

async function synthesizeUnifiedRecommendation(
  question: string,
  contributions: AgentContribution[],
  intelligence: ExecutiveIntelligenceResult,
): Promise<string> {
  if (contributions.length === 1) {
    return contributions[0].recommendation.recommendation;
  }

  const displayName =
    intelligence.executive.preferredName || intelligence.executive.fullName;
  const systemPrompt = buildSynthesisPrompt(
    question,
    contributions,
    intelligence.executivePrompt,
    displayName,
  );
  const provider = getAIProvider();

  const completion = await provider.complete({
    systemPrompt,
    messages: [{ role: "user", content: question }],
    model: getChiefOfStaffModel(),
    temperature: AI_DEFAULTS.temperature,
    maxTokens: AI_DEFAULTS.maxTokens,
  });

  return completion.content.trim();
}

function buildReasoningSummary(contributions: AgentContribution[]): string {
  return contributions
    .map(
      (contribution) =>
        `${contribution.agentName}: ${contribution.summary.headline}`,
    )
    .join(" · ");
}

export async function orchestrateAdvisorConsultation(
  plan: OrchestrationPlan,
  question: string,
  intelligence: ExecutiveIntelligenceResult,
  history: ConversationTurn[],
): Promise<OrchestrationResult> {
  const contributions: AgentContribution[] = [];
  const specialists = plan.agentSequence.filter((agentId) => agentId !== "chief_of_staff");

  if (specialists.length === 0) {
    const contribution = await runAgentCycle(
      "chief_of_staff",
      question,
      intelligence,
      [],
      history,
    );
    contributions.push(contribution);

    return {
      plan,
      contributions,
      unifiedRecommendation: contribution.recommendation.recommendation,
      reasoningSummary: buildReasoningSummary(contributions),
    };
  }

  for (const agentId of specialists) {
    const contribution = await runAgentCycle(
      agentId,
      question,
      intelligence,
      contributions,
      history,
    );
    contributions.push(contribution);
  }

  const unifiedRecommendation = await synthesizeUnifiedRecommendation(
    question,
    contributions,
    intelligence,
  );

  return {
    plan,
    contributions,
    unifiedRecommendation,
    reasoningSummary: buildReasoningSummary(contributions),
  };
}
