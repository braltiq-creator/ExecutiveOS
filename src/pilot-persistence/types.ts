/**
 * Pilot operating-loop persistence — durable org-scoped SoT.
 *
 * Browser sessionStorage may hold transient active snapshot id/context for UX.
 * Process Maps in data-gateway remain ingestion caches only — not authoritative.
 */

import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type { Decision } from "@/lib/decisions/engine-types";
import type { OutcomeActionRef } from "@/lib/outcomes/types";
import type { ActiveExecutiveSnapshotContext } from "@/executive-snapshot-studio/launch/executive-snapshot-context";

export type DurableSnapshotRecord = {
  snapshotId: string;
  organisationId: string;
  studioId?: string;
  profileId: string;
  profileLabel?: string;
  organisationName?: string;
  sourceKind?: string;
  filename?: string;
  recordCount: number;
  confidenceOverall?: number;
  context: ActiveExecutiveSnapshotContext;
  createdBy?: string | null;
  createdAt: string;
};

export type PilotPersistenceBackend = {
  readonly kind: "memory" | "supabase";
  saveSnapshot(record: DurableSnapshotRecord): Promise<void>;
  getSnapshot(
    organisationId: string,
    snapshotId: string,
  ): Promise<DurableSnapshotRecord | null>;
  listSnapshots(organisationId: string): Promise<DurableSnapshotRecord[]>;
  savePortfolio(input: {
    organisationId: string;
    originSnapshotId: string;
    portfolio: OutcomePortfolio;
    updatedBy?: string | null;
  }): Promise<void>;
  getPortfolio(
    organisationId: string,
    originSnapshotId: string,
  ): Promise<OutcomePortfolio | null>;
  listDecisions(organisationId: string): Promise<
    Array<{
      id: string;
      originSnapshotId: string;
      selectionState?: string | null;
      decision: Decision;
    }>
  >;
  listActions(organisationId: string): Promise<
    Array<{
      id: string;
      decisionId: string;
      originSnapshotId: string;
      action: OutcomeActionRef;
    }>
  >;
  clearAll?(): void;
};

function extractActions(
  portfolio: OutcomePortfolio,
): Array<{ action: OutcomeActionRef; decisionId: string }> {
  const out: Array<{ action: OutcomeActionRef; decisionId: string }> = [];
  for (const outcome of portfolio.outcomes) {
    for (const action of outcome.pendingActions) {
      if (action.decisionId) {
        out.push({ action, decisionId: action.decisionId });
      }
    }
  }
  return out;
}

export function syncDecisionActionRows(
  organisationId: string,
  originSnapshotId: string,
  portfolio: OutcomePortfolio,
): {
  decisions: Array<{
    id: string;
    organisationId: string;
    originSnapshotId: string;
    selectionState: string | null;
    payload: Decision;
  }>;
  actions: Array<{
    id: string;
    organisationId: string;
    decisionId: string;
    originSnapshotId: string;
    owner: string | null;
    dueDate: string | null;
    payload: OutcomeActionRef;
  }>;
} {
  const decisions = portfolio.decisions.map((d) => ({
    id: d.id,
    organisationId,
    originSnapshotId: d.originSnapshotId ?? originSnapshotId,
    selectionState: d.executiveSelectionState ?? null,
    payload: d,
  }));

  const actions = extractActions(portfolio).map(({ action, decisionId }) => ({
    id: action.id,
    organisationId,
    decisionId,
    originSnapshotId: action.snapshotId ?? originSnapshotId,
    owner: action.recommendation?.owner ?? null,
    dueDate: action.recommendation?.deadline ?? null,
    payload: action,
  }));

  return { decisions, actions };
}
