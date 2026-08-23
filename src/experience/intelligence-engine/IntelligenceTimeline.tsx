import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { IntelligenceTimelineEvent } from "@/experience/intelligence-engine/types";

type Props = {
  events: IntelligenceTimelineEvent[];
};

/**
 * Chronological organisational learning narrative.
 */
export function IntelligenceTimeline({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <Reveal delay={4} className="shrink-0">
      <section
        aria-label="Intelligence Timeline"
        className="mb-2"
        data-intelligence-timeline="true"
      >
        <ExsSectionHeader
          label="Intelligence Timeline"
          icon={EXECUTIVE_ICONS.activity}
          className="mb-1.5"
        />
        <ol className="overflow-hidden rounded-[var(--exs-radius)] border border-[var(--exs-border)] bg-[var(--exs-surface)] shadow-[var(--exs-shadow-1)]">
          {events.map((event, index) => (
            <li
              key={event.id}
              className="border-b border-[var(--exs-divider)] px-3 py-2 last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <span className="exs-label w-4 shrink-0 tabular-nums">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="exs-title text-[length:0.8rem]">{event.title}</p>
                  <p className="exs-body mt-0.5 text-[length:0.75rem]">
                    {event.detail}
                  </p>
                </div>
              </div>
              {index < events.length - 1 ? (
                <p
                  className="exs-label ml-4 mt-1 text-[var(--exs-text-muted)]"
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
