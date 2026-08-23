/**
 * Phase 61 — Decision → Execution linkage (shared Decision Engine).
 *
 * ExecutiveOS frames options. The executive selects. Then actions may be created.
 * Does not invent owners, due dates, financial value, or Council consensus.
 */

import type {
  Decision,
  DecisionEvidence,
  ExecutiveSelectionState,
} from "@/lib/decisions/engine-types";
import type {
  OutcomeActionRef,
  OutcomePortfolio,
} from "@/lib/outcomes/types";

export type SelectDecisionOptionInput = {
  decisionId: string;
  alternativeId: string;
  actor: string;
  at?: string;
  /** Originating snapshot — recorded for lineage; never mutated. */
  snapshotId?: string | null;
};

export type SelectDecisionOptionResult = {
  portfolio: OutcomePortfolio;
  decision: Decision;
  selectionState: ExecutiveSelectionState;
  selectedLabel: string;
  recordedAt: string;
};

export type CreateActionFromDecisionInput = {
  decisionId: string;
  actor: string;
  at?: string;
};

export type CreateActionFromDecisionResult = {
  portfolio: OutcomePortfolio;
  action: OutcomeActionRef;
  decision: Decision;
  recordedAt: string;
};

export type CommandCentreExecutionStatus =
  | "decision_required"
  | "decision_selected"
  | "decision_approved"
  | "decision_deferred"
  | "decision_rejected"
  | "execution_underway";

export function deriveExecutiveSelectionState(
  decision: Decision,
): ExecutiveSelectionState {
  if (decision.executiveSelectionState) return decision.executiveSelectionState;
  if (decision.status === "approved") return "DECISION_APPROVED";
  if (decision.status === "deferred") return "DECISION_DEFERRED";
  if (decision.status === "decided") return "DECISION_REJECTED";
  if (decision.selectedAlternativeId) return "OPTION_SELECTED";
  if (decision.alternatives.length > 0) return "OPTION_IDENTIFIED";
  return "OPTION_IDENTIFIED";
}

export function commandCentreStatusFromDecision(
  decision: Decision | undefined,
  hasLinkedAction: boolean,
): CommandCentreExecutionStatus {
  if (!decision) return "decision_required";
  if (hasLinkedAction) return "execution_underway";
  const state = deriveExecutiveSelectionState(decision);
  switch (state) {
    case "OPTION_SELECTED":
      return "decision_selected";
    case "DECISION_APPROVED":
      return "decision_approved";
    case "DECISION_DEFERRED":
      return "decision_deferred";
    case "DECISION_REJECTED":
      return "decision_rejected";
    case "OPTION_IDENTIFIED":
    default:
      return "decision_required";
  }
}

export function commandCentreStatusLabel(
  status: CommandCentreExecutionStatus,
): string {
  switch (status) {
    case "decision_required":
      return "Decision required";
    case "decision_selected":
      return "Decision selected";
    case "decision_approved":
      return "Decision approved";
    case "decision_deferred":
      return "Decision deferred";
    case "decision_rejected":
      return "Decision rejected";
    case "execution_underway":
      return "Execution underway";
  }
}

export function decisionHasLinkedAction(
  portfolio: OutcomePortfolio,
  decisionId: string,
): boolean {
  return portfolio.outcomes.some((o) =>
    o.pendingActions.some((a) => a.decisionId === decisionId),
  );
}

/**
 * Frame a follow-through action label from the selected option — not hard-coded.
 */
export function frameActionFromSelectedOption(decision: Decision): string {
  const label =
    decision.selectedAlternativeLabel ??
    decision.alternatives.find((a) => a.id === decision.selectedAlternativeId)
      ?.label;
  if (!label) {
    return `Follow through on: ${decision.question.slice(0, 96)}`;
  }
  if (/protect/i.test(label) && /capacity|reallocation/i.test(label)) {
    const model = label.match(/Protect\s+(.+?)\s+demand/i)?.[1] ?? "strategic";
    return `Review plant capacity allocation against ${model} demand requirements.`;
  }
  if (/maintain|deferral/i.test(label)) {
    return `Confirm current allocation posture and monitor deferral risk against the selected decision.`;
  }
  if (/defer|additional evidence/i.test(label)) {
    return `Gather missing evidence named on the decision before the next executive review.`;
  }
  return `Execute the selected decision option: ${label}`;
}

function clonePortfolio(portfolio: OutcomePortfolio): OutcomePortfolio {
  return structuredClone(portfolio);
}

function freezeEvidence(decision: Decision): DecisionEvidence[] {
  return decision.evidence.map((e) => ({ ...e }));
}

/**
 * Explicit executive option selection.
 * Does not approve the decision and does not create an action.
 */
export function selectDecisionOption(
  portfolio: OutcomePortfolio,
  input: SelectDecisionOptionInput,
): SelectDecisionOptionResult {
  const at = input.at ?? new Date().toISOString();
  const next = clonePortfolio(portfolio);
  const index = next.decisions.findIndex((d) => d.id === input.decisionId);
  if (index < 0) {
    throw new Error(`Unknown decision: ${input.decisionId}`);
  }

  const decision = next.decisions[index]!;
  const alternative = decision.alternatives.find(
    (a) => a.id === input.alternativeId,
  );
  if (!alternative) {
    throw new Error(
      `Unknown alternative ${input.alternativeId} on decision ${input.decisionId}`,
    );
  }

  const isDefer = /defer/i.test(alternative.label) || /defer/i.test(alternative.id);
  const selectionState: ExecutiveSelectionState = isDefer
    ? "DECISION_DEFERRED"
    : "OPTION_SELECTED";
  const nextStatus = isDefer ? "deferred" : "under_review";

  const updated: Decision = {
    ...decision,
    status: nextStatus,
    executiveSelectionState: selectionState,
    selectedAlternativeId: alternative.id,
    selectedAlternativeLabel: alternative.label,
    originSnapshotId:
      input.snapshotId !== undefined
        ? input.snapshotId
        : decision.originSnapshotId ?? null,
    evidenceAtDecision: freezeEvidence(decision),
    decisionRecordedAt: at,
    whatShouldHappenNext: isDefer
      ? "Decision deferred — gather missing evidence before bind."
      : "Option selected by executive. Action may now be created. Approval remains a separate act.",
    recommendationSummary: `Executive selected: ${alternative.label}`,
    history: [
      ...decision.history,
      {
        id: `hist-select-${decision.id}-${at}`,
        at,
        status: nextStatus,
        note: `OPTION_SELECTED → ${alternative.label}. Executive selection recorded — not an automatic recommendation.`,
        actor: input.actor,
      },
    ],
    timeline: [
      ...decision.timeline,
      {
        id: `time-select-${decision.id}-${at}`,
        at,
        title: isDefer ? "Decision deferred" : "Option selected",
        detail: `Executive selected “${alternative.label}”. ExecutiveOS did not choose this option.`,
        kind: "approval",
      },
    ],
  };

  next.decisions[index] = updated;
  next.refreshedAt = at;

  return {
    portfolio: next,
    decision: updated,
    selectionState,
    selectedLabel: alternative.label,
    recordedAt: at,
  };
}

/**
 * Create a follow-through action only after an option has been selected.
 * Does not fabricate owner, due date, financial value, or confidence %.
 */
export function createActionFromSelectedDecision(
  portfolio: OutcomePortfolio,
  input: CreateActionFromDecisionInput,
): CreateActionFromDecisionResult {
  const at = input.at ?? new Date().toISOString();
  const next = clonePortfolio(portfolio);
  const index = next.decisions.findIndex((d) => d.id === input.decisionId);
  if (index < 0) {
    throw new Error(`Unknown decision: ${input.decisionId}`);
  }

  const decision = next.decisions[index]!;
  const state = deriveExecutiveSelectionState(decision);
  if (
    state !== "OPTION_SELECTED" &&
    state !== "DECISION_APPROVED" &&
    state !== "DECISION_DEFERRED"
  ) {
    throw new Error(
      "Action cannot be created before an executive option is selected.",
    );
  }
  if (!decision.selectedAlternativeId) {
    throw new Error(
      "Action cannot be created before an executive option is selected.",
    );
  }

  if (decisionHasLinkedAction(next, decision.id)) {
    const existing = next.outcomes
      .flatMap((o) => o.pendingActions)
      .find((a) => a.decisionId === decision.id);
    if (existing) {
      return {
        portfolio: next,
        action: existing,
        decision,
        recordedAt: at,
      };
    }
  }

  const actionLabel = frameActionFromSelectedOption(decision);
  const evidenceIds = (decision.evidenceAtDecision ?? decision.evidence).map(
    (e) => e.id,
  );
  const expectedOutcome =
    decision.expectedOutcomeImpact?.trim() ||
    decision.selectedAlternativeLabel ||
    "Strategic outcome not yet established.";

  const action: OutcomeActionRef = {
    id: `action-from-${decision.id}-${at.slice(0, 19).replace(/[:.]/g, "")}`,
    actionLabel,
    status: "pending",
    whatChanged: decision.whatChanged || decision.question,
    why: decision.why || "Follow-through from executive-selected decision option.",
    whatShouldHappenNext:
      "Assign an owner and due date when established — neither is fabricated by ExecutiveOS.",
    recommendation: {
      businessImpact: decision.businessImpact || "Not yet established",
      expectedOutcomeImpact: expectedOutcome,
      confidence: 0,
      owner: "Owner not yet assigned.",
      deadline: "Due date not yet assigned.",
    },
    decisionId: decision.id,
    snapshotId: decision.originSnapshotId ?? null,
    evidenceIds,
    actionConfidenceLabel: "Action confidence not yet established.",
    expectedOutcomeLabel: expectedOutcome,
  };

  const primaryOutcomeId = decision.outcomeIds[0];
  if (!primaryOutcomeId) {
    throw new Error("Decision has no linked outcome — cannot create action.");
  }

  next.outcomes = next.outcomes.map((outcome) => {
    if (outcome.id !== primaryOutcomeId) return outcome;
    return {
      ...outcome,
      pendingActions: [action, ...outcome.pendingActions],
      timeline: [
        ...outcome.timeline,
        {
          id: `tl-action-${action.id}`,
          at,
          title: "Action created from decision",
          detail: actionLabel,
          kind: "action" as const,
        },
      ],
    };
  });

  const updatedDecision: Decision = {
    ...decision,
    history: [
      ...decision.history,
      {
        id: `hist-action-${decision.id}-${at}`,
        at,
        status: decision.status,
        note: `Action created: ${actionLabel}`,
        actor: input.actor,
      },
    ],
    timeline: [
      ...decision.timeline,
      {
        id: `time-action-${decision.id}-${at}`,
        at,
        title: "Action created",
        detail: actionLabel,
        kind: "status",
      },
    ],
  };
  next.decisions[index] = updatedDecision;
  next.refreshedAt = at;
  next.statusLabel = "Execution underway — action created from executive decision";

  return {
    portfolio: next,
    action,
    decision: updatedDecision,
    recordedAt: at,
  };
}

/**
 * Assign owner and/or due date on an existing action.
 * Does not invent values — empty strings revert to honesty labels.
 */
export function assignActionAccountability(
  portfolio: OutcomePortfolio,
  input: {
    actionId: string;
    owner?: string | null;
    dueDate?: string | null;
    actor: string;
    at?: string;
  },
): { portfolio: OutcomePortfolio; action: OutcomeActionRef } {
  const at = input.at ?? new Date().toISOString();
  const next = clonePortfolio(portfolio);
  let found: OutcomeActionRef | null = null;

  for (const outcome of next.outcomes) {
    const idx = outcome.pendingActions.findIndex((a) => a.id === input.actionId);
    if (idx < 0) continue;
    const action = outcome.pendingActions[idx]!;
    const owner =
      input.owner !== undefined
        ? input.owner?.trim()
          ? input.owner.trim()
          : "Owner not yet assigned."
        : action.recommendation.owner;
    const deadline =
      input.dueDate !== undefined
        ? input.dueDate?.trim()
          ? input.dueDate.trim()
          : "Due date not yet assigned."
        : action.recommendation.deadline;

    const updated: OutcomeActionRef = {
      ...action,
      recommendation: {
        ...action.recommendation,
        owner,
        deadline,
      },
      whatShouldHappenNext:
        owner === "Owner not yet assigned." ||
        deadline === "Due date not yet assigned."
          ? "Assign an owner and due date when established — neither is fabricated by ExecutiveOS."
          : `Owned by ${owner}; due ${deadline}.`,
    };
    outcome.pendingActions[idx] = updated;
    found = updated;

    if (action.decisionId) {
      const dIdx = next.decisions.findIndex((d) => d.id === action.decisionId);
      if (dIdx >= 0) {
        const decision = next.decisions[dIdx]!;
        next.decisions[dIdx] = {
          ...decision,
          history: [
            ...decision.history,
            {
              id: `hist-account-${action.id}-${at}`,
              at,
              status: decision.status,
              note: `Accountability updated by ${input.actor}: owner=${owner}; due=${deadline}.`,
              actor: input.actor,
            },
          ],
        };
      }
    }
    break;
  }

  if (!found) {
    throw new Error(`Unknown action: ${input.actionId}`);
  }

  next.refreshedAt = at;
  return { portfolio: next, action: found };
}

/**
 * When approve/reject/defer run via applyDecisionAct, sync executiveSelectionState.
 */
export function selectionStateForDecisionAct(
  act: "approve" | "reject" | "defer" | string,
): ExecutiveSelectionState | null {
  if (act === "approve") return "DECISION_APPROVED";
  if (act === "reject") return "DECISION_REJECTED";
  if (act === "defer") return "DECISION_DEFERRED";
  return null;
}

/** Mark alternatives as identified without selecting. */
export function markOptionsIdentified(decision: Decision): Decision {
  if (decision.selectedAlternativeId) return decision;
  if (decision.alternatives.length === 0) return decision;
  if (decision.executiveSelectionState) return decision;
  return {
    ...decision,
    executiveSelectionState: "OPTION_IDENTIFIED",
  };
}
