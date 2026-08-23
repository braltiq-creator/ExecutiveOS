import type {
  ExecutiveMeetingRecord,
  MeetingExtraction,
} from "@/lib/meetings/types";

const TAG_PATTERNS = {
  decision: /^DECISION:\s*(.+)$/i,
  risk: /^RISK:\s*(.+)$/i,
  opportunity: /^OPPORTUNITY:\s*(.+)$/i,
  commitment: /^COMMITMENT:\s*(.+)$/i,
  action: /^ACTION:\s*(.+)$/i,
} as const;

function buildSummary(meeting: ExecutiveMeetingRecord): string {
  if (meeting.meeting_summary?.trim()) {
    return meeting.meeting_summary.trim();
  }

  const notes = meeting.raw_notes.trim();
  if (!notes) {
    return "No meeting summary available.";
  }

  const firstParagraph = notes.split(/\n\s*\n/)[0]?.trim() ?? notes;
  return firstParagraph.slice(0, 600);
}

function parseTaggedNotes(meeting: ExecutiveMeetingRecord): MeetingExtraction {
  const extraction: MeetingExtraction = {
    summary: buildSummary(meeting),
    decisions: [],
    risks: [],
    opportunities: [],
    commitments: [],
    actionItems: [],
  };

  const lines = meeting.raw_notes.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const decisionMatch = trimmed.match(TAG_PATTERNS.decision);
    if (decisionMatch) {
      extraction.decisions.push({
        title: decisionMatch[1],
        summary: decisionMatch[1],
        reason: `Captured from meeting: ${meeting.title}`,
        expectedOutcome: "To be validated following meeting outcomes.",
      });
      continue;
    }

    const riskMatch = trimmed.match(TAG_PATTERNS.risk);
    if (riskMatch) {
      extraction.risks.push({
        title: riskMatch[1],
        content: riskMatch[1],
        importance: "high",
      });
      continue;
    }

    const opportunityMatch = trimmed.match(TAG_PATTERNS.opportunity);
    if (opportunityMatch) {
      extraction.opportunities.push({
        title: opportunityMatch[1],
        content: opportunityMatch[1],
        importance: "medium",
      });
      continue;
    }

    const commitmentMatch = trimmed.match(TAG_PATTERNS.commitment);
    if (commitmentMatch) {
      extraction.commitments.push({
        title: commitmentMatch[1],
        content: commitmentMatch[1],
        importance: "medium",
      });
      continue;
    }

    const actionMatch = trimmed.match(TAG_PATTERNS.action);
    if (actionMatch) {
      extraction.actionItems.push({
        title: actionMatch[1],
        status: "open",
      });
    }
  }

  return extraction;
}

export async function analyzeMeetingDeterministic(
  meeting: ExecutiveMeetingRecord,
): Promise<MeetingExtraction> {
  return parseTaggedNotes(meeting);
}

export function mergeMeetingExtraction(
  analyzed: MeetingExtraction,
  manual: Partial<MeetingExtraction>,
): MeetingExtraction {
  return {
    summary: manual.summary?.trim() || analyzed.summary,
    decisions: [...analyzed.decisions, ...(manual.decisions ?? [])],
    risks: [...analyzed.risks, ...(manual.risks ?? [])],
    opportunities: [...analyzed.opportunities, ...(manual.opportunities ?? [])],
    commitments: [...analyzed.commitments, ...(manual.commitments ?? [])],
    actionItems: [...analyzed.actionItems, ...(manual.actionItems ?? [])],
  };
}
