import type {
  ExecutiveCommitment,
  ExecutiveContextBrief,
  ExecutiveSignal,
  ExecutiveSignalId,
  StakeholderRelationship,
} from "@/providers/microsoft365/executive-context/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";

export function deriveExecutiveSignals(input: {
  commitments: ExecutiveCommitment[];
  stakeholders: StakeholderRelationship[];
  communicationsCount: number;
  availability: string;
  snapshot?: IntelligentExecutiveSnapshot;
}): ExecutiveSignal[] {
  const boardMeetings = input.commitments.filter(
    (c) => c.kind === "governance_event",
  );
  const prepRisk = boardMeetings.some((c) => c.preparationRisk === "high");
  const meetingCount = input.commitments.length;
  const openDecisions =
    input.snapshot?.decisions.filter((d) => d.priority !== "resolved").length ??
    0;
  const neglected = input.stakeholders.filter((s) => s.neglectRisk);

  const signals: ExecutiveSignal[] = [
    signal(
      "board_readiness",
      "Board Readiness",
      prepRisk || boardMeetings.length === 0 ? "high" : "healthy",
      prepRisk ? 35 : boardMeetings.length > 0 ? 72 : 50,
      prepRisk
        ? "Board commitment is on the calendar but preparation risk is elevated."
        : boardMeetings.length > 0
          ? "Board/governance commitment is scheduled with manageable preparation risk."
          : "No board commitment in the current window.",
      boardMeetings.map((c) => c.id),
    ),
    signal(
      "decision_overload",
      "Decision Overload",
      openDecisions >= 3 ? "high" : openDecisions >= 2 ? "moderate" : "healthy",
      openDecisions >= 3 ? 30 : openDecisions >= 2 ? 55 : 78,
      `${openDecisions} open executive Decision(s) compete for attention.`,
      input.snapshot?.decisions.slice(0, 3).map((d) => d.id) ?? [],
    ),
    signal(
      "meeting_saturation",
      "Meeting Saturation",
      meetingCount >= 4 ? "high" : meetingCount >= 2 ? "moderate" : "healthy",
      meetingCount >= 4 ? 32 : meetingCount >= 2 ? 58 : 80,
      `${meetingCount} executive commitment(s) in the current window.`,
      input.commitments.map((c) => c.id),
    ),
    signal(
      "stakeholder_neglect",
      "Stakeholder Neglect",
      neglected.length > 0 ? "moderate" : "healthy",
      neglected.length > 0 ? 48 : 82,
      neglected.length > 0
        ? `${neglected.map((s) => s.name).join(", ")} require deliberate executive touch.`
        : "No material stakeholder neglect signals.",
      neglected.map((s) => s.id),
    ),
    signal(
      "follow_up_risk",
      "Follow-up Risk",
      input.communicationsCount > 0 && openDecisions > 0 ? "moderate" : "low",
      input.communicationsCount > 0 && openDecisions > 0 ? 52 : 75,
      "Open Decisions plus inbound executive communication increase follow-up risk.",
      [],
    ),
    signal(
      "communication_gaps",
      "Communication Gaps",
      input.communicationsCount === 0 ? "moderate" : "healthy",
      input.communicationsCount === 0 ? 50 : 70,
      input.communicationsCount === 0
        ? "No executive communication signals in the current window."
        : "Executive communication signals are present.",
      [],
    ),
    signal(
      "executive_availability",
      "Executive Availability",
      /busy|oof/i.test(input.availability) ? "moderate" : "healthy",
      /busy|oof/i.test(input.availability) ? 45 : 80,
      `Presence indicates ${input.availability}.`,
      ["signal-executive-availability"],
    ),
    signal(
      "collaboration_health",
      "Collaboration Health",
      "healthy",
      68,
      "Collaboration signals are available for leadership coordination.",
      [],
    ),
    signal(
      "decision_velocity",
      "Decision Velocity",
      openDecisions >= 2 && meetingCount >= 2 ? "moderate" : "healthy",
      openDecisions >= 2 && meetingCount >= 2 ? 50 : 74,
      "Decision velocity depends on protecting Focus amid meeting load.",
      [],
    ),
  ];

  return signals;
}

function signal(
  id: ExecutiveSignalId,
  label: string,
  severity: ExecutiveSignal["severity"],
  score: number,
  summary: string,
  relatedEntityIds: string[],
): ExecutiveSignal {
  return {
    id,
    label,
    severity,
    score,
    summary,
    evidence: [summary],
    relatedEntityIds,
  };
}

export function boardReadinessFromSignals(
  signals: ExecutiveSignal[],
  commitments: ExecutiveCommitment[],
): ExecutiveContextBrief["boardReadiness"] {
  const board = signals.find((s) => s.id === "board_readiness");
  const hasBoard = commitments.some((c) => c.kind === "governance_event");
  if (!hasBoard) {
    return {
      level: "nearly",
      label: "No board session in window",
      detail: "Use the quiet window to advance Decision binds and evidence.",
    };
  }
  if (board && board.score >= 65) {
    return {
      level: "ready",
      label: "Board ready",
      detail: board.summary,
    };
  }
  if (board && board.score >= 45) {
    return {
      level: "nearly",
      label: "Nearly ready",
      detail: board.summary,
    };
  }
  return {
    level: "not_ready",
    label: "Not board ready",
    detail: board?.summary ?? "Board preparation risk is elevated.",
  };
}
