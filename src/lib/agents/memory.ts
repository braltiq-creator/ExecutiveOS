import type { AgentDefinition, AgentKnowledge, AgentPreparedContext } from "@/lib/agents/types";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

const MEMORY_TYPE_FILTERS: Partial<Record<AgentDefinition["id"], string[]>> = {
  strategy_advisor: ["Insight", "Opportunity", "Decision"],
  board_advisor: ["Decision", "Achievement", "Risk"],
  financial_advisor: ["Decision", "Risk", "Opportunity"],
  sales_advisor: ["Opportunity", "Commitment", "Meeting"],
  operations_advisor: ["Observation", "Commitment", "Risk"],
  people_advisor: ["Observation", "Commitment", "Meeting"],
  risk_advisor: ["Risk", "Decision", "Observation"],
  execution_advisor: ["Commitment", "Decision", "Achievement"],
  communications_advisor: ["Decision", "Meeting", "Insight"],
  chief_of_staff: ["Risk", "Opportunity", "Decision", "Commitment"],
};

const GRAPH_NODE_TYPES: Partial<Record<AgentDefinition["id"], string[]>> = {
  strategy_advisor: ["initiative", "objective", "decision"],
  board_advisor: ["decision", "initiative", "objective"],
  financial_advisor: ["initiative", "decision", "crm_opportunity"],
  sales_advisor: ["crm_opportunity", "initiative", "person"],
  operations_advisor: ["initiative", "action", "task"],
  people_advisor: ["person", "department", "meeting"],
  risk_advisor: ["risk", "decision", "objective"],
  execution_advisor: ["initiative", "action", "task"],
  communications_advisor: ["decision", "meeting", "document"],
  chief_of_staff: ["initiative", "meeting", "decision", "person", "risk"],
};

function filterMemoryExcerpts(
  intelligence: ExecutiveIntelligenceResult,
  memoryTypes: string[],
): string[] {
  return intelligence.memory.entries
    .filter((entry) => memoryTypes.includes(entry.memoryType))
    .slice(0, 6)
    .map((entry) => `[${entry.memoryType}] ${entry.title}: ${entry.content}`);
}

function filterGraphHighlights(
  intelligence: ExecutiveIntelligenceResult,
  nodeTypes: string[],
): string[] {
  const graph = intelligence.integrations.knowledgeGraph;
  if (!graph?.connected) {
    return [];
  }

  return graph.nodes
    .filter((node) => !node.nodeType || nodeTypes.includes(node.nodeType))
    .slice(0, 6)
    .map((node) => `[${node.nodeType ?? "node"}] ${node.label}${node.summary ? `: ${node.summary}` : ""}`);
}

export async function retrieveAgentKnowledge(
  definition: AgentDefinition,
  prepared: AgentPreparedContext,
  intelligence: ExecutiveIntelligenceResult,
): Promise<AgentKnowledge> {
  const memoryTypes = MEMORY_TYPE_FILTERS[definition.id] ?? ["Insight"];
  const nodeTypes = GRAPH_NODE_TYPES[definition.id] ?? ["initiative"];

  const excerpts = filterMemoryExcerpts(intelligence, memoryTypes);
  const graphHighlights = filterGraphHighlights(intelligence, nodeTypes);

  const sources: string[] = [];
  if (excerpts.length > 0) sources.push("Executive Memory");
  if (graphHighlights.length > 0) sources.push("Knowledge Graph");
  if (prepared.domainData.health_engine) sources.push("Health Engine");
  if (prepared.domainData.calendar) sources.push("Calendar");
  if (prepared.domainData.organization) sources.push("Organization");

  return {
    agentId: definition.id,
    sources,
    excerpts,
    graphHighlights,
  };
}
