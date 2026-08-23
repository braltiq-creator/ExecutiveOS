import type { CalendarEventContext } from "@/types/intelligence";

type TodayAgendaProps = {
  events: CalendarEventContext[];
};

function formatTimeRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function TodayAgenda({ events }: TodayAgendaProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 px-6 py-10 text-center">
        <p className="text-sm text-zinc-600">No meetings on today&apos;s agenda.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute bottom-4 left-[11px] top-4 w-px bg-zinc-200"
      />

      <ol className="space-y-0">
        {events.map((event) => (
          <li key={event.id} className="relative grid grid-cols-[24px_1fr] gap-4 pb-8 last:pb-0">
            <div className="relative z-10 mt-1.5 size-3 rounded-full border-2 border-white bg-zinc-900 shadow-sm" />
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    {formatTimeRange(event.startsAt, event.endsAt)}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
                    {event.title}
                  </h3>
                </div>
                {event.importance === "high" ? (
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
                    Priority
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600">
                {event.location ? <span>{event.location}</span> : null}
                {event.onlineMeetingUrl ? (
                  <a
                    href={event.onlineMeetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                  >
                    Join online
                  </a>
                ) : null}
                {event.attendeeCount ? (
                  <span>{event.attendeeCount} attendees</span>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
