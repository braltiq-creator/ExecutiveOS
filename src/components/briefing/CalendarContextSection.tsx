"use client";

import { BriefingSection } from "@/components/briefing/BriefingSection";
import { useIntelligence } from "@/components/providers/IntelligenceProvider";
import { useOutcomes } from "@/components/providers/OutcomeProvider";

function formatRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const day = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(startDate);
  const endTime = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(endDate);
  return `${day} – ${endTime}`;
}

/** Calendar as rhythm context — never the Briefing hero. */
export function CalendarContextSection() {
  const { intelligence } = useIntelligence();
  const { getOutcomeById } = useOutcomes();
  const items = intelligence.calendarContext.slice(0, 3);

  return (
    <BriefingSection
      id="calendar-context"
      overline="Calendar context"
      title="Today’s rhythm"
      description="Meetings that frame judgement — not a calendar product."
    >
      {items.length === 0 ? (
        <p className="text-sm text-secondary">No consequential meetings surfaced.</p>
      ) : (
        <ol className="divide-y divide-border border-y border-border">
          {items.map((item) => {
            const outcome = getOutcomeById(item.outcomeId);
            return (
              <li key={item.id} className="py-5">
                <p className="font-mono text-xs text-muted">
                  {formatRange(item.startsAt, item.endsAt)}
                </p>
                <h3 className="mt-1.5 font-display text-base font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-secondary">
                  {item.attendeesSummary}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-secondary">
                  {item.why}
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {item.whatShouldHappenNext}
                </p>
                {outcome ? (
                  <p className="mt-2 text-xs text-muted">{outcome.name}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </BriefingSection>
  );
}
