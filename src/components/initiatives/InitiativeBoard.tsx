"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveInitiativeAction } from "@/lib/initiatives/actions";
import { InitiativeCard } from "@/components/initiatives/InitiativeCard";
import { InitiativeForm } from "@/components/initiatives/InitiativeForm";
import { InitiativeTimeline } from "@/components/initiatives/InitiativeTimeline";
import type {
  InitiativeLinkCatalog,
  InitiativeWithLinks,
} from "@/lib/initiatives/types";

type InitiativeBoardProps = {
  initialInitiatives: InitiativeWithLinks[];
  linkCatalog: InitiativeLinkCatalog;
};

export function InitiativeBoard({
  initialInitiatives,
  linkCatalog,
}: InitiativeBoardProps) {
  const router = useRouter();
  const [initiatives, setInitiatives] = useState(initialInitiatives);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InitiativeWithLinks | null>(
    null,
  );
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isArchiving, startArchive] = useTransition();

  const atRiskCount = initiatives.filter(
    (item) => item.initiative.health_status === "at_risk",
  ).length;
  const offTrackCount = initiatives.filter(
    (item) => item.initiative.health_status === "off_track",
  ).length;
  const activeCount = initiatives.filter(
    (item) => item.initiative.status === "active",
  ).length;

  function refreshList(nextItem: InitiativeWithLinks) {
    setInitiatives((current) => {
      const existingIndex = current.findIndex(
        (item) => item.initiative.id === nextItem.initiative.id,
      );

      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = nextItem;
        return next;
      }

      return [nextItem, ...current];
    });
  }

  function handleSaved(item: InitiativeWithLinks) {
    refreshList(item);
    setShowForm(false);
    setEditingItem(null);
    router.refresh();
  }

  function handleEdit(item: InitiativeWithLinks) {
    setEditingItem(item);
    setShowForm(true);
    setError(null);
  }

  function handleArchive(initiativeId: string) {
    setError(null);
    setArchivingId(initiativeId);

    startArchive(async () => {
      const result = await archiveInitiativeAction(initiativeId);

      if (result.error) {
        setError(result.error);
        setArchivingId(null);
        return;
      }

      setInitiatives((current) =>
        current.filter((item) => item.initiative.id !== initiativeId),
      );
      setArchivingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            Strategic Initiative Management
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Initiatives
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            Organise strategic work across objectives, decisions, meetings, and
            executive memory. Track progress and health in one place.
          </p>
        </div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
              setError(null);
            }}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            New Initiative
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Active
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {activeCount}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
            At Risk
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-900">
            {atRiskCount}
          </p>
        </div>
        <div className="rounded-xl border border-red-200/80 bg-red-50/50 px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-red-700">
            Off Track
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-red-900">
            {offTrackCount}
          </p>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {showForm ? (
        <InitiativeForm
          linkCatalog={linkCatalog}
          initialItem={editingItem}
          onSaved={handleSaved}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      ) : null}

      <InitiativeTimeline initiatives={initiatives} />

      <section>
        <h2 className="mb-6 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
          All Initiatives
        </h2>
        {initiatives.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {initiatives.map((item) => (
              <InitiativeCard
                key={item.initiative.id}
                item={item}
                onEdit={handleEdit}
                onArchive={handleArchive}
                archiving={isArchiving && archivingId === item.initiative.id}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-5 py-12 text-center">
            <p className="text-sm leading-6 text-zinc-600">
              No initiatives yet. Create your first strategic initiative to
              start tracking progress and health.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
