"use client";

import { useState, useTransition } from "react";
import { saveMeetingAction } from "@/lib/meetings/actions";
import { ActionList } from "@/components/meetings/ActionList";
import {
  formatParticipants,
  parseParticipants,
} from "@/lib/meetings/types";
import type {
  MeetingActionInput,
  MeetingWithActions,
  SaveMeetingInput,
} from "@/lib/meetings/types";

type MeetingFormProps = {
  initialData?: MeetingWithActions | null;
  onSaved: (data: MeetingWithActions) => void;
  onCancel: () => void;
};

const inputClassName =
  "block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

function toDatetimeLocalValue(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function toFormState(data?: MeetingWithActions | null): {
  input: {
    id?: string;
    title: string;
    meetingDate: string;
    durationMinutes: number;
    participantsText: string;
    rawNotes: string;
    meetingSummary: string;
    analyze: boolean;
  };
  actions: MeetingActionInput[];
} {
  const meeting = data?.meeting;

  return {
    input: {
      id: meeting?.id,
      title: meeting?.title ?? "",
      meetingDate: meeting
        ? toDatetimeLocalValue(meeting.meeting_date)
        : toDatetimeLocalValue(new Date().toISOString()),
      durationMinutes: meeting?.duration_minutes ?? 60,
      participantsText: meeting ? formatParticipants(meeting.participants) : "",
      rawNotes: meeting?.raw_notes ?? "",
      meetingSummary: meeting?.meeting_summary ?? "",
      analyze: !meeting?.analyzed_at,
    },
    actions:
      data?.actions.map((action) => ({
        id: action.id,
        title: action.title,
        description: action.description ?? "",
        owner: action.owner ?? "",
        dueDate: action.due_date ?? "",
        status: action.status,
      })) ?? [],
  };
}

export function MeetingForm({
  initialData = null,
  onSaved,
  onCancel,
}: MeetingFormProps) {
  const initial = toFormState(initialData);
  const [form, setForm] = useState(initial.input);
  const [actions, setActions] = useState<MeetingActionInput[]>(initial.actions);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveMeetingAction({
        id: form.id,
        title: form.title,
        meetingDate: new Date(form.meetingDate).toISOString(),
        durationMinutes: Number(form.durationMinutes),
        participants: parseParticipants(form.participantsText),
        rawNotes: form.rawNotes,
        meetingSummary: form.meetingSummary || undefined,
        actionItems: actions.filter((action) => action.title.trim()),
        analyze: form.analyze,
      });

      if (result.error || !result.data) {
        setError(result.error ?? "Unable to save meeting.");
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
          {initialData ? "Edit Meeting" : "Capture Meeting"}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Record meeting intelligence and enrich Executive Memory automatically.
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
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-900">Title</span>
          <input
            className={inputClassName}
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
            disabled={isPending}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-900">Date & time</span>
            <input
              type="datetime-local"
              className={inputClassName}
              value={form.meetingDate}
              onChange={(event) => updateField("meetingDate", event.target.value)}
              required
              disabled={isPending}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-900">
              Duration (minutes)
            </span>
            <input
              type="number"
              min={1}
              className={inputClassName}
              value={form.durationMinutes}
              onChange={(event) =>
                updateField("durationMinutes", Number(event.target.value))
              }
              required
              disabled={isPending}
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-900">Participants</span>
          <textarea
            className={`${inputClassName} min-h-20 resize-y`}
            value={form.participantsText}
            onChange={(event) =>
              updateField("participantsText", event.target.value)
            }
            placeholder="Alex Chen, Jordan Lee, Priya Patel"
            disabled={isPending}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-900">Raw notes</span>
          <textarea
            className={`${inputClassName} min-h-40 resize-y`}
            value={form.rawNotes}
            onChange={(event) => updateField("rawNotes", event.target.value)}
            placeholder={`Capture notes here. Tag insights for automatic extraction:\nDECISION: Approve enterprise pricing update\nRISK: Q3 pipeline concentration in two accounts\nOPPORTUNITY: Partner channel expansion in APAC\nCOMMITMENT: Launch customer advisory board\nACTION: Prepare board deck by Friday`}
            disabled={isPending}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-900">Meeting summary</span>
          <textarea
            className={`${inputClassName} min-h-28 resize-y`}
            value={form.meetingSummary ?? ""}
            onChange={(event) => updateField("meetingSummary", event.target.value)}
            placeholder="Optional executive summary. Generated automatically if left blank."
            disabled={isPending}
          />
        </label>

        <ActionList
          actions={actions}
          onChange={setActions}
          disabled={isPending}
        />

        <label className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-4 py-3">
          <input
            type="checkbox"
            checked={Boolean(form.analyze)}
            onChange={(event) => updateField("analyze", event.target.checked)}
            disabled={isPending}
            className="size-4 rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-700">
            Analyze notes and enrich Executive Intelligence
          </span>
        </label>
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
          {isPending
            ? "Saving..."
            : initialData
              ? "Save Meeting"
              : "Capture Meeting"}
        </button>
      </div>
    </form>
  );
}
