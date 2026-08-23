import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { OutcomeContext } from "@/experience/outcomes-engine/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  context: OutcomeContext;
  /** Mission Control uses tighter spacing. */
  compact?: boolean;
};

/**
 * Persistent outcome focus strip — never lose outcome context while navigating.
 */
export function OutcomeContextStrip({ context, compact = false }: Props) {
  return (
    <Reveal delay={compact ? 2 : 1}>
      <section
        aria-label={context.label}
        className={cn(
          "rounded-[var(--exs-radius)] border border-[var(--exs-border)] bg-[var(--exs-surface)] shadow-[var(--exs-shadow-1)]",
          compact ? "px-3 py-1.5" : "px-3 py-2.5",
        )}
        data-outcome-context="true"
        data-outcome-id={context.outcomeId}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <ExsSectionHeader
              label={context.label}
              icon={EXECUTIVE_ICONS.strategic_outcomes}
              className="mb-0"
            />
            <p className="exs-title mt-1 truncate text-[length:0.9rem]">
              {context.name}
            </p>
            <p className="exs-body mt-0.5 line-clamp-1 text-[length:0.75rem]">
              <span className="capitalize text-[var(--exs-text)]">
                {context.health}
              </span>
              <span className="mx-1.5 text-[var(--exs-text-muted)]">·</span>
              {context.detail}
            </p>
          </div>
          <ExsOpenLink href={context.href} className="shrink-0">
            Open Outcome →
          </ExsOpenLink>
        </div>
      </section>
    </Reveal>
  );
}
