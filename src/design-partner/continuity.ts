/**
 * Phase 65 — Pilot continuity derived from snapshot / decision / action history.
 * Never invents continuity events.
 */

import type { ManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import type { ActiveExecutiveSnapshotContext } from "@/executive-snapshot-studio/launch";
import { compareManufacturingSnapshots } from "./snapshot-compare";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import {
  commandCentreStatusFromDecision,
  commandCentreStatusLabel,
  decisionHasLinkedAction,
  deriveExecutiveSelectionState,
} from "@/lib/decisions/decision-execution-linkage";

export type ContinuitySemanticState =
  | "NEW"
  | "CHANGED"
  | "UNCHANGED"
  | "IMPROVING"
  | "WORSENING"
  | "RESOLVED"
  | "SUPERSEDED"
  | "REQUIRES_ATTENTION"
  | "OVERDUE";

export type ContinuityItem = {
  id: string;
  state: ContinuitySemanticState;
  label: string;
  detail: string;
};

export type JudgementContinuity = {
  previousJudgement: string | null;
  currentJudgement: string;
  state: ContinuitySemanticState;
  label: string;
};

export type AccountabilityRow = {
  decisionId: string;
  decisionLabel: string;
  statusLabel: string;
  actionLabel: string | null;
  owner: string | null;
  due: string | null;
  lastChange: string;
  requiresAttention: boolean;
  overdue: boolean;
};

export type ContinuityBundle = {
  sinceYouLastLooked: ContinuityItem[];
  nothingMaterialChanged: boolean;
  judgement: JudgementContinuity;
  accountability: AccountabilityRow[];
  isolationDisclosure: string;
};

function isUnassigned(value: string | null | undefined): boolean {
  if (!value) return true;
  return /not yet assigned|not established|unknown/i.test(value);
}

function isOverdue(deadline: string | null | undefined, asOf: string): boolean {
  if (!deadline || isUnassigned(deadline)) return false;
  const due = Date.parse(deadline);
  const now = Date.parse(asOf);
  if (!Number.isFinite(due) || !Number.isFinite(now)) return false;
  return now > due;
}

export function resolveJudgementContinuity(input: {
  currentJudgement: string;
  previousJudgement: string | null;
  materialDemandChange: boolean;
  demandResolved: boolean;
}): JudgementContinuity {
  const current = input.currentJudgement;
  const previous = input.previousJudgement;

  if (!previous) {
    return {
      previousJudgement: null,
      currentJudgement: current,
      state: "NEW",
      label: "New judgement in the active snapshot",
    };
  }

  const sameLead =
    previous.trim().toLowerCase() === current.trim().toLowerCase() ||
    current.toLowerCase().includes(previous.slice(0, 24).toLowerCase()) ||
    previous.toLowerCase().includes(current.slice(0, 24).toLowerCase());

  if (input.demandResolved && !sameLead) {
    return {
      previousJudgement: previous,
      currentJudgement: current,
      state: "RESOLVED",
      label: "Previous judgement is no longer the lead signal",
    };
  }

  if (sameLead && input.materialDemandChange) {
    return {
      previousJudgement: previous,
      currentJudgement: current,
      state: "CHANGED",
      label: "Still material — movement since previous snapshot",
    };
  }

  if (sameLead) {
    return {
      previousJudgement: previous,
      currentJudgement: current,
      state: "UNCHANGED",
      label: "Still material",
    };
  }

  return {
    previousJudgement: previous,
    currentJudgement: current,
    state: "SUPERSEDED",
    label: "Superseded by a different lead judgement",
  };
}

export function buildAccountabilityRows(input: {
  portfolio: OutcomePortfolio;
  asOf?: string;
}): AccountabilityRow[] {
  const asOf = input.asOf ?? new Date().toISOString();
  const rows: AccountabilityRow[] = [];

  for (const decision of input.portfolio.decisions) {
    const hasAction = decisionHasLinkedAction(input.portfolio, decision.id);
    const action = input.portfolio.outcomes
      .flatMap((o) => o.pendingActions)
      .find((a) => a.decisionId === decision.id);
    const status = commandCentreStatusLabel(
      commandCentreStatusFromDecision(decision, hasAction),
    );
    const owner = action?.recommendation.owner ?? null;
    const due = action?.recommendation.deadline ?? null;
    const overdue = isOverdue(due, asOf);
    const unassigned = Boolean(action && isUnassigned(owner));
    const selection = deriveExecutiveSelectionState(decision);

    let lastChange = "No material movement recorded since decision.";
    if (selection === "OPTION_IDENTIFIED") {
      lastChange = "Executive selection required.";
    } else if (unassigned) {
      lastChange = "Follow-through remains unassigned.";
    } else if (overdue) {
      lastChange = "Due date has passed.";
    } else if (hasAction) {
      lastChange = "Execution underway.";
    }

    rows.push({
      decisionId: decision.id,
      decisionLabel:
        decision.selectedAlternativeLabel ||
        decision.question ||
        decision.id,
      statusLabel: status,
      actionLabel: action?.actionLabel ?? null,
      owner: owner && !isUnassigned(owner) ? owner : null,
      due: due && !isUnassigned(due) ? due : null,
      lastChange,
      requiresAttention:
        selection === "OPTION_IDENTIFIED" || unassigned || overdue,
      overdue,
    });
  }

  return rows;
}

export function buildSinceYouLastLooked(input: {
  current: ActiveExecutiveSnapshotContext;
  previous: ActiveExecutiveSnapshotContext | null;
  portfolio: OutcomePortfolio;
  leadJudgement: string;
  previousLeadJudgement: string | null;
}): ContinuityItem[] {
  const items: ContinuityItem[] = [];
  const currentAnalysis = input.current.manufacturingAnalysis ?? null;
  const previousAnalysis = input.previous?.manufacturingAnalysis ?? null;

  if (!input.previous) {
    items.push({
      id: "new-snapshot",
      state: "NEW",
      label: "Active snapshot established",
      detail: `${input.leadJudgement}`,
    });
  } else if (currentAnalysis && previousAnalysis) {
    const comparison = compareManufacturingSnapshots({
      currentId: input.current.snapshotId,
      previousId: input.previous.snapshotId,
      currentConfidence: input.current.confidenceOverall,
      previousConfidence: input.previous.confidenceOverall,
      currentReadiness: input.current.readiness,
      previousReadiness: input.previous.readiness,
      currentAnalysis,
      previousAnalysis,
    });

    const demand = comparison.changes.filter((c) => c.category === "demand");
    for (const change of demand.slice(0, 2)) {
      items.push({
        id: change.id,
        state: "CHANGED",
        label: change.label,
        detail: change.detail,
      });
    }

    const capacity = comparison.changes.find((c) => c.category === "capacity");
    if (capacity) {
      items.push({
        id: capacity.id,
        state: /increased|pressure/i.test(capacity.deltaLabel ?? "")
          ? "WORSENING"
          : "CHANGED",
        label: capacity.label,
        detail: capacity.deltaLabel ?? capacity.detail,
      });
    }

    const inventory = comparison.changes.find((c) => c.category === "inventory");
    if (inventory) {
      items.push({
        id: inventory.id,
        state: "CHANGED",
        label: inventory.label,
        detail: inventory.deltaLabel ?? inventory.detail,
      });
    }
  }

  const judgement = resolveJudgementContinuity({
    currentJudgement: input.leadJudgement,
    previousJudgement: input.previousLeadJudgement,
    materialDemandChange: items.some((i) => i.state === "CHANGED"),
    demandResolved: Boolean(
      input.previousLeadJudgement &&
        !input.leadJudgement
          .toLowerCase()
          .includes(input.previousLeadJudgement.slice(0, 18).toLowerCase()),
    ),
  });

  if (judgement.state === "UNCHANGED" || judgement.state === "CHANGED") {
    items.unshift({
      id: "judgement-continuity",
      state: judgement.state,
      label: input.leadJudgement,
      detail: judgement.label,
    });
  } else if (judgement.state === "RESOLVED" || judgement.state === "SUPERSEDED") {
    items.unshift({
      id: "judgement-continuity",
      state: judgement.state,
      label: judgement.previousJudgement ?? input.leadJudgement,
      detail: judgement.label,
    });
  }

  const accountability = buildAccountabilityRows({
    portfolio: input.portfolio,
  });
  for (const row of accountability) {
    if (row.overdue) {
      items.push({
        id: `overdue-${row.decisionId}`,
        state: "OVERDUE",
        label: row.actionLabel ?? row.decisionLabel,
        detail: "Action remains incomplete beyond its expected date.",
      });
    } else if (row.requiresAttention && row.actionLabel) {
      items.push({
        id: `unassigned-${row.decisionId}`,
        state: "REQUIRES_ATTENTION",
        label: row.actionLabel,
        detail: "Decision selected but follow-through remains unassigned.",
      });
    } else if (
      row.statusLabel.toLowerCase().includes("decision required")
    ) {
      items.push({
        id: `pending-${row.decisionId}`,
        state: "REQUIRES_ATTENTION",
        label: row.decisionLabel,
        detail: "Executive selection required.",
      });
    }
  }

  // De-dupe by id, keep first three material
  const seen = new Set<string>();
  return items
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 5);
}

export function buildContinuityBundle(input: {
  current: ActiveExecutiveSnapshotContext;
  previous: ActiveExecutiveSnapshotContext | null;
  portfolio: OutcomePortfolio;
  leadJudgement: string;
}): ContinuityBundle {
  const previousLead =
    input.previous?.manufacturingBrief?.whatChanged?.[0] ??
    input.previous?.manufacturingAnalysis?.insights.find(
      (i) => i.category === "demand_movement",
    )?.title ??
    null;

  const sinceYouLastLooked = buildSinceYouLastLooked({
    current: input.current,
    previous: input.previous,
    portfolio: input.portfolio,
    leadJudgement: input.leadJudgement,
    previousLeadJudgement: previousLead,
  });

  const judgement = resolveJudgementContinuity({
    currentJudgement: input.leadJudgement,
    previousJudgement: previousLead,
    materialDemandChange: sinceYouLastLooked.some(
      (i) => i.state === "CHANGED" || i.state === "WORSENING",
    ),
    demandResolved: Boolean(
      previousLead &&
        !input.leadJudgement
          .toLowerCase()
          .includes(previousLead.slice(0, 18).toLowerCase()),
    ),
  });

  const profileLabel =
    input.current.profileId === "manufacturing"
      ? "Manufacturing Forecast Snapshot"
      : input.current.profileId === "commercial"
        ? "Commercial Snapshot"
        : "Executive Snapshot";

  return {
    sinceYouLastLooked,
    nothingMaterialChanged:
      sinceYouLastLooked.length === 0 ||
      (sinceYouLastLooked.length === 1 &&
        sinceYouLastLooked[0]?.state === "UNCHANGED"),
    judgement,
    accountability: buildAccountabilityRows({
      portfolio: input.portfolio,
    }),
    isolationDisclosure: `Executive intelligence based on the active ${profileLabel}.`,
  };
}

export function findPreviousSnapshot(
  current: ActiveExecutiveSnapshotContext,
  library: ActiveExecutiveSnapshotContext[],
): ActiveExecutiveSnapshotContext | null {
  const peers = library
    .filter(
      (s) =>
        s.organisationId === current.organisationId &&
        s.snapshotId !== current.snapshotId &&
        s.profileId === current.profileId,
    )
    .sort((a, b) => b.activatedAt.localeCompare(a.activatedAt));
  return peers[0] ?? null;
}
