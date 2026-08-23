"use client";

import { useMemo, useState, useTransition } from "react";
import { saveInitiativeAction } from "@/lib/initiatives/actions";
import {
  INITIATIVE_LINK_LABELS,
  INITIATIVE_PRIORITIES,
  INITIATIVE_STATUSES,
  formatInitiativePriority,
  formatInitiativeStatus,
} from "@/lib/initiatives/types";
import type {
  InitiativeLinkCatalog,
  InitiativeLinkOption,
  InitiativeLinkType,
  InitiativePriority,
  InitiativeStatus,
  InitiativeWithLinks,
  SaveInitiativeInput,
} from "@/lib/initiatives/types";

type InitiativeFormProps = {
  linkCatalog: InitiativeLinkCatalog;
  initialItem?: InitiativeWithLinks | null;
  onSaved: (item: InitiativeWithLinks) => void;
  onCancel: () => void;
};

function toFormState(item?: InitiativeWithLinks | null): SaveInitiativeInput {
  return {
    id: item?.initiative.id,
    title: item?.initiative.title ?? "",
    description: item?.initiative.description ?? "",
    status: item?.initiative.status ?? "planned",
    priority: item?.initiative.priority ?? "medium",
    owner: item?.initiative.owner ?? "",
    startDate:
      item?.initiative.start_date ?? new Date().toISOString().slice(0, 10),
    targetDate: item?.initiative.target_date ?? "",
    progressPercentage: item?.initiative.progress_percentage ?? 0,
    links:
      item?.links.map((link) => ({
        linkType: link.link_type,
        linkedId: link.linked_id,
      })) ?? [],
  };
}

function linkKey(linkType: InitiativeLinkType, linkedId: string): string {
  return `${linkType}:${linkedId}`;
}

function catalogSections(
  catalog: InitiativeLinkCatalog,
): Array<{ type: InitiativeLinkType; label: string; options: InitiativeLinkOption[] }> {
  return [
    { type: "objective", label: INITIATIVE_LINK_LABELS.objective, options: catalog.objectives },
    { type: "decision", label: INITIATIVE_LINK_LABELS.decision, options: catalog.decisions },
    { type: "meeting", label: INITIATIVE_LINK_LABELS.meeting, options: catalog.meetings },
    { type: "memory", label: INITIATIVE_LINK_LABELS.memory, options: catalog.memories },
    { type: "meeting_action", label: INITIATIVE_LINK_LABELS.meeting_action, options: catalog.meetingActions },
    { type: "risk", label: INITIATIVE_LINK_LABELS.risk, options: catalog.risks },
    { type: "opportunity", label: INITIATIVE_LINK_LABELS.opportunity, options: catalog.opportunities },
  ];
}

const inputClassName =
  "block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

export function InitiativeForm({
  linkCatalog,
  initialItem = null,
  onSaved,
  onCancel,
}: InitiativeFormProps) {
  const [form, setForm] = useState<SaveInitiativeInput>(() =>
    toFormState(initialItem),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedKeys = useMemo(
    () => new Set(form.links.map((link) => linkKey(link.linkType, link.linkedId))),
    [form.links],
  );

  const sections = useMemo(
    () => catalogSections(linkCatalog).filter((section) => section.options.length > 0),
    [linkCatalog],
  );

  function updateField<K extends keyof SaveInitiativeInput>(
    key: K,
    value: SaveInitiativeInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleLink(option: InitiativeLinkOption) {
    const key = linkKey(option.linkType, option.id);

    setForm((current) => {
      const exists = current.links.some(
        (link) => linkKey(link.linkType, link.linkedId) === key,
      );

      if (exists) {
        return {
          ...current,
          links: current.links.filter(
            (link) => linkKey(link.linkType, link.linkedId) !== key,
          ),
        };
      }

      return {
        ...current,
        links: [
          ...current.links,
          { linkType: option.linkType, linkedId: option.id },
        ],
      };
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveInitiativeAction({
        ...form,
        targetDate: form.targetDate || undefined,
      });

      if (result.error || !result.data) {
        setError(result.error ?? "Unable to save initiative.");
        return;
      }

      onSaved(result.data);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
          {initialItem ? "Edit Initiative" : "Create Initiative"}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Define a strategic initiative and link related objectives, decisions,
          and executive context. Health is calculated automatically on save.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="initiative-title" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Title
          </label>
          <input
            id="initiative-title"
            type="text"
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className={inputClassName}
            placeholder="Enterprise platform migration"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="initiative-description" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Description
          </label>
          <textarea
            id="initiative-description"
            rows={3}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className={inputClassName}
            placeholder="Scope, outcomes, and strategic rationale."
          />
        </div>

        <div>
          <label htmlFor="initiative-status" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Status
          </label>
          <select
            id="initiative-status"
            value={form.status}
            onChange={(event) =>
              updateField("status", event.target.value as InitiativeStatus)
            }
            className={inputClassName}
          >
            {INITIATIVE_STATUSES.filter((status) => status !== "archived").map(
              (status) => (
                <option key={status} value={status}>
                  {formatInitiativeStatus(status)}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label htmlFor="initiative-priority" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Priority
          </label>
          <select
            id="initiative-priority"
            value={form.priority}
            onChange={(event) =>
              updateField("priority", event.target.value as InitiativePriority)
            }
            className={inputClassName}
          >
            {INITIATIVE_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {formatInitiativePriority(priority)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="initiative-owner" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Owner
          </label>
          <input
            id="initiative-owner"
            type="text"
            required
            value={form.owner}
            onChange={(event) => updateField("owner", event.target.value)}
            className={inputClassName}
            placeholder="Executive sponsor or lead"
          />
        </div>

        <div>
          <label htmlFor="initiative-start" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Start date
          </label>
          <input
            id="initiative-start"
            type="date"
            required
            value={form.startDate}
            onChange={(event) => updateField("startDate", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="initiative-target" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Target date
          </label>
          <input
            id="initiative-target"
            type="date"
            value={form.targetDate ?? ""}
            onChange={(event) => updateField("targetDate", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="initiative-progress" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Progress ({form.progressPercentage}%)
          </label>
          <input
            id="initiative-progress"
            type="range"
            min={0}
            max={100}
            step={5}
            value={form.progressPercentage}
            onChange={(event) =>
              updateField("progressPercentage", Number(event.target.value))
            }
            className="w-full accent-zinc-900"
          />
        </div>
      </div>

      {sections.length > 0 ? (
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Linked context</h3>
            <p className="mt-1 text-sm text-zinc-600">
              Connect objectives, decisions, meetings, memory, and action items.
            </p>
          </div>

          {sections.map((section) => (
            <fieldset key={section.type} className="space-y-3">
              <legend className="text-sm font-medium text-zinc-700">
                {section.label}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {section.options.map((option) => {
                  const key = linkKey(option.linkType, option.id);
                  const checked = selectedKeys.has(key);

                  return (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        checked
                          ? "border-zinc-900 bg-zinc-50"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLink(option)}
                        className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20"
                      />
                      <span className="min-w-0">
                        <span className="block font-medium text-zinc-900">
                          {option.label}
                        </span>
                        {option.subtitle ? (
                          <span className="mt-0.5 block text-xs text-zinc-500">
                            {option.subtitle}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
        >
          {isPending ? "Saving..." : initialItem ? "Save Changes" : "Create Initiative"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
