/**
 * Server actions — durable pilot Snapshot / Decision / Action persistence.
 */

"use server";

import { requireStudioActor } from "@/executive-snapshot-studio/server/auth";
import type { ActiveExecutiveSnapshotContext } from "@/executive-snapshot-studio/launch/executive-snapshot-context";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import { getPilotPersistence } from "./index";

export type PersistResult =
  | { ok: true }
  | { ok: false; error: string; code?: "UNAUTHENTICATED" | "FORBIDDEN" };

export type LoadContextResult =
  | { ok: true; context: ActiveExecutiveSnapshotContext; portfolio: OutcomePortfolio }
  | { ok: false; error: string; code?: "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" };

export async function persistPilotSnapshotAction(input: {
  context: ActiveExecutiveSnapshotContext;
}): Promise<PersistResult> {
  const actor = await requireStudioActor(input.context.organisationId);
  if (!actor.ok) {
    return { ok: false, error: actor.error, code: actor.code };
  }

  try {
    const store = getPilotPersistence();
    await store.saveSnapshot({
      snapshotId: input.context.snapshotId,
      organisationId: actor.organisationId,
      studioId: input.context.studioId,
      profileId: input.context.profileId,
      profileLabel: input.context.profileLabel,
      organisationName: input.context.organisationName,
      sourceKind: input.context.sourceKind,
      filename: input.context.filename,
      recordCount: input.context.recordCount,
      confidenceOverall: input.context.confidenceOverall,
      context: {
        ...input.context,
        organisationId: actor.organisationId,
      },
      createdBy: actor.userId,
      createdAt: input.context.activatedAt || new Date().toISOString(),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to persist Executive Snapshot." };
  }
}

export async function persistPilotPortfolioAction(input: {
  organisationId: string;
  originSnapshotId: string;
  portfolio: OutcomePortfolio;
}): Promise<PersistResult> {
  const actor = await requireStudioActor(input.organisationId);
  if (!actor.ok) {
    return { ok: false, error: actor.error, code: actor.code };
  }

  try {
    const store = getPilotPersistence();
    const existing = await store.getSnapshot(
      actor.organisationId,
      input.originSnapshotId,
    );
    if (!existing) {
      return { ok: false, error: "Snapshot not found for this organisation." };
    }

    await store.savePortfolio({
      organisationId: actor.organisationId,
      originSnapshotId: input.originSnapshotId,
      portfolio: input.portfolio,
      updatedBy: actor.userId,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to persist portfolio state." };
  }
}

export async function loadPilotSnapshotAction(input: {
  organisationId?: string;
  snapshotId: string;
}): Promise<LoadContextResult> {
  const actor = await requireStudioActor(input.organisationId);
  if (!actor.ok) {
    return { ok: false, error: actor.error, code: actor.code };
  }

  const store = getPilotPersistence();
  const record = await store.getSnapshot(actor.organisationId, input.snapshotId);
  if (!record) {
    return { ok: false, error: "Executive Snapshot unavailable.", code: "NOT_FOUND" };
  }

  const portfolio =
    (await store.getPortfolio(actor.organisationId, input.snapshotId)) ??
    record.context.portfolio;

  return {
    ok: true,
    context: {
      ...record.context,
      organisationId: actor.organisationId,
      portfolio,
    },
    portfolio,
  };
}

export async function listPilotSnapshotsAction(input?: {
  organisationId?: string;
}): Promise<
  | {
      ok: true;
      snapshots: Array<{
        snapshotId: string;
        organisationId: string;
        organisationName?: string;
        profileId: string;
        activatedAt: string;
      }>;
    }
  | { ok: false; error: string; code?: "UNAUTHENTICATED" | "FORBIDDEN" }
> {
  const actor = await requireStudioActor(input?.organisationId);
  if (!actor.ok) {
    return { ok: false, error: actor.error, code: actor.code };
  }

  const store = getPilotPersistence();
  const rows = await store.listSnapshots(actor.organisationId);
  return {
    ok: true,
    snapshots: rows.map((r) => ({
      snapshotId: r.snapshotId,
      organisationId: r.organisationId,
      organisationName: r.organisationName,
      profileId: r.profileId,
      activatedAt: r.createdAt,
    })),
  };
}
