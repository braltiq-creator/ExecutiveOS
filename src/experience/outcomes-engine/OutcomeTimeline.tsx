import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { OutcomeTimelineEvent } from "@/experience/outcomes-engine/types";

type Props = {
  events: OutcomeTimelineEvent[];
};

/** Chronological history of significant outcome changes. */
export function OutcomeTimeline({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <Reveal delay={4}>
      <section
        id="outcome-timeline"
        aria-label="Outcome Timeline"
        className="scroll-mt-6"
        data-outcome-timeline="true"
      >
        <ExsSectionHeader
          label="Outcome Timeline"
          icon={EXECUTIVE_ICONS.activity}
        />
        <ol className="overflow-hidden rounded-[var(--exs-radius)] border border-[var(--exs-border)] bg-[var(--exs-surface)] shadow-[var(--exs-shadow-1)]">
          {events.map((event, index) => (
            <li
              key={event.id}
              className="border-b border-[var(--exs-divider)] px-3 py-2.5 last:border-b-0"
            >
              <p className="exs-title text-[length:0.85rem]">{event.title}</p>
              <p className="exs-body mt-0.5 text-[length:0.8rem]">
                {event.detail}
              </p>
              {index < events.length - 1 ? (
                <p
                  className="exs-label mt-1 text-[var(--exs-text-muted)]"
                  aria-hidden="true"
                >
                  ↓
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </Reveal>
  );
}
