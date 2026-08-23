import type { ExecutiveAgent } from "@/agents/base-agent";
import { COUNCIL_AGENTS } from "@/agents/roles";
import type { CouncilAgentId } from "@/agents/types";

export function listCouncilAgents(): ExecutiveAgent[] {
  return [...COUNCIL_AGENTS];
}

export function getCouncilAgent(
  id: CouncilAgentId,
): ExecutiveAgent | undefined {
  return COUNCIL_AGENTS.find((agent) => agent.id === id);
}
