import type { ExecutiveCalendarIntelligence } from "@/lib/intelligence/providers/types";

type CalendarInsightsProps = {
  calendar: ExecutiveCalendarIntelligence;
};

function InsightCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-zinc-600">{detail}</p> : null}
    </div>
  );
}

export function CalendarInsights({ calendar }: CalendarInsightsProps) {
  const { health } = calendar;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          label="Meeting load"
          value={`${calendar.meetingLoadMinutes}m`}
          detail={`${health.meetingLoadRatio}% of a standard executive day`}
        />
        <InsightCard
          label="Strategic time"
          value={`${calendar.strategicTimeMinutes}m`}
          detail="Time aligned to objectives and initiatives"
        />
        <InsightCard
          label="Focus time"
          value={`${calendar.focusTimeMinutes}m`}
          detail="Uninterrupted blocks available today"
        />
        <InsightCard
          label="Deep work score"
          value={`${health.deepWorkScore}`}
          detail={health.summary}
        />
      </div>

      {calendar.conflicts.length > 0 ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5">
          <p className="text-sm font-medium text-red-800">Meeting conflicts</p>
          <ul className="mt-3 space-y-2">
            {calendar.conflicts.map((conflict) => (
              <li key={conflict.id} className="text-sm text-red-700">
                {conflict.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {calendar.travelGaps.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <p className="text-sm font-medium text-amber-900">Travel considerations</p>
          <ul className="mt-3 space-y-2">
            {calendar.travelGaps.map((gap) => (
              <li key={gap.id} className="text-sm text-amber-800">
                {gap.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
