import type { AgentDefinition, AgentPreparedContext, KnowledgeDomain } from "@/lib/agents/types";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

function formatObjectives(intelligence: ExecutiveIntelligenceResult): string {
  if (intelligence.objectives.length === 0) {
    return "No strategic objectives recorded.";
  }

  return intelligence.objectives
    .map(
      (objective) =>
        `- ${objective.title} (${objective.priority}): ${objective.description}${objective.healthLabel ? ` · Health: ${objective.healthLabel}` : ""}`,
    )
    .join("\n");
}

function formatInitiatives(intelligence: ExecutiveIntelligenceResult): string {
  const { initiatives, atRiskCount, offTrackCount, activeCount } =
    intelligence.initiatives;

  if (initiatives.length === 0) {
    return "No strategic initiatives recorded.";
  }

  const summary = `Active: ${activeCount} · At risk: ${atRiskCount} · Off track: ${offTrackCount}`;
  const lines = initiatives.map(
    (initiative) =>
      `- ${initiative.title} (${initiative.healthLabel}, ${initiative.progressPercentage}%): ${initiative.statusLabel} · Owner: ${initiative.owner}`,
  );

  return [summary, ...lines].join("\n");
}

function formatDecisions(intelligence: ExecutiveIntelligenceResult): string {
  if (intelligence.decisions.decisions.length === 0) {
    return "No executive decisions recorded.";
  }

  return intelligence.decisions.decisions
    .slice(0, 12)
    .map(
      (decision) =>
        `- ${decision.title} (${decision.statusLabel}, risk: ${decision.riskLevelLabel}): ${decision.summary}`,
    )
    .join("\n");
}

function formatMemoryByTypes(
  intelligence: ExecutiveIntelligenceResult,
  types: string[],
): string {
  const entries = intelligence.memory.entries.filter((entry) =>
    types.includes(entry.memoryType),
  );

  if (entries.length === 0) {
    return "No relevant executive memory entries.";
  }

  return entries
    .slice(0, 10)
    .map(
      (entry) =>
        `- [${entry.memoryType}] ${entry.title} (${entry.importance}): ${entry.content}`,
    )
    .join("\n");
}

function formatHealth(intelligence: ExecutiveIntelligenceResult): string {
  const { health } = intelligence;
  const lines = [
    `Portfolio score: ${health.score}/100 · Trend: ${health.trendLabel}`,
    ...health.explanation.map((line) => `- ${line}`),
  ];

  if (health.recommendedActions.length > 0) {
    lines.push(
      "Recommended actions:",
      ...health.recommendedActions
        .slice(0, 5)
        .map((action) => `- [${action.priority}] ${action.title}`),
    );
  }

  return lines.join("\n");
}

function formatCalendar(intelligence: ExecutiveIntelligenceResult): string {
  const { calendar } = intelligence;
  const agenda = calendar.todaysAgenda
    .slice(0, 8)
    .map((event) => `- ${event.title} (${event.startsAt})`)
    .join("\n");

  return [
    `Meetings today: ${calendar.todaysAgenda.length}`,
    `Meeting load: ${calendar.meetingLoadMinutes} minutes`,
    `Deep work score: ${calendar.health.deepWorkScore}/100`,
    `Status: ${calendar.health.status}`,
    calendar.health.summary,
    agenda ? `Agenda:\n${agenda}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatOrganization(intelligence: ExecutiveIntelligenceResult): string {
  const org = intelligence.organization;
  const team = intelligence.teamMembers
    .slice(0, 12)
    .map(
      (member) =>
        `- ${member.displayName ?? member.email ?? "Member"} (${member.roleLabel})`,
    )
    .join("\n");

  const departments = intelligence.departments
    .map((department) => `- ${department.name}`)
    .join("\n");

  return [
    org ? `Organization: ${org.name}` : "No organization context.",
    team ? `Team:\n${team}` : "",
    departments ? `Departments:\n${departments}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatMeetings(intelligence: ExecutiveIntelligenceResult): string {
  const prep = intelligence.calendar.meetingPreparation
    .slice(0, 5)
    .map(
      (meeting) =>
        `- ${meeting.meetingTitle}: prep score ${meeting.preparationScore}/100 · Risks: ${meeting.relatedRisks.length} · Opportunities: ${meeting.relatedOpportunities.length}`,
    )
    .join("\n");

  return prep || "No meeting preparation context available.";
}

function formatIntegrations(intelligence: ExecutiveIntelligenceResult): string {
  const integrations = intelligence.integrations;
  const lines: string[] = [];

  if (integrations.crm.connected) {
    lines.push(`CRM records: ${integrations.crm.records.length}`);
  }
  if (integrations.email.connected) {
    lines.push(`Email threads: ${integrations.email.threads.length}`);
  }
  if (integrations.tasks.connected) {
    lines.push(`Tasks: ${integrations.tasks.tasks.length}`);
  }
  if (integrations.documents.connected) {
    lines.push(`Documents: ${integrations.documents.documents.length}`);
  }

  return lines.length > 0 ? lines.join("\n") : "Integrations connected but no recent payload.";
}

function formatKnowledgeGraph(intelligence: ExecutiveIntelligenceResult): string {
  const graph = intelligence.integrations.knowledgeGraph;
  if (!graph?.connected || graph.nodes.length === 0) {
    return "Knowledge graph not available.";
  }

  const nodeSample = graph.nodes
    .slice(0, 8)
    .map((node) => `- [${node.nodeType ?? "node"}] ${node.label}`)
    .join("\n");

  return `Nodes: ${graph.nodes.length} · Edges: ${graph.edges.length}\n${nodeSample}`;
}

const DOMAIN_BUILDERS: Record<
  KnowledgeDomain,
  (intelligence: ExecutiveIntelligenceResult) => string
> = {
  objectives: formatObjectives,
  initiatives: formatInitiatives,
  decisions: formatDecisions,
  executive_memory: (intelligence) =>
    formatMemoryByTypes(intelligence, [
      "Insight",
      "Commitment",
      "Achievement",
      "Observation",
      "Decision",
      "Meeting",
    ]),
  health_engine: formatHealth,
  calendar: formatCalendar,
  organization: formatOrganization,
  meetings: formatMeetings,
  integrations: formatIntegrations,
  knowledge_graph: formatKnowledgeGraph,
};

export function buildDomainData(
  intelligence: ExecutiveIntelligenceResult,
  domains: KnowledgeDomain[],
): Record<string, string> {
  const data: Record<string, string> = {};

  for (const domain of domains) {
    data[domain] = DOMAIN_BUILDERS[domain](intelligence);
  }

  return data;
}

export function prepareAgentContext(
  definition: AgentDefinition,
  intelligence: ExecutiveIntelligenceResult,
): AgentPreparedContext {
  const displayName =
    intelligence.executive.preferredName || intelligence.executive.fullName;
  const domainData = buildDomainData(intelligence, definition.knowledgeDomains);

  const focusSections = definition.knowledgeDomains.map(
    (domain) => domain.replaceAll("_", " "),
  );

  return {
    agentId: definition.id,
    displayName,
    executivePrompt: intelligence.executivePrompt,
    focusSections,
    domainData,
  };
}

export function formatAgentContextBlock(prepared: AgentPreparedContext): string {
  const sections = Object.entries(prepared.domainData).map(
    ([domain, content]) => `## ${domain.replaceAll("_", " ")}\n${content}`,
  );

  return sections.join("\n\n");
}

export function formatPriorContributions(
  contributions: Array<{ agentName: string; summary: { headline: string; bullets: string[] } }>,
): string {
  if (contributions.length === 0) {
    return "No prior advisor contributions in this chain.";
  }

  return contributions
    .map((contribution) => {
      const bullets = contribution.summary.bullets.map((bullet) => `  - ${bullet}`).join("\n");
      return `- ${contribution.agentName}: ${contribution.summary.headline}\n${bullets}`;
    })
    .join("\n");
}
