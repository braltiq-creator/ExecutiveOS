"use client";

import { useState, useTransition } from "react";
import { saveDecisionAction } from "@/lib/decisions/actions";
import {
  DECISION_RISK_LEVELS,
  DECISION_STATUSES,
  formatDecisionRiskLevel,
  formatDecisionStatus,
} from "@/lib/decisions/types";
import type {
  DecisionRiskLevel,
  DecisionStatus,
  ExecutiveDecisionRecord,
  SaveDecisionInput,
} from "@/lib/decisions/types";
import type { StrategicObjective } from "@/types/onboarding";

type DecisionFormProps = {
  objectives: StrategicObjective[];
  initialDecision?: ExecutiveDecisionRecord | null;
  onSaved: (decision: ExecutiveDecisionRecord) => void;
  onCancel: () => void;
};

function toFormState(
  decision?: ExecutiveDecisionRecord | null,
): SaveDecisionInput {
  return {
    id: decision?.id,
    title: decision?.title ?? "",
    summary: decision?.summary ?? "",
    decisionReason: decision?.decision_reason ?? "",
    alternativesConsidered: decision?.alternatives_considered ?? "",
    expectedOutcome: decision?.expected_outcome ?? "",
    status: decision?.status ?? "draft",
    owner: decision?.owner ?? "",
    decisionDate:
      decision?.decision_date ?? new Date().toISOString().slice(0, 10),
    reviewDate: decision?.review_date ?? "",
    strategicObjectiveId: decision?.strategic_objective_id ?? "",
    riskLevel: decision?.risk_level ?? "medium",
  };
}

const inputClassName =
  "block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

export function DecisionForm({
  objectives,
  initialDecision = null,
  onSaved,
  onCancel,
}: DecisionFormProps) {
  const [form, setForm] = useState<SaveDecisionInput>(() =>
    toFormState(initialDecision),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof SaveDecisionInput>(
    key: K,
    value: SaveDecisionInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveDecisionAction({
        ...form,
        strategicObjectiveId: form.strategicObjectiveId || undefined,
        reviewDate: form.reviewDate || undefined,
        alternativesConsidered: form.alternativesConsidered || undefined,
      });

      if (result.error || !result.decision) {
        setError(result.error ?? "Unable to save decision.");
        return;
      }

      onSaved(result.decision);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
          {initialDecision ? "Edit Decision" : "Create Decision"}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Capture a decision for your executive register. It will sync to
          Executive Memory automatically.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-zinc-900">Title</span>
            <input
              className={inputClassName}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
              disabled={isPending}
            />
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-zinc-900">Summary</span>
            <textarea
              className={`${inputClassName} min-h-24 resize-y`}
              value={form.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              required
              disabled={isPending}
            />
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-zinc-900">
              Decision reason
            </span>
            <textarea
              className={`${inputClassName} min-h-24 resize-y`}
              value={form.decisionReason}
              onChange={(event) =>
                updateField("decisionReason", event.target.value)
              }
              required
              disabled={isPending}
            />
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-zinc-900">
              Alternatives considered
            </span>
            <textarea
              className={`${inputClassName} min-h-20 resize-y`}
              value={form.alternativesConsidered ?? ""}
              onChange={(event) =>
                updateField("alternativesConsidered", event.target.value)
              }
              disabled={isPending}
            />
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-zinc-900">
              Expected outcome
            </span>
            <textarea
              className={`${inputClassName} min-h-20 resize-y`}
              value={form.expectedOutcome}
              onChange={(event) =>
                updateField("expectedOutcome", event.target.value)
              }
              required
              disabled={isPending}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-900">Status</span>
            <select
              className={inputClassName}
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value as DecisionStatus)
              }
              disabled={isPending}
            >
              {DECISION_STATUSES.filter((status) => status !== "archived").map(
                (status) => (
                  <option key={status} value={status}>
                    {formatDecisionStatus(status)}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-900">Risk level</span>
            <select
              className={inputClassName}
              value={form.riskLevel}
              onChange={(event) =>
                updateField("riskLevel", event.target.value as DecisionRiskLevel)
              }
              disabled={isPending}
            >
              {DECISION_RISK_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {formatDecisionRiskLevel(level)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-900">Owner</span>
            <input
              className={inputClassName}
              value={form.owner}
              onChange={(event) => updateField("owner", event.target.value)}
              required
              disabled={isPending}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-900">
              Strategic objective
            </span>
            <select
              className={inputClassName}
              value={form.strategicObjectiveId ?? ""}
              onChange={(event) =>
                updateField("strategicObjectiveId", event.target.value)
              }
              disabled={isPending}
            >
              <option value="">None linked</option>
              {objectives.map((objective) => (
                <option key={objective.id} value={objective.id}>
                  {objective.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-900">
              Decision date
            </span>
            <input
              type="date"
              className={inputClassName}
              value={form.decisionDate}
              onChange={(event) =>
                updateField("decisionDate", event.target.value)
              }
              required
              disabled={isPending}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-900">
              Review date
            </span>
            <input
              type="date"
              className={inputClassName}
              value={form.reviewDate ?? ""}
              onChange={(event) => updateField("reviewDate", event.target.value)}
              disabled={isPending}
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
        >
          {isPending ? "Saving..." : initialDecision ? "Save Changes" : "Create Decision"}
        </button>
      </div>
    </form>
  );
}
