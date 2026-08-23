import Link from "next/link";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { IntelligenceStreamEvent } from "@/experience/intelligence-engine/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  events: IntelligenceStreamEvent[];
};

/**
 * Continuous Executive Intelligence Stream — timeline + memory + activity.
 * One scroll region; no visual separation between sources.
 */
export function IntelligenceStream({ events }: Props) {
  return (
    <Reveal delay={4} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <section
        aria-label="Executive Intelligence Stream"
        className="mc-stream flex min-h-0 flex-1 flex-col"
        data-intelligence-stream="true"
      >
        <ExsSectionHeader
          label="Executive Intelligence Stream"
          icon={EXECUTIVE_ICONS.activity}
          className="mb-1.5 shrink-0"
          trailing={
            <p className="mc-live-dot text-[length:0.65rem] text-[var(--exs-text-muted)]">
              Live
            </p>
          }
        />
        <ul className="mc-column-scroll min-h-0 flex-1 space-y-0 overflow-y-auto overscroll-contain rounded-[var(--exs-radius)] border border-[var(--exs-border)] bg-[var(--exs-surface)] shadow-[var(--exs-shadow-1)]">
          {events.length === 0 ? (
            <li className="px-3 py-4">
              <p className="exs-body text-[length:0.8rem]">
                Organisational signals will stream here as they emerge.
              </p>
            </li>
          ) : (
            events.map((event, index) => (
              <li
                key={event.id}
                className={cn(
                  "border-b border-[var(--exs-divider)] last:border-b-0",
                  event.highlight && "mc-feed-loop",
                )}
              >
                <Link
                  href={event.href}
                  className="grid grid-cols-[3.5rem_1fr_auto] items-start gap-2 px-3 py-2 transition-colors hover:bg-[var(--exs-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--eos-ring)]"
                >
                  <time
                    dateTime={event.at}
                    className="exs-label tabular-nums"
                  >
                    {event.timeLabel}
                  </time>
                  <span className="min-w-0">
                    <span className="exs-body block text-[length:0.8rem] text-[var(--exs-text)]">
                      {event.title}
                    </span>
                    {event.detail ? (
                      <span className="exs-label mt-0.5 block normal-case">
                        {event.detail}
                      </span>
                    ) : null}
                    {index < events.length - 1 ? (
                      <span
                        className="exs-label mt-0.5 block text-[var(--exs-text-muted)]"
                        aria-hidden="true"
                      >
                        ↓
                      </span>
                    ) : null}
                  </span>
                  <span className="exs-open shrink-0">Open →</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </Reveal>
  );
}
