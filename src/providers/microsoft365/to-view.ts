import type {
  ExecutiveContextBrief,
  ExecutiveContextView,
} from "@/providers/microsoft365/executive-context/types";

const KIND_LABELS: Record<string, string> = {
  executive_commitment: "Executive commitment",
  governance_event: "Board / governance",
  strategic_coordination: "Strategic coordination",
  operational_review: "Operational review",
  customer_engagement: "Customer engagement",
  focus_block: "Focus block",
};

export function toExecutiveContextView(
  brief: ExecutiveContextBrief,
): ExecutiveContextView {
  return {
    framing: brief.framing,
    boardReadiness: brief.boardReadiness,
    calendar: brief.commitments.map((c) => ({
      id: c.id,
      title: c.title,
      kindLabel: KIND_LABELS[c.kind] ?? c.kind,
      when: formatWhen(c.startsAt, c.endsAt),
      preparationRisk: c.preparationRisk,
      whyItMatters: c.whyItMatters,
      stakeholders: c.stakeholders,
    })),
    keyRelationships: brief.stakeholders.map((s) => ({
      name: s.name,
      roleHint: s.roleHint,
      relationship: s.relationship.replace(/_/g, " "),
      neglectRisk: s.neglectRisk,
    })),
    meetingRisks: brief.commitments
      .filter((c) => c.preparationRisk === "high" || c.preparationRisk === "moderate")
      .map((c) => `${c.title} — preparation risk ${c.preparationRisk}`),
    upcomingDecisions: brief.upcomingDecisionIds,
    criticalDocuments: brief.documents.map((d) => ({
      title: d.title,
      whyItMatters: d.whyItMatters,
    })),
    strategicConversations: brief.conversations.map((c) => ({
      topic: c.topic,
      summary: c.summary,
      urgency: c.urgency,
    })),
    signals: brief.signals.map((s) => ({
      label: s.label,
      severity: s.severity,
      summary: s.summary,
    })),
    closingNote: brief.closingNote,
  };
}

function formatWhen(startsAt: string, endsAt: string): string {
  try {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const opts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return `${start.toLocaleTimeString("en-AU", opts)}–${end.toLocaleTimeString("en-AU", opts)}`;
  } catch {
    return startsAt;
  }
}
