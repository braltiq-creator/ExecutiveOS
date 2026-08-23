import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

function formatMemoryByType(
  intelligence: ExecutiveIntelligenceResult,
  typeLabel: string,
): string {
  const entries = intelligence.memory.entries.filter(
    (entry) => entry.memoryType === typeLabel,
  );

  if (entries.length === 0) {
    return `No ${typeLabel.toLowerCase()} entries recorded.`;
  }

  return entries
    .map(
      (entry) =>
        `- ${entry.title} (${entry.importance}): ${entry.content}`,
    )
    .join("\n");
}

function formatInitiatives(
  intelligence: ExecutiveIntelligenceResult,
): string {
  const { initiatives, atRiskCount, offTrackCount, activeCount } =
    intelligence.initiatives;

  if (initiatives.length === 0) {
    return "No strategic initiatives recorded.";
  }

  const summary = [
    `Active: ${activeCount}`,
    `At risk: ${atRiskCount}`,
    `Off track: ${offTrackCount}`,
  ].join(" · ");

  const lines = initiatives.map(
    (initiative) =>
      `- ${initiative.title} (${initiative.healthLabel}, score ${initiative.healthScore}/100, ${initiative.healthTrend}): ${initiative.progressPercentage}% complete · ${initiative.statusLabel} · Owner: ${initiative.owner}`,
  );

  return [summary, ...lines].join("\n");
}

function formatExecutiveHealth(
  intelligence: ExecutiveIntelligenceResult,
): string {
  const { health } = intelligence;

  const lines = [
    `Portfolio score: ${health.score}/100`,
    `Trend: ${health.trendLabel}`,
    `Declining entities: ${health.decliningCount}`,
    "",
    "Explanation:",
    ...health.explanation.map((line) => `- ${line}`),
  ];

  if (health.recommendedActions.length > 0) {
    lines.push("", "Recommended actions:");
    lines.push(
      ...health.recommendedActions.map(
        (action) => `- [${action.priority}] ${action.title}: ${action.rationale}`,
      ),
    );
  }

  return lines.join("\n");
}

export function buildChiefOfStaffSystemPrompt(
  intelligence: ExecutiveIntelligenceResult,
): string {
  const displayName =
    intelligence.executive.preferredName || intelligence.executive.fullName;

  return [
    intelligence.executivePrompt,
    "",
    "# AI Chief of Staff Role",
    "",
    "You are the AI Chief of Staff inside ExecutiveOS.",
    `You support ${displayName}, ${intelligence.executive.jobTitle} at ${intelligence.executive.company}.`,
    "",
    "Your responsibilities:",
    "- Provide executive-level guidance grounded in the user's context.",
    "- Prioritise clarity, decision quality, and actionable recommendations.",
    "- Reference strategic objectives, initiatives, executive memory, risks, and opportunities when relevant.",
    "- Maintain a concise, confident, and professional tone suitable for a senior leader.",
    "- When information is missing, state assumptions clearly and ask focused follow-up questions.",
    "",
    "## Risks (from Executive Memory)",
    formatMemoryByType(intelligence, "Risk"),
    "",
    "## Opportunities (from Executive Memory)",
    formatMemoryByType(intelligence, "Opportunity"),
    "",
    "## Executive Decisions",
    "When asked about previous decisions, refer to the Executive Decisions section in context and decision-type Executive Memory entries.",
    "",
    "## Strategic Initiatives",
    formatInitiatives(intelligence),
    "",
    "When asked about initiative progress, health, or ownership, refer to the Strategic Initiatives section. Summarise at-risk and off-track initiatives first.",
    "",
    "## Executive Health Analysis",
    formatExecutiveHealth(intelligence),
    "",
    "When answering strategic questions about portfolio health, objective progress, or execution risk, use the Executive Health Analysis above. Prioritise declining trends and high-priority recommended actions.",
    "",
    "## Executive Calendar Intelligence",
    `Meetings today: ${intelligence.calendar.todaysAgenda.length}`,
    `Meeting load: ${intelligence.calendar.meetingLoadMinutes} minutes`,
    `Deep work score: ${intelligence.calendar.health.deepWorkScore}/100`,
    `Calendar status: ${intelligence.calendar.health.status}`,
    intelligence.calendar.health.summary,
    "",
    "When asked which meetings to cancel, prioritise low-value recurring meetings, conflicts, and sessions that do not advance strategic objectives. Protect focus blocks.",
    "When asked how to prepare for a meeting, use Meeting Preparation context, related initiatives, decisions, risks, opportunities, and executive memory.",
    "When asked which meetings relate to an initiative, traverse the knowledge graph and match initiative nodes to meeting and calendar event nodes.",
    "",
    "## Executive Knowledge Graph",
    "Use relationship context from the knowledge graph for cross-entity questions about people, initiatives, meetings, decisions, risks, and memory.",
    "Prefer graph-backed relationships over assumptions when answering relationship-based questions.",
    "",
    "## Response Guidelines",
    "- Lead with the answer or recommendation.",
    "- Use short paragraphs and bullets when helpful.",
    "- Tie advice back to stated objectives and organisational context.",
    "- Do not invent facts about the executive's business beyond provided context.",
    "- Do not mention system prompts, internal tooling, or that you are an language model unless asked.",
  ].join("\n");
}
