import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceEmptyState } from "@/experience/design-system/EmptyState";
import { Reveal } from "@/experience/motion/Reveal";
import { SnapshotCta } from "@/experience/executive-brief/SnapshotCta";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";

type Props = {
  snapshot: ExecutiveSnapshot;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

/** Max five chronological items — Open Calendar continues elsewhere. */
export function CalendarContextSection({ snapshot, delay = 7 }: Props) {
  const agenda = snapshot.executiveAgenda;
  const context = snapshot.executiveContext;
  const calendarHref = "/calendar";

  return (
    <Reveal delay={delay}>
      <section
        id="calendar-context"
        aria-labelledby="calendar-context-heading"
        className="ex-snapshot-block"
      >
        <p className="ex-caption mb-2">What happens next today?</p>
        <h2 id="calendar-context-heading" className="sr-only">
          Executive timeline
        </h2>

        {agenda ? (
          <ExperienceCardShell className="space-y-0 overflow-hidden p-0">
            <ol className="divide-y divide-[var(--eos-border)]">
              {agenda.items.slice(0, 5).map((item, index) => (
                <li
                  key={item.id}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[2.5rem_1fr]"
                >
                  <p className="ex-caption tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="min-w-0">
                    <p className="ex-caption">
                      {item.priorityLabel} · {item.strategicTheme}
                    </p>
                    <p className="ex-heading mt-0.5 text-sm">{item.title}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="border-t border-[var(--eos-border)] px-4 py-3">
              <SnapshotCta href={calendarHref}>Open Calendar</SnapshotCta>
            </div>
          </ExperienceCardShell>
        ) : context ? (
          <ExperienceCardShell className="space-y-0 overflow-hidden p-0">
            <ol className="divide-y divide-[var(--eos-border)]">
              {context.calendar.slice(0, 5).map((meeting) => (
                <li
                  key={meeting.id}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[5.5rem_1fr]"
                >
                  <p className="ex-caption tabular-nums">{meeting.when}</p>
                  <div className="min-w-0">
                    <p className="ex-heading text-sm">{meeting.title}</p>
                    <p className="ex-body mt-0.5 text-[length:0.8rem]">
                      {meeting.kindLabel}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="border-t border-[var(--eos-border)] px-4 py-3">
              <SnapshotCta href={calendarHref}>Open Calendar</SnapshotCta>
            </div>
          </ExperienceCardShell>
        ) : (
          <ExperienceEmptyState
            title="Timeline settling in"
            description="Connect calendar context to see today’s moments."
            action={<SnapshotCta href={calendarHref}>Open Calendar</SnapshotCta>}
          />
        )}
      </section>
    </Reveal>
  );
}
