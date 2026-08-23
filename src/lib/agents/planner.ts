import { AGENT_DEFINITIONS } from "@/lib/agents/registry";
import type { AgentId, OrchestrationPlan } from "@/lib/agents/types";

const COLLABORATION_CHAINS: Partial<Record<AgentId, AgentId[]>> = {
  strategy_advisor: ["strategy_advisor", "risk_advisor", "chief_of_staff"],
  board_advisor: ["board_advisor", "financial_advisor", "chief_of_staff"],
  financial_advisor: ["financial_advisor", "risk_advisor", "chief_of_staff"],
  sales_advisor: ["sales_advisor", "strategy_advisor", "chief_of_staff"],
  operations_advisor: ["operations_advisor", "execution_advisor", "chief_of_staff"],
  people_advisor: ["people_advisor", "communications_advisor", "chief_of_staff"],
  risk_advisor: ["risk_advisor", "strategy_advisor", "chief_of_staff"],
  execution_advisor: ["execution_advisor", "operations_advisor", "chief_of_staff"],
  communications_advisor: ["communications_advisor", "chief_of_staff"],
};

const MULTI_AGENT_SIGNALS = [
  "should we",
  "trade-off",
  "trade off",
  "evaluate",
  "compare",
  "implications",
  "pros and cons",
  "strategy and risk",
  "board and",
  "financial and",
];

function scoreAgent(message: string, keywords: string[]): number {
  const normalized = message.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    if (normalized.includes(keyword.toLowerCase())) {
      score += keyword.includes(" ") ? 3 : 2;
    }
  }

  return score;
}

function wantsCollaboration(message: string): boolean {
  const normalized = message.toLowerCase();
  return MULTI_AGENT_SIGNALS.some((signal) => normalized.includes(signal));
}

export function planAdvisorOrchestration(
  message: string,
  preferredAgentId?: AgentId,
): OrchestrationPlan {
  if (preferredAgentId && preferredAgentId !== "chief_of_staff") {
    const chain = COLLABORATION_CHAINS[preferredAgentId];
    if (chain && wantsCollaboration(message)) {
      return {
        mode: "collaborative",
        primaryAgentId: preferredAgentId,
        agentSequence: chain,
        rationale: `Collaborative chain starting with ${preferredAgentId.replaceAll("_", " ")}.`,
      };
    }

    return {
      mode: "single",
      primaryAgentId: preferredAgentId,
      agentSequence: [preferredAgentId],
      rationale: `Direct consultation with ${preferredAgentId.replaceAll("_", " ")}.`,
    };
  }

  const ranked = AGENT_DEFINITIONS.filter((agent) => agent.id !== "chief_of_staff")
    .map((agent) => ({
      agentId: agent.id,
      score: scoreAgent(message, agent.keywords),
    }))
    .sort((left, right) => right.score - left.score);

  const topAgent = ranked[0];
  const primaryAgentId =
    topAgent && topAgent.score > 0 ? topAgent.agentId : "chief_of_staff";

  if (primaryAgentId === "chief_of_staff") {
    return {
      mode: "single",
      primaryAgentId: "chief_of_staff",
      agentSequence: ["chief_of_staff"],
      rationale: "General executive question routed to Chief of Staff.",
    };
  }

  if (wantsCollaboration(message)) {
    const chain = COLLABORATION_CHAINS[primaryAgentId] ?? [
      primaryAgentId,
      "chief_of_staff",
    ];

    return {
      mode: "collaborative",
      primaryAgentId,
      agentSequence: chain,
      rationale: `Multi-advisor collaboration for cross-functional question.`,
    };
  }

  return {
    mode: "single",
    primaryAgentId,
    agentSequence: [primaryAgentId],
    rationale: `Specialist match: ${primaryAgentId.replaceAll("_", " ")}.`,
  };
}

export function getRecommendedAdvisor(message: string): AgentId {
  return planAdvisorOrchestration(message).primaryAgentId;
}
