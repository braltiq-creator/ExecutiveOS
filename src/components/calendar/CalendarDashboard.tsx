"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { syncCalendarAction } from "@/lib/calendar/actions";
import type { ExecutiveDayIntelligence } from "@/lib/intelligence/providers/types";
import { CalendarInsights } from "@/components/calendar/CalendarInsights";
import { MeetingPreparationPanel } from "@/components/calendar/MeetingPreparation";
import { TodayAgenda } from "@/components/calendar/TodayAgenda";
import { UpcomingMeetings } from "@/components/calendar/UpcomingMeetings";

type CalendarDashboardProps = {
  data: ExecutiveDayIntelligence;
};

export function CalendarDashboard({ data }: CalendarDashboardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { calendar } = data;

  function handleSync() {
    setError(null);
    startTransition(async () => {
      const result = await syncCalendarAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Executive Calendar</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Today&apos;s Executive Day
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            Microsoft 365 calendar intelligence with meeting preparation, strategic
            time analysis, and executive health signals.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSync}
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
          >
            {isPending ? "Syncing..." : "Sync calendar"}
          </button>
          <Link
            href="/settings/integrations"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            Manage integration
          </Link>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Today&apos;s agenda
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Timeline view of your executive schedule.
          </p>
        </div>
        <TodayAgenda events={calendar.todaysAgenda} />
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Calendar insights
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Meeting load, strategic time, focus blocks, and deep work score.
          </p>
        </div>
        <CalendarInsights calendar={calendar} />
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Meeting preparation
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Related decisions, initiatives, risks, and executive memory.
          </p>
        </div>
        <MeetingPreparationPanel preparation={calendar.meetingPreparation} />
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Upcoming meetings
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Next two weeks across Microsoft 365.
          </p>
        </div>
        <UpcomingMeetings meetings={calendar.upcomingMeetings} />
      </section>
    </div>
  );
}
