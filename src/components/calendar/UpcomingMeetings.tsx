import type { CalendarEventContext } from "@/types/intelligence";

type UpcomingMeetingsProps = {
  meetings: CalendarEventContext[];
};

export function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  if (meetings.length === 0) {
    return (
      <p className="text-sm text-zinc-600">No upcoming meetings in the next two weeks.</p>
    );
  }

  return (
    <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200/80 bg-white">
      {meetings.slice(0, 8).map((meeting) => (
        <article key={meeting.id} className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-medium text-zinc-900">{meeting.title}</p>
            <p className="mt-1 text-sm text-zinc-500">
              {new Date(meeting.startsAt).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-right text-xs text-zinc-500">
            {meeting.onlineMeetingUrl ? "Online" : "In person"}
          </div>
        </article>
      ))}
    </div>
  );
}
