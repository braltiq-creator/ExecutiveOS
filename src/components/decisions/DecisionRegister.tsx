"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveDecisionAction } from "@/lib/decisions/actions";
import { DecisionForm } from "@/components/decisions/DecisionForm";
import { DecisionList } from "@/components/decisions/DecisionList";
import { DecisionTimeline } from "@/components/decisions/DecisionTimeline";
import type { ExecutiveDecisionRecord } from "@/lib/decisions/types";
import type { StrategicObjective } from "@/types/onboarding";

type DecisionRegisterProps = {
  initialDecisions: ExecutiveDecisionRecord[];
  initialTimeline: ExecutiveDecisionRecord[];
  objectives: StrategicObjective[];
};

export function DecisionRegister({
  initialDecisions,
  initialTimeline,
  objectives,
}: DecisionRegisterProps) {
  const router = useRouter();
  const [decisions, setDecisions] = useState(initialDecisions);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [showForm, setShowForm] = useState(false);
  const [editingDecision, setEditingDecision] =
    useState<ExecutiveDecisionRecord | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isArchiving, startArchive] = useTransition();

  function refreshLists(nextDecision: ExecutiveDecisionRecord) {
    setDecisions((current) => {
      const existingIndex = current.findIndex(
        (item) => item.id === nextDecision.id,
      );

      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = nextDecision;
        return next;
      }

      return [nextDecision, ...current];
    });

    setTimeline((current) => {
      const existingIndex = current.findIndex(
        (item) => item.id === nextDecision.id,
      );

      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = nextDecision;
        return next.sort(
          (left, right) =>
            new Date(right.decision_date).getTime() -
            new Date(left.decision_date).getTime(),
        );
      }

      return [nextDecision, ...current].sort(
        (left, right) =>
          new Date(right.decision_date).getTime() -
          new Date(left.decision_date).getTime(),
      );
    });
  }

  function handleSaved(decision: ExecutiveDecisionRecord) {
    refreshLists(decision);
    setShowForm(false);
    setEditingDecision(null);
    router.refresh();
  }

  function handleEdit(decision: ExecutiveDecisionRecord) {
    setEditingDecision(decision);
    setShowForm(true);
    setError(null);
  }

  function handleArchive(decisionId: string) {
    setError(null);
    setArchivingId(decisionId);

    startArchive(async () => {
      const result = await archiveDecisionAction(decisionId);

      if (result.error) {
        setError(result.error);
        setArchivingId(null);
        return;
      }

      setDecisions((current) =>
        current.filter((decision) => decision.id !== decisionId),
      );
      setTimeline((current) =>
        current.filter((decision) => decision.id !== decisionId),
      );
      setArchivingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Decision Register</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Executive Decisions
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            Capture, track, and review important business decisions. Each saved
            decision syncs to Executive Memory for your Chief of Staff.
          </p>
        </div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => {
              setEditingDecision(null);
              setShowForm(true);
              setError(null);
            }}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            New Decision
          </button>
        ) : null}
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
        <DecisionForm
          objectives={objectives}
          initialDecision={editingDecision}
          onSaved={handleSaved}
          onCancel={() => {
            setShowForm(false);
            setEditingDecision(null);
          }}
        />
      ) : null}

      <DecisionTimeline decisions={timeline} />

      <section>
        <h2 className="mb-6 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
          All Decisions
        </h2>
        <DecisionList
          decisions={decisions}
          onEdit={handleEdit}
          onArchive={handleArchive}
          archivingId={isArchiving ? archivingId : null}
        />
      </section>
    </div>
  );
}
