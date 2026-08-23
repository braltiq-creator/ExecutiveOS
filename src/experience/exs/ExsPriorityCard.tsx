import type { LucideIcon } from "lucide-react";
import { ExsOpenLink } from "@/experience/exs/ExsOpenLink";
import type { McSnapshotCard } from "@/experience/mission-control/types";

type Props = {
  card: McSnapshotCard;
  icon: LucideIcon;
};

/**
 * Executive Priorities card — headline, one-line summary, impact, Open →.
 * Action always visible in the header.
 */
export function ExsPriorityCard({ card, icon: Icon }: Props) {
  return (
    <article className="exs-card mc-snapshot-card h-full">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <p className="exs-label flex min-w-0 items-center gap-1.5 truncate">
          <Icon
            className="h-3.5 w-3.5 shrink-0 text-[var(--exs-text-muted)]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span className="truncate">{card.headline}</span>
        </p>
        <ExsOpenLink href={card.href}>{card.cta}</ExsOpenLink>
      </header>
      <div className="mt-1.5 min-w-0 space-y-1">
        <p className="exs-title leading-snug">{card.sentence}</p>
        <p className="exs-body line-clamp-1 text-[length:0.78rem]">
          {card.impact}
        </p>
      </div>
    </article>
  );
}
