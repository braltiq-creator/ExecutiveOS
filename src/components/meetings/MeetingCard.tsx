import { MeetingSummary } from "@/components/meetings/MeetingSummary";
import { formatParticipants } from "@/lib/meetings/types";
import type { MeetingActionRecord, MeetingWithActions } from "@/lib/meetings/types";
import { formatMeetingActionStatus } from "@/lib/meetings/types";

type MeetingCardProps = {
  data: MeetingWithActions;
  onEdit: (data: MeetingWithActions) => void;
  onArchive: (meetingId: string) => void;
  archiving?: boolean;
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ReadOnlyActionList({ actions }: { actions: MeetingActionRecord[] }) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-zinc-900">Action Items</h4>
      {actions.map((action) => (
        <div
          key={action.id}
          className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 px-4 py-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-zinc-900">{action.title}</p>
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-600">
              {formatMeetingActionStatus(action.status)}
            </span>
          </div>
          {action.description ? (
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {action.description}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-500">
            {action.owner ? <span>Owner: {action.owner}</span> : null}
            {action.due_date ? (
              <span>Due: {new Date(action.due_date).toLocaleDateString()}</span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MeetingCard({
  data,
  onEdit,
  onArchive,
  archiving = false,
}: MeetingCardProps) {
  const { meeting, actions } = data;

  return (
    <article className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            {meeting.title}
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            {formatDateTime(meeting.meeting_date)} · {meeting.duration_minutes}{" "}
            min
          </p>
        </div>
        {meeting.analyzed_at ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            Analyzed
          </span>
        ) : (
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            Pending analysis
          </span>
        )}
      </div>

      {meeting.participants.length > 0 ? (
        <p className="mt-4 text-sm text-zinc-600">
          <span className="font-medium text-zinc-900">Participants:</span>{" "}
          {formatParticipants(meeting.participants)}
        </p>
      ) : null}

      <div className="mt-5">
        <MeetingSummary
          summary={meeting.meeting_summary}
          analyzedAt={meeting.analyzed_at}
        />
      </div>

      <div className="mt-5">
        <ReadOnlyActionList actions={actions} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(data)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onArchive(meeting.id)}
          disabled={archiving}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60"
        >
          Archive
        </button>
      </div>
    </article>
  );
}
