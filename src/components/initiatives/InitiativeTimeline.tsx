import { InitiativeHealthBadge } from "@/components/initiatives/InitiativeHealthBadge";
import { InitiativeProgress } from "@/components/initiatives/InitiativeProgress";
import { InitiativeStatusBadge } from "@/components/initiatives/InitiativeStatusBadge";
import type { InitiativeWithLinks } from "@/lib/initiatives/types";

type InitiativeTimelineProps = {
  initiatives: InitiativeWithLinks[];
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function InitiativeTimeline({ initiatives }: InitiativeTimelineProps) {
  const sorted = [...initiatives].sort(
    (left, right) =>
      new Date(right.initiative.start_date).getTime() -
      new Date(left.initiative.start_date).getTime(),
  );

  if (sorted.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-6 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
        Initiative Timeline
      </h2>
      <div className="relative space-y-0">
        {sorted.map(({ initiative }, index) => (
          <div
            key={initiative.id}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {index < sorted.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute left-[11px] top-6 h-full w-px bg-zinc-200"
              />
            ) : null}
            <span className="relative z-10 mt-1.5 size-[22px] shrink-0 rounded-full border-2 border-zinc-900 bg-white" />
            <div className="min-w-0 flex-1 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <time
                  dateTime={initiative.start_date}
                  className="text-sm font-medium text-zinc-900"
                >
                  {formatDate(initiative.start_date)}
                </time>
                <InitiativeStatusBadge status={initiative.status} />
                <InitiativeHealthBadge health={initiative.health_status} />
              </div>
              <h3 className="mt-2 text-base font-semibold text-zinc-900">
                {initiative.title}
              </h3>
              {initiative.target_date ? (
                <p className="mt-2 text-xs text-zinc-500">
                  Target: {formatDate(initiative.target_date)}
                </p>
              ) : null}
              <div className="mt-4">
                <InitiativeProgress
                  percentage={initiative.progress_percentage}
                  size="sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
