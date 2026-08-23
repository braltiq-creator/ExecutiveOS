/**
 * Executive Council
 *
 * Permanent five seats: CEO · CFO · COO · CRO · CSO
 * Not a chatbot. No invented facts. No LLM dependency.
 */

export type * from "@/agents/types";
export {
  COUNCIL_AGENT_IDS,
  SPECIALTY_AGENT_IDS,
} from "@/agents/types";

export { createAgentContext } from "@/agents/context";
export type { AgentContext } from "@/agents/context";

export type { ExecutiveAgent } from "@/agents/base-agent";

export {
  ceoAgent,
  chiefOfStaffAgent,
  cfoAgent,
  cooAgent,
  croAgent,
  chiefRiskOfficerAgent,
  chiefPeopleOfficerAgent,
  chiefCustomerOfficerAgent,
  chiefStrategyOfficerAgent,
  csoAgent,
  COUNCIL_AGENTS,
  SPECIALTY_AGENTS,
} from "@/agents/roles";

export { listCouncilAgents, getCouncilAgent } from "@/agents/registry";

export {
  conveneExecutiveCouncil,
  toCouncilView,
} from "@/agents/orchestrator";
