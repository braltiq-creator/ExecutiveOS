import type { AgentDefinition, AgentId } from "@/lib/agents/types";

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: "chief_of_staff",
    name: "Chief of Staff",
    title: "Executive Orchestrator",
    description:
      "Synthesizes cross-functional guidance, prioritizes executive focus, and delivers unified recommendations.",
    expertise: ["Prioritization", "Executive alignment", "Cross-functional synthesis"],
    keywords: ["focus", "prioritize", "today", "overall", "coordinate", "summary"],
    knowledgeDomains: [
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
    ],
    accentColor: "zinc",
  },
  {
    id: "strategy_advisor",
    name: "Strategy Advisor",
    title: "Strategic Planning",
    description:
      "Evaluates strategic direction, competitive positioning, and long-term objective alignment.",
    expertise: ["Strategy", "Objectives", "Portfolio trade-offs"],
    keywords: [
      "strategy",
      "strategic",
      "objective",
      "vision",
      "market",
      "competitive",
      "portfolio",
      "long-term",
    ],
    knowledgeDomains: [
      "objectives",
      "initiatives",
      "decisions",
      "executive_memory",
      "knowledge_graph",
      "health_engine",
    ],
    accentColor: "indigo",
  },
  {
    id: "board_advisor",
    name: "Board Advisor",
    title: "Board & Governance",
    description:
      "Prepares board narratives, governance perspectives, and stakeholder-ready recommendations.",
    expertise: ["Board reporting", "Governance", "Stakeholder narrative"],
    keywords: ["board", "directors", "governance", "shareholders", "investors", "fiduciary"],
    knowledgeDomains: [
      "objectives",
      "initiatives",
      "decisions",
      "health_engine",
      "executive_memory",
      "organization",
    ],
    accentColor: "violet",
  },
  {
    id: "financial_advisor",
    name: "Financial Advisor",
    title: "Financial Performance",
    description:
      "Analyzes financial implications, investment trade-offs, and resource allocation decisions.",
    expertise: ["Financial analysis", "ROI", "Budget allocation"],
    keywords: [
      "financial",
      "finance",
      "budget",
      "revenue",
      "cost",
      "roi",
      "investment",
      "margin",
      "cash",
    ],
    knowledgeDomains: [
      "initiatives",
      "decisions",
      "objectives",
      "executive_memory",
      "health_engine",
      "integrations",
    ],
    accentColor: "emerald",
  },
  {
    id: "sales_advisor",
    name: "Sales Advisor",
    title: "Revenue & Growth",
    description:
      "Advises on pipeline, customer growth, go-to-market priorities, and revenue execution.",
    expertise: ["Pipeline", "GTM", "Customer growth"],
    keywords: [
      "sales",
      "pipeline",
      "customer",
      "revenue",
      "deal",
      "crm",
      "growth",
      "gtm",
      "quota",
    ],
    knowledgeDomains: [
      "integrations",
      "initiatives",
      "executive_memory",
      "meetings",
      "knowledge_graph",
      "objectives",
    ],
    accentColor: "sky",
  },
  {
    id: "operations_advisor",
    name: "Operations Advisor",
    title: "Operational Excellence",
    description:
      "Optimizes execution systems, process efficiency, and operational bottlenecks.",
    expertise: ["Operations", "Process", "Efficiency"],
    keywords: [
      "operations",
      "operational",
      "process",
      "efficiency",
      "bottleneck",
      "delivery",
      "supply",
      "scale",
    ],
    knowledgeDomains: [
      "initiatives",
      "health_engine",
      "meetings",
      "decisions",
      "executive_memory",
      "organization",
    ],
    accentColor: "amber",
  },
  {
    id: "people_advisor",
    name: "People Advisor",
    title: "Leadership & Talent",
    description:
      "Guides on team structure, leadership development, culture, and people decisions.",
    expertise: ["Talent", "Leadership", "Org design"],
    keywords: [
      "people",
      "team",
      "talent",
      "hiring",
      "culture",
      "leadership",
      "org",
      "retention",
      "direct reports",
    ],
    knowledgeDomains: [
      "organization",
      "meetings",
      "executive_memory",
      "decisions",
      "calendar",
      "knowledge_graph",
    ],
    accentColor: "rose",
  },
  {
    id: "risk_advisor",
    name: "Risk Advisor",
    title: "Risk & Compliance",
    description:
      "Identifies enterprise risks, mitigation strategies, and compliance considerations.",
    expertise: ["Risk assessment", "Mitigation", "Compliance"],
    keywords: [
      "risk",
      "risks",
      "threat",
      "compliance",
      "regulatory",
      "mitigation",
      "exposure",
      "downside",
    ],
    knowledgeDomains: [
      "executive_memory",
      "decisions",
      "initiatives",
      "objectives",
      "health_engine",
      "knowledge_graph",
    ],
    accentColor: "orange",
  },
  {
    id: "execution_advisor",
    name: "Execution Advisor",
    title: "Delivery & Accountability",
    description:
      "Drives initiative delivery, accountability, and execution against commitments.",
    expertise: ["Delivery", "Accountability", "Initiative execution"],
    keywords: [
      "execution",
      "deliver",
      "delivery",
      "initiative",
      "progress",
      "accountability",
      "milestone",
      "blocker",
    ],
    knowledgeDomains: [
      "initiatives",
      "decisions",
      "meetings",
      "calendar",
      "health_engine",
      "executive_memory",
    ],
    accentColor: "cyan",
  },
  {
    id: "communications_advisor",
    name: "Communications Advisor",
    title: "Executive Communications",
    description:
      "Crafts messaging for stakeholders, all-hands narratives, and sensitive communications.",
    expertise: ["Messaging", "Stakeholder comms", "Narrative"],
    keywords: [
      "communicate",
      "communication",
      "message",
      "messaging",
      "announce",
      "email",
      "narrative",
      "all-hands",
      "stakeholder",
    ],
    knowledgeDomains: [
      "executive_memory",
      "decisions",
      "initiatives",
      "organization",
      "integrations",
      "meetings",
    ],
    accentColor: "fuchsia",
  },
];

const AGENT_MAP = new Map<AgentId, AgentDefinition>(
  AGENT_DEFINITIONS.map((agent) => [agent.id, agent]),
);

export function getAgentDefinition(agentId: AgentId): AgentDefinition {
  const definition = AGENT_MAP.get(agentId);
  if (!definition) {
    throw new Error(`Unknown agent: ${agentId}`);
  }
  return definition;
}

export function listAgentDefinitions(): AgentDefinition[] {
  return AGENT_DEFINITIONS;
}

export function getAgentName(agentId: AgentId): string {
  return getAgentDefinition(agentId).name;
}
