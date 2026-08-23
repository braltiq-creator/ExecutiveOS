import type { DecisionAct } from "@/lib/decisions/workspace";
import type { Decision } from "@/lib/decisions/engine-types";
import { selectionStateForDecisionAct } from "@/lib/decisions/decision-execution-linkage";
import type {
  Outcome,
  OutcomeActionRef,
  OutcomePortfolio,
} from "@/lib/outcomes/types";

export type DecisionConsequence = {
  act: DecisionAct;
  decisionId: string;
  decisionTitle: string;
  recordedAt: string;
  actor: string;
  statusLabel: string;
  outcomeUpdates: Array<{ id: string; name: string; summary: string }>;
  actionCreated: { id: string; label: string } | null;
  reviewDeadline: string | null;
  briefingImplication: string;
};

export type ApplyDecisionActInput = {
  decisionId: string;
  act: DecisionAct;
  actor: string;
  at?: string;
};

function clonePortfolio(portfolio: OutcomePortfolio): OutcomePortfolio {
  return structuredClone(portfolio);
}

function recomputeOverallScore(outcomes: Outcome[]): number {
  if (outcomes.length === 0) return 0;
  const sum = outcomes.reduce((total, outcome) => total + outcome.healthScore, 0);
  return Math.round(sum / outcomes.length);
}

function statusLabelForAct(act: DecisionAct): string {
  switch (act) {
    case "approve":
      return "Approved";
    case "reject":
      return "Rejected";
    case "defer":
      return "Deferred";
    case "delegate":
      return "Delegated for preparation";
    case "escalate":
      return "Escalated";
    case "more_information":
      return "Awaiting information";
  }
}

function deferDeadline(from: Date): string {
  const next = new Date(from);
  next.setDate(next.getDate() + 2);
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(next);
}

function bumpOutcomeOnApprove(outcome: Outcome, at: string): Outcome {
  const nextScore = Math.min(100, outcome.healthScore + 9);
  const movement = nextScore - outcome.healthScore;
  return {
    ...outcome,
    healthScore: nextScore,
    status: outcome.status === "off_track" ? "at_risk" : "on_track",
    yesterdayMovement: movement,
    yesterdayMovementLabel: `Up ${movement} pts after Decision`,
    expectedTrajectory: {
      ...outcome.expectedTrajectory,
      direction: "improving",
      summary:
        outcome.id === "outcome-enterprise-arr"
          ? "Helix path unblocked — ARR health expected to recover through the week if workshop locks."
          : outcome.id === "outcome-board"
            ? "Board risk language can now be completed from the written residency posture."
            : `${outcome.name} improves with the Decision recorded.`,
    },
    timeline: [
      ...outcome.timeline,
      {
        id: `tl-${outcome.id}-${at}`,
        at,
        title: "Decision recorded",
        detail: "Linked Decision advanced Outcome health.",
        kind: "decision" as const,
      },
    ],
    history: [
      ...outcome.history,
      {
        id: `hist-${outcome.id}-${at}`,
        date: at.slice(0, 10),
        healthScore: nextScore,
        note: "Updated after executive Decision.",
      },
    ],
  };
}

function bumpOutcomeOnReject(outcome: Outcome, at: string): Outcome {
  const nextScore = Math.max(0, outcome.healthScore - 6);
  const movement = nextScore - outcome.healthScore;
  return {
    ...outcome,
    healthScore: nextScore,
    status: "at_risk",
    yesterdayMovement: movement,
    yesterdayMovementLabel: `Down ${Math.abs(movement)} pts after rejection path`,
    expectedTrajectory: {
      ...outcome.expectedTrajectory,
      direction: "declining",
      summary:
        outcome.id === "outcome-enterprise-arr"
          ? "Full regional deploy required — Helix pacing slips; rebuild commercial timeline."
          : outcome.id === "outcome-board"
            ? "Board pack must disclose delay and harder compliance posture."
            : `${outcome.name} absorbs the harder path chosen.`,
    },
    timeline: [
      ...outcome.timeline,
      {
        id: `tl-${outcome.id}-rej-${at}`,
        at,
        title: "Decision rejected preferred path",
        detail: "Outcome narrative updated for the harder alternative.",
        kind: "decision" as const,
      },
    ],
  };
}

function createFollowThroughAction(
  decision: Decision,
  act: DecisionAct,
  at: string,
): OutcomeActionRef | null {
  if (act !== "approve" && act !== "delegate") return null;
  if (decision.id === "decision-residency" && act === "approve") {
    return {
      id: `action-post-${decision.id}-${at.slice(0, 19)}`,
      actionLabel: "Schedule Helix security workshop with compensating-controls pack",
      status: "pending",
      whatChanged: "Residency exception approved — commercial motion can resume.",
      why: "Workshop slot converts the Decision into execution before Helix’s window closes.",
      whatShouldHappenNext: "Send two time options today and attach the controls draft.",
      recommendation: {
        businessImpact: "Keeps Helix inside the procurement window.",
        expectedOutcomeImpact: "Converts ARR recovery from Decision into committed motion.",
        confidence: 86,
        owner: "Amelia Chen, CRO",
        deadline: "Today, 2:00 PM",
      },
    };
  }
  if (act === "delegate") {
    return {
      id: `action-delegate-${decision.id}-${at.slice(0, 19)}`,
      actionLabel: `Prepare materials for: ${decision.question.slice(0, 72)}`,
      status: "pending",
      whatChanged: "Decision delegated for preparation.",
      why: "Owner retains authority; preparation moves to the named lead.",
      whatShouldHappenNext: "Return a one-page brief before the next review window.",
      recommendation: {
        businessImpact: decision.businessImpact,
        expectedOutcomeImpact: decision.expectedOutcomeImpact,
        confidence: decision.confidence,
        owner: decision.owner,
        deadline: decision.deadline,
      },
      decisionId: decision.id,
      snapshotId: decision.originSnapshotId ?? null,
      evidenceIds: decision.evidence.map((e) => e.id),
    };
  }
  // Generic approve follow-through when an option was explicitly selected (Phase 61).
  if (
    act === "approve" &&
    decision.selectedAlternativeId &&
    decision.selectedAlternativeLabel
  ) {
    return null; // Prefer createActionFromSelectedDecision — avoid double-create on approve.
  }
  return null;
}

/**
 * Pure Decision Loop transition — single write path for portfolio SoT.
 * Ready to sit behind a Supabase repository later.
 */
export function applyDecisionAct(
  portfolio: OutcomePortfolio,
  input: ApplyDecisionActInput,
): { portfolio: OutcomePortfolio; consequence: DecisionConsequence } {
  const at = input.at ?? new Date().toISOString();
  const next = clonePortfolio(portfolio);
  const index = next.decisions.findIndex(
    (decision) => decision.id === input.decisionId,
  );
  if (index < 0) {
    throw new Error(`Unknown decision: ${input.decisionId}`);
  }

  const decision = next.decisions[index];
  const outcomeUpdates: DecisionConsequence["outcomeUpdates"] = [];
  let actionCreated: DecisionConsequence["actionCreated"] = null;
  let reviewDeadline: string | null = null;

  let nextStatus = decision.status;
  let historyNote = "";

  switch (input.act) {
    case "approve":
      nextStatus = "approved";
      historyNote = "Executive approved the preferred path.";
      break;
    case "reject":
      nextStatus = "decided";
      historyNote = "Executive rejected the preferred path.";
      break;
    case "defer":
      nextStatus = "deferred";
      reviewDeadline = deferDeadline(new Date(at));
      historyNote = `Deferred — review by ${reviewDeadline}.`;
      break;
    case "delegate":
      nextStatus = "under_review";
      historyNote = "Delegated preparation; authority retained.";
      break;
    case "escalate":
      nextStatus = "under_review";
      historyNote = "Escalated with full context.";
      break;
    case "more_information":
      nextStatus = "pending";
      historyNote = "Paused pending named information.";
      break;
  }

  const selectionState = selectionStateForDecisionAct(input.act);

  const updatedDecision: Decision = {
    ...decision,
    status: nextStatus,
    executiveSelectionState: selectionState ?? decision.executiveSelectionState,
    decisionRecordedAt:
      selectionState === "DECISION_APPROVED" ||
      selectionState === "DECISION_REJECTED" ||
      selectionState === "DECISION_DEFERRED"
        ? at
        : decision.decisionRecordedAt,
    evidenceAtDecision:
      selectionState && !decision.evidenceAtDecision
        ? decision.evidence.map((e) => ({ ...e }))
        : decision.evidenceAtDecision,
    deadline:
      input.act === "defer" && reviewDeadline
        ? reviewDeadline
        : decision.deadline,
    owner: decision.owner,
    history: [
      ...decision.history,
      {
        id: `hist-${decision.id}-${at}`,
        at,
        status: nextStatus,
        note: historyNote,
        actor: input.actor,
      },
    ],
    timeline: [
      ...decision.timeline,
      {
        id: `time-${decision.id}-${at}`,
        at,
        title: statusLabelForAct(input.act),
        detail: historyNote,
        kind: "status",
      },
    ],
  };

  next.decisions[index] = updatedDecision;

  const followAction = createFollowThroughAction(decision, input.act, at);

  next.outcomes = next.outcomes.map((outcome) => {
    if (!decision.outcomeIds.includes(outcome.id)) return outcome;

    let updated = outcome;
    if (input.act === "approve") {
      updated = bumpOutcomeOnApprove(outcome, at);
      outcomeUpdates.push({
        id: outcome.id,
        name: outcome.name,
        summary: updated.yesterdayMovementLabel,
      });
    } else if (input.act === "reject") {
      updated = bumpOutcomeOnReject(outcome, at);
      outcomeUpdates.push({
        id: outcome.id,
        name: outcome.name,
        summary: updated.expectedTrajectory.summary,
      });
    } else if (input.act === "defer") {
      outcomeUpdates.push({
        id: outcome.id,
        name: outcome.name,
        summary: `Decision deferred — revisit ${reviewDeadline}.`,
      });
    }

    if (followAction && decision.outcomeIds[0] === outcome.id) {
      updated = {
        ...updated,
        pendingActions: [followAction, ...updated.pendingActions],
      };
      actionCreated = {
        id: followAction.id,
        label: followAction.actionLabel,
      };
    }

    return updated;
  });

  next.overallScore = recomputeOverallScore(next.outcomes);
  next.refreshedAt = at;
  next.statusLabel =
    input.act === "approve"
      ? "Decision recorded — portfolio recovering"
      : input.act === "reject"
        ? "Harder path selected — watch linked Outcomes"
        : input.act === "defer"
          ? "Decision deferred — review date set"
          : next.statusLabel;

  const briefingImplication =
    input.act === "approve"
      ? "Today will no longer treat this as an urgent Decision. Outcome Health and the Executive Summary reflect the recorded judgement."
      : input.act === "reject"
        ? "Today’s Briefing will describe the harder path and updated Outcome narrative."
        : input.act === "defer"
          ? `The Decision returns with review by ${reviewDeadline}. Urgency is cleared until then.`
          : "The Decision register and Briefing now show the updated status.";

  return {
    portfolio: next,
    consequence: {
      act: input.act,
      decisionId: decision.id,
      decisionTitle: decision.question,
      recordedAt: at,
      actor: input.actor,
      statusLabel: statusLabelForAct(input.act),
      outcomeUpdates,
      actionCreated,
      reviewDeadline,
      briefingImplication,
    },
  };
}
