import Link from "next/link";
import { Reveal } from "@/experience/motion/Reveal";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsSectionHeader } from "@/experience/exs";
import type { McActivityItem } from "@/experience/mission-control/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  items: McActivityItem[];
};

/** Sole scrolling region — heartbeat of Mission Control. */
export function ActivityFeed({ items }: Props) {
  return (
    <Reveal delay={4} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <section
        aria-label="Activity Feed"
        className="mc-feed flex min-h-0 flex-1 flex-col"
      >
        <ExsSectionHeader
          label="Activity Feed"
          icon={EXECUTIVE_ICONS.activity}
          trailing={
            <p className="mc-live-dot text-[length:0.65rem] text-[var(--exs-text-muted)]">
              Live
            </p>
          }
        />
        <ul className="mc-feed-scroll min-h-0 flex-1 space-y-0 overflow-y-auto overscroll-contain rounded-[var(--exs-radius)] border border-[var(--exs-border)] bg-[var(--exs-surface)] shadow-[var(--exs-shadow-1)]">
          {items.length === 0 ? (
            <li className="px-4 py-6">
              <p className="exs-body">No overnight movement to surface yet.</p>
            </li>
          ) : (
            items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "border-b border-[var(--exs-divider)] last:border-b-0",
                  item.highlight && "mc-feed-loop",
                )}
              >
                <Link
                  href={item.href}
                  className="grid grid-cols-[3.25rem_1fr_auto] items-start gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--exs-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--eos-ring)]"
                >
                  <time
                    dateTime={item.at}
                    className="exs-label tabular-nums"
                  >
                    {item.timeLabel}
                  </time>
                  <span className="exs-body text-[length:0.85rem] text-[var(--exs-text)]">
                    {item.headline}
                  </span>
                  <span className="exs-open">Open →</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </Reveal>
  );
}
