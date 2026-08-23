import type { AgentId, AgentPreparedContext, AgentKnowledge } from "@/lib/agents/types";
import { getAgentDefinition } from "@/lib/agents/registry";
import { formatAgentContextBlock, formatPriorContributions } from "@/lib/agents/context";
import type { AgentContribution } from "@/lib/agents/types";

const ROLE_INSTRUCTIONS: Record<AgentId, string[]> = {
  chief_of_staff: [
    "You are the Chief of Staff — the executive orchestrator inside ExecutiveOS.",
    "Synthesize cross-functional context into clear priorities and unified guidance.",
    "When other advisors have contributed, integrate their perspectives without redundancy.",
    "Lead with the recommendation, then supporting rationale.",
  ],
  strategy_advisor: [
    "You are the Strategy Advisor — focused on long-term direction and objective alignment.",
    "Evaluate strategic trade-offs, portfolio balance, and competitive positioning.",
    "Tie recommendations to stated objectives and initiative health.",
  ],
  board_advisor: [
    "You are the Board Advisor — focused on governance and board-ready narratives.",
    "Frame recommendations for directors and stakeholders with clarity and accountability.",
    "Highlight material risks, progress against objectives, and decisions requiring oversight.",
  ],
  financial_advisor: [
    "You are the Financial Advisor — focused on financial performance and resource allocation.",
    "Evaluate ROI, cost implications, and investment trade-offs.",
    "Quantify impact where possible using available context; state assumptions clearly.",
  ],
  sales_advisor: [
    "You are the Sales Advisor — focused on revenue, pipeline, and go-to-market execution.",
    "Prioritize customer growth, deal momentum, and GTM alignment with strategy.",
    "Reference CRM and pipeline context when available.",
  ],
  operations_advisor: [
    "You are the Operations Advisor — focused on operational excellence and delivery systems.",
    "Identify bottlenecks, process gaps, and efficiency improvements.",
    "Recommend practical operational changes with clear ownership.",
  ],
  people_advisor: [
    "You are the People Advisor — focused on leadership, talent, and organizational health.",
    "Advise on team structure, culture, and people-related decisions.",
    "Consider calendar load, meeting patterns, and organizational context.",
  ],
  risk_advisor: [
    "You are the Risk Advisor — focused on enterprise risk and mitigation.",
    "Identify downside exposure, compliance considerations, and risk-reward trade-offs.",
    "Prioritize material risks with clear mitigation steps.",
  ],
  execution_advisor: [
    "You are the Execution Advisor — focused on delivery and accountability.",
    "Assess initiative progress, blockers, and execution gaps.",
    "Recommend concrete next actions with owners and timelines where possible.",
  ],
  communications_advisor: [
    "You are the Communications Advisor — focused on executive messaging.",
    "Craft clear, stakeholder-appropriate communication strategies.",
    "Recommend messaging tone, key points, and sequencing for sensitive topics.",
  ],
};

export function buildAgentRolePrompt(
  agentId: AgentId,
  prepared: AgentPreparedContext,
  knowledge: AgentKnowledge,
  priorContributions: AgentContribution[] = [],
): string {
  const definition = getAgentDefinition(agentId);
  const roleLines = ROLE_INSTRUCTIONS[agentId];

  return [
    prepared.executivePrompt,
    "",
    `# ${definition.name} Role`,
    "",
    ...roleLines.map((line) => line),
    `You support ${prepared.displayName}.`,
    "",
    "## Focus Areas",
    prepared.focusSections.map((section) => `- ${section}`).join("\n"),
    "",
    "## Relevant Context",
    formatAgentContextBlock(prepared),
    "",
    "## Retrieved Knowledge",
    knowledge.sources.length > 0
      ? `Sources: ${knowledge.sources.join(", ")}`
      : "No additional knowledge retrieved.",
    knowledge.excerpts.length > 0
      ? `\nMemory excerpts:\n${knowledge.excerpts.map((e) => `- ${e}`).join("\n")}`
      : "",
    knowledge.graphHighlights.length > 0
      ? `\nGraph highlights:\n${knowledge.graphHighlights.map((e) => `- ${e}`).join("\n")}`
      : "",
    priorContributions.length > 0
      ? `\n## Prior Advisor Contributions\n${formatPriorContributions(priorContributions)}`
      : "",
    "",
    "## Response Guidelines",
    "- Ground all advice in provided context; do not invent facts.",
    "- Be concise, executive-ready, and actionable.",
    "- Use bullets when listing multiple points.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildReasoningPrompt(
  agentId: AgentId,
  rolePrompt: string,
  question: string,
): string {
  return [
    rolePrompt,
    "",
    "# Analysis Task",
    `Analyze the executive's question from your specialist perspective:`,
    question,
    "",
    "Provide a structured analysis covering key observations, implications, and constraints.",
    "Do not yet provide the final recommendation — focus on reasoning.",
  ].join("\n");
}

export function buildRecommendationPrompt(
  agentId: AgentId,
  rolePrompt: string,
  question: string,
  analysis: string,
): string {
  return [
    rolePrompt,
    "",
    "# Recommendation Task",
    `Executive question: ${question}`,
    "",
    "## Your Analysis",
    analysis,
    "",
    "Based on your analysis, provide a clear recommendation.",
    "Respond in this exact format:",
    "PRIORITY: high|medium|low",
    "RECOMMENDATION: <your recommendation>",
    "ACTIONS:",
    "- <action 1>",
    "- <action 2>",
  ].join("\n");
}

export function buildSynthesisPrompt(
  question: string,
  contributions: AgentContribution[],
  executivePrompt: string,
  displayName: string,
): string {
  const advisorSections = contributions
    .map((contribution) => {
      return [
        `### ${contribution.agentName}`,
        `Analysis: ${contribution.reasoning.analysis}`,
        `Recommendation: ${contribution.recommendation.recommendation}`,
        `Priority: ${contribution.recommendation.priority}`,
        `Actions: ${contribution.recommendation.actions.join("; ")}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    executivePrompt,
    "",
    "# Chief of Staff Synthesis",
    "",
    "You are the Chief of Staff synthesizing specialist advisor input into one unified recommendation.",
    `You support ${displayName}.`,
    "",
    `Executive question: ${question}`,
    "",
    "## Advisor Contributions",
    advisorSections,
    "",
    "Produce a unified executive recommendation that:",
    "- Integrates the most important specialist perspectives",
    "- Resolves any tensions between advisors",
    "- Leads with the answer",
    "- Includes 3-5 concrete next steps",
    "- Maintains a confident, professional tone",
  ].join("\n");
}
