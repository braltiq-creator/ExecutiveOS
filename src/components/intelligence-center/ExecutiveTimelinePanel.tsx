"use client";

import { useState } from "react";
import type { ExecutiveTimeline, TimelineBucket } from "@/lib/intelligence-center/types";

type ExecutiveTimelinePanelProps = {
  timeline: ExecutiveTimeline;
};

const BUCKET_LABELS: Record<TimelineBucket, string> = {
  yesterday: "Yesterday",
  today: "Today",
  this_week: "This Week",
  next_week: "Next Week",
};

const TYPE_COLORS: Record<string, string> = {
  Meeting: "bg-sky-100 text-sky-700",
  Decision: "bg-violet-100 text-violet-700",
  "Board Event": "bg-indigo-100 text-indigo-700",
  Initiative: "bg-emerald-100 text-emerald-700",
  Deadline: "bg-amber-100 text-amber-700",
};

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ExecutiveTimelinePanel({ timeline }: ExecutiveTimelinePanelProps) {
  const [activeBucket, setActiveBucket] = useState<TimelineBucket>("today");
  const events = timeline[activeBucket];

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Executive Timeline
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
            Your operating rhythm
          </h2>
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
          {(Object.keys(BUCKET_LABELS) as TimelineBucket[]).map((bucket) => (
            <button
              key={bucket}
              type="button"
              onClick={() => setActiveBucket(bucket)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                activeBucket === bucket
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900",
              ].join(" ")}
            >
              {BUCKET_LABELS[bucket]}
              <span className="ml-1 text-zinc-400">({timeline[bucket].length})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3"
            >
              <div className="w-28 shrink-0 text-xs leading-5 text-zinc-500">
                {formatTime(event.startsAt)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      TYPE_COLORS[event.typeLabel] ?? "bg-zinc-100 text-zinc-700",
                    ].join(" ")}
                  >
                    {event.typeLabel}
                  </span>
                  {event.badge ? (
                    <span className="text-[10px] capitalize text-zinc-500">
                      {event.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm font-medium text-zinc-900">{event.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-zinc-600">{event.summary}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-200 px-5 py-10 text-center">
            <p className="text-sm text-zinc-600">
              No events in this period. Connect calendar and add initiatives to populate your timeline.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
