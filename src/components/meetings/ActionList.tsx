"use client";

import {
  MEETING_ACTION_STATUSES,
  formatMeetingActionStatus,
} from "@/lib/meetings/types";
import type { MeetingActionInput, MeetingActionStatus } from "@/lib/meetings/types";

type ActionListProps = {
  actions: MeetingActionInput[];
  onChange: (actions: MeetingActionInput[]) => void;
  disabled?: boolean;
};

const inputClassName =
  "block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

function createEmptyAction(): MeetingActionInput {
  return {
    title: "",
    description: "",
    owner: "",
    dueDate: "",
    status: "open",
  };
}

export function ActionList({ actions, onChange, disabled = false }: ActionListProps) {
  function updateAction(index: number, updates: Partial<MeetingActionInput>) {
    onChange(
      actions.map((action, actionIndex) =>
        actionIndex === index ? { ...action, ...updates } : action,
      ),
    );
  }

  function removeAction(index: number) {
    onChange(actions.filter((_, actionIndex) => actionIndex !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Action Items</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Action items stay linked to this meeting.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange([...actions, createEmptyAction()])}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60"
        >
          Add Action
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-5 text-sm text-zinc-600">
          No action items yet. Add items manually or tag notes with{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5">ACTION:</code>.
        </div>
      ) : (
        actions.map((action, index) => (
          <div
            key={`action-${index}`}
            className="space-y-3 rounded-xl border border-zinc-200/80 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <label className="block flex-1 space-y-2">
                <span className="text-sm font-medium text-zinc-900">Title</span>
                <input
                  className={inputClassName}
                  value={action.title}
                  onChange={(event) =>
                    updateAction(index, { title: event.target.value })
                  }
                  disabled={disabled}
                  required
                />
              </label>
              <button
                type="button"
                onClick={() => removeAction(index)}
                disabled={disabled}
                className="mt-7 text-sm text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-60"
              >
                Remove
              </button>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-900">
                Description
              </span>
              <textarea
                className={`${inputClassName} min-h-20 resize-y`}
                value={action.description ?? ""}
                onChange={(event) =>
                  updateAction(index, { description: event.target.value })
                }
                disabled={disabled}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-900">Owner</span>
                <input
                  className={inputClassName}
                  value={action.owner ?? ""}
                  onChange={(event) =>
                    updateAction(index, { owner: event.target.value })
                  }
                  disabled={disabled}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-900">Due date</span>
                <input
                  type="date"
                  className={inputClassName}
                  value={action.dueDate ?? ""}
                  onChange={(event) =>
                    updateAction(index, { dueDate: event.target.value })
                  }
                  disabled={disabled}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-900">Status</span>
                <select
                  className={inputClassName}
                  value={action.status ?? "open"}
                  onChange={(event) =>
                    updateAction(index, {
                      status: event.target.value as MeetingActionStatus,
                    })
                  }
                  disabled={disabled}
                >
                  {MEETING_ACTION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatMeetingActionStatus(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
