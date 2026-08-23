import {
  Brain,
  Gem,
  Lightbulb,
  ShieldAlert,
  Target,
  type LucideIcon,
} from "lucide-react";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { Reveal } from "@/experience/motion/Reveal";
import type { JudgementItem } from "@/experience/intelligence-engine/types";

type Props = {
  items: JudgementItem[];
  label?: string;
};

const KIND_ICON: Record<JudgementItem["kind"], LucideIcon> = {
  decision: Brain,
  risk: ShieldAlert,
  opportunity: Gem,
  strategy: Target,
  learning: Lightbulb,
};

/**
 * Compact Judgement Queue — primary Mission Control work area.
 * Reasoning detail lives in workspaces via Open →
 */
export function JudgementQueue({
  items,
  label = "Executive Judgement Queue",
}: Props) {
  return (
    <Reveal delay={3} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <section
        aria-label={label}
        className="mc-judgement flex min-h-0 flex-1 flex-col"
        data-judgement-queue="true"
      >
        <ExsSectionHeader
          label={label}
          icon={EXECUTIVE_ICONS.priorities}
          className="mb-1.5 shrink-0"
        />
        {items.length === 0 ? (
          <article className="exs-card">
            <p className="exs-title text-[length:0.9rem]">
              No judgement required this morning
            </p>
            <p className="exs-body mt-1 text-[length:0.8rem]">
              Signals will surface here when leadership creates value.
            </p>
          </article>
        ) : (
          <ul className="mc-column-scroll flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain pr-0.5">
            {items.map((item) => (
              <li key={item.id} className="shrink-0">
                <JudgementQueueCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}

export function JudgementQueueCard({ item }: { item: JudgementItem }) {
  const Icon = KIND_ICON[item.kind];

  return (
    <article className="exs-card mc-snapshot-card">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <p className="exs-label flex min-w-0 items-center gap-1.5 truncate">
          <Icon
            className="h-3.5 w-3.5 shrink-0 text-[var(--exs-text-muted)]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span className="truncate">{item.title}</span>
        </p>
        <ExsOpenLink href={item.href}>Open →</ExsOpenLink>
      </header>
      <div className="mt-1 min-w-0 space-y-0.5">
        <p className="exs-body line-clamp-1 text-[length:0.75rem]">
          <span className="font-medium text-[var(--exs-text)]">Why. </span>
          {item.whyItMatters}
        </p>
        <p className="exs-body line-clamp-1 text-[length:0.75rem]">
          <span className="font-medium text-[var(--exs-text)]">Impact. </span>
          {item.organisationalImpact}
        </p>
        <p className="exs-label flex flex-wrap gap-x-3 normal-case">
          <span>
            Confidence{" "}
            <span className="tabular-nums text-[var(--exs-text)]">
              {item.confidence}%
            </span>
          </span>
          <span className="truncate">Delay · {item.costOfDelay}</span>
        </p>
      </div>
    </article>
  );
}
