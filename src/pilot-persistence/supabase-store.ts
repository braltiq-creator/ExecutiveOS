/**
 * Supabase-backed pilot operating-loop persistence.
 * Falls back only when tables are unavailable is NOT done — callers choose backend.
 */

import { createClient } from "@/lib/supabase/server";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type {
  ActiveExecutiveSnapshotContext,
} from "@/executive-snapshot-studio/launch/executive-snapshot-context";
import type {
  DurableSnapshotRecord,
  PilotPersistenceBackend,
} from "./types";
import { syncDecisionActionRows } from "./types";

function mapSnapshotRow(row: {
  id: string;
  organization_id: string;
  studio_id: string | null;
  profile_id: string;
  profile_label: string | null;
  organisation_name: string | null;
  source_kind: string | null;
  filename: string | null;
  record_count: number;
  confidence_overall: number | null;
  context_payload: ActiveExecutiveSnapshotContext;
  created_by: string | null;
  created_at: string;
}): DurableSnapshotRecord {
  return {
    snapshotId: row.id,
    organisationId: row.organization_id,
    studioId: row.studio_id ?? undefined,
    profileId: row.profile_id,
    profileLabel: row.profile_label ?? undefined,
    organisationName: row.organisation_name ?? undefined,
    sourceKind: row.source_kind ?? undefined,
    filename: row.filename ?? undefined,
    recordCount: row.record_count,
    confidenceOverall: row.confidence_overall ?? undefined,
    context: row.context_payload,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function createSupabasePilotPersistence(): PilotPersistenceBackend {
  return {
    kind: "supabase",

    async saveSnapshot(record) {
      const supabase = await createClient();
      const { data: existing } = await supabase
        .from("pilot_executive_snapshots")
        .select("id")
        .eq("id", record.snapshotId)
        .eq("organization_id", record.organisationId)
        .maybeSingle();

      if (existing) {
        // Immutability: do not overwrite context_payload.
        return;
      }

      const { error } = await supabase.from("pilot_executive_snapshots").insert({
        id: record.snapshotId,
        organization_id: record.organisationId,
        studio_id: record.studioId ?? null,
        profile_id: record.profileId,
        profile_label: record.profileLabel ?? null,
        organisation_name: record.organisationName ?? null,
        source_kind: record.sourceKind ?? null,
        filename: record.filename ?? null,
        record_count: record.recordCount,
        confidence_overall: record.confidenceOverall ?? null,
        context_payload: record.context,
        created_by: record.createdBy ?? null,
        created_at: record.createdAt,
      });

      if (error) {
        throw new Error("Unable to persist Executive Snapshot.");
      }

      await this.savePortfolio({
        organisationId: record.organisationId,
        originSnapshotId: record.snapshotId,
        portfolio: record.context.portfolio,
        updatedBy: record.createdBy,
      });
    },

    async getSnapshot(organisationId, snapshotId) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("pilot_executive_snapshots")
        .select("*")
        .eq("id", snapshotId)
        .eq("organization_id", organisationId)
        .maybeSingle();
      if (error || !data) return null;
      return mapSnapshotRow(data as Parameters<typeof mapSnapshotRow>[0]);
    },

    async listSnapshots(organisationId) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("pilot_executive_snapshots")
        .select("*")
        .eq("organization_id", organisationId)
        .order("created_at", { ascending: false });
      if (error || !data) return [];
      return (data as Array<Parameters<typeof mapSnapshotRow>[0]>).map(
        mapSnapshotRow,
      );
    },

    async savePortfolio(input) {
      const supabase = await createClient();
      const { error } = await supabase.from("pilot_outcome_portfolios").upsert(
        {
          organization_id: input.organisationId,
          origin_snapshot_id: input.originSnapshotId,
          portfolio: input.portfolio,
          updated_at: new Date().toISOString(),
          updated_by: input.updatedBy ?? null,
        },
        { onConflict: "organization_id,origin_snapshot_id" },
      );
      if (error) {
        throw new Error("Unable to persist portfolio state.");
      }

      const synced = syncDecisionActionRows(
        input.organisationId,
        input.originSnapshotId,
        input.portfolio,
      );

      for (const d of synced.decisions) {
        const { error: dErr } = await supabase.from("pilot_decisions").upsert(
          {
            id: d.id,
            organization_id: d.organisationId,
            origin_snapshot_id: d.originSnapshotId,
            selection_state: d.selectionState,
            payload: d.payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "organization_id,id" },
        );
        if (dErr) {
          throw new Error("Unable to persist decision state.");
        }
      }

      for (const a of synced.actions) {
        const { error: aErr } = await supabase.from("pilot_actions").upsert(
          {
            id: a.id,
            organization_id: a.organisationId,
            decision_id: a.decisionId,
            origin_snapshot_id: a.originSnapshotId,
            owner: a.owner,
            due_date: a.dueDate,
            payload: a.payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "organization_id,id" },
        );
        if (aErr) {
          throw new Error("Unable to persist action state.");
        }
      }
    },

    async getPortfolio(organisationId, originSnapshotId) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("pilot_outcome_portfolios")
        .select("portfolio")
        .eq("organization_id", organisationId)
        .eq("origin_snapshot_id", originSnapshotId)
        .maybeSingle();
      if (error || !data) return null;
      return data.portfolio as OutcomePortfolio;
    },

    async listDecisions(organisationId) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("pilot_decisions")
        .select("id, origin_snapshot_id, selection_state, payload")
        .eq("organization_id", organisationId);
      if (error || !data) return [];
      return data.map((row) => ({
        id: row.id as string,
        originSnapshotId: row.origin_snapshot_id as string,
        selectionState: row.selection_state as string | null,
        decision: row.payload as import("@/lib/decisions/engine-types").Decision,
      }));
    },

    async listActions(organisationId) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("pilot_actions")
        .select("id, decision_id, origin_snapshot_id, payload")
        .eq("organization_id", organisationId);
      if (error || !data) return [];
      return data.map((row) => ({
        id: row.id as string,
        decisionId: row.decision_id as string,
        originSnapshotId: row.origin_snapshot_id as string,
        action: row.payload as import("@/lib/outcomes/types").OutcomeActionRef,
      }));
    },
  };
}
