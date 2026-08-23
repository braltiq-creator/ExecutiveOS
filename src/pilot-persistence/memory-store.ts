/**
 * In-memory durable backend for tests and non-Supabase local runs.
 * Documented as process-local cache that implements the same contract as Supabase.
 * Cleared between tests via clearPilotPersistenceMemory().
 */

import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type {
  DurableSnapshotRecord,
  PilotPersistenceBackend,
} from "./types";
import { syncDecisionActionRows } from "./types";

type PortfolioRow = {
  organisationId: string;
  originSnapshotId: string;
  portfolio: OutcomePortfolio;
  updatedAt: string;
  updatedBy?: string | null;
};

type DecisionRow = {
  id: string;
  organisationId: string;
  originSnapshotId: string;
  selectionState: string | null;
  payload: import("@/lib/decisions/engine-types").Decision;
};

type ActionRow = {
  id: string;
  organisationId: string;
  decisionId: string;
  originSnapshotId: string;
  owner: string | null;
  dueDate: string | null;
  payload: import("@/lib/outcomes/types").OutcomeActionRef;
};

const snapshots = new Map<string, DurableSnapshotRecord>();
const portfolios = new Map<string, PortfolioRow>();
const decisions = new Map<string, DecisionRow>();
const actions = new Map<string, ActionRow>();

function snapKey(org: string, id: string) {
  return `${org}::${id}`;
}

function portfolioKey(org: string, snapshotId: string) {
  return `${org}::${snapshotId}`;
}

function decisionKey(org: string, id: string) {
  return `${org}::${id}`;
}

function actionKey(org: string, id: string) {
  return `${org}::${id}`;
}

export function clearPilotPersistenceMemory(): void {
  snapshots.clear();
  portfolios.clear();
  decisions.clear();
  actions.clear();
}

export function createMemoryPilotPersistence(): PilotPersistenceBackend {
  return {
    kind: "memory",

    async saveSnapshot(record) {
      const key = snapKey(record.organisationId, record.snapshotId);
      if (snapshots.has(key)) {
        // Immutability: refuse overwrite of existing snapshot payload.
        const existing = snapshots.get(key)!;
        if (
          JSON.stringify(existing.context.snapshotId) !==
            JSON.stringify(record.context.snapshotId) ||
          existing.organisationId !== record.organisationId
        ) {
          throw new Error("Snapshot is immutable and cannot be overwritten.");
        }
        return;
      }
      snapshots.set(key, structuredClone(record));
      await this.savePortfolio({
        organisationId: record.organisationId,
        originSnapshotId: record.snapshotId,
        portfolio: record.context.portfolio,
        updatedBy: record.createdBy,
      });
    },

    async getSnapshot(organisationId, snapshotId) {
      const row = snapshots.get(snapKey(organisationId, snapshotId));
      return row ? structuredClone(row) : null;
    },

    async listSnapshots(organisationId) {
      return [...snapshots.values()]
        .filter((s) => s.organisationId === organisationId)
        .map((s) => structuredClone(s))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async savePortfolio(input) {
      const snap = snapshots.get(
        snapKey(input.organisationId, input.originSnapshotId),
      );
      if (!snap) {
        throw new Error("Cannot save portfolio without durable snapshot.");
      }
      portfolios.set(portfolioKey(input.organisationId, input.originSnapshotId), {
        organisationId: input.organisationId,
        originSnapshotId: input.originSnapshotId,
        portfolio: structuredClone(input.portfolio),
        updatedAt: new Date().toISOString(),
        updatedBy: input.updatedBy,
      });

      const synced = syncDecisionActionRows(
        input.organisationId,
        input.originSnapshotId,
        input.portfolio,
      );
      for (const d of synced.decisions) {
        decisions.set(decisionKey(d.organisationId, d.id), {
          id: d.id,
          organisationId: d.organisationId,
          originSnapshotId: d.originSnapshotId,
          selectionState: d.selectionState,
          payload: structuredClone(d.payload),
        });
      }
      for (const a of synced.actions) {
        actions.set(actionKey(a.organisationId, a.id), {
          id: a.id,
          organisationId: a.organisationId,
          decisionId: a.decisionId,
          originSnapshotId: a.originSnapshotId,
          owner: a.owner,
          dueDate: a.dueDate,
          payload: structuredClone(a.payload),
        });
      }
    },

    async getPortfolio(organisationId, originSnapshotId) {
      const row = portfolios.get(portfolioKey(organisationId, originSnapshotId));
      return row ? structuredClone(row.portfolio) : null;
    },

    async listDecisions(organisationId) {
      return [...decisions.values()]
        .filter((d) => d.organisationId === organisationId)
        .map((d) => ({
          id: d.id,
          originSnapshotId: d.originSnapshotId,
          selectionState: d.selectionState,
          decision: structuredClone(d.payload),
        }));
    },

    async listActions(organisationId) {
      return [...actions.values()]
        .filter((a) => a.organisationId === organisationId)
        .map((a) => ({
          id: a.id,
          decisionId: a.decisionId,
          originSnapshotId: a.originSnapshotId,
          action: structuredClone(a.payload),
        }));
    },

    clearAll() {
      clearPilotPersistenceMemory();
    },
  };
}
