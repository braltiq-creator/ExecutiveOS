import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader, ExsTrend } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { OutcomePortfolioItem } from "@/experience/outcomes-engine/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  outcomes: OutcomePortfolioItem[];
  /** Optional section label. */
  label?: string;
  focused?: boolean;
  compact?: boolean;
};

/**
 * Reusable Outcome Portfolio — organising principle across ExecutiveOS.
 */
export function ExecutiveOutcomePortfolio({
  outcomes,
  label = "Outcome Portfolio",
  focused,
  compact = false,
}: Props) {
  return (
    <Reveal delay={2}>
      <section
        id="executive-outcome-portfolio"
        aria-label={label}
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
        data-outcome-portfolio="true"
      >
        <ExsSectionHeader
          label={label}
          icon={EXECUTIVE_ICONS.strategic_outcomes}
          className={compact ? "mb-1.5" : undefined}
        />
        {outcomes.length === 0 ? (
          <article className="exs-card">
            <p className="exs-title text-[length:0.95rem]">
              No strategic outcomes defined
            </p>
            <p className="exs-body mt-1 text-[length:0.8rem]">
              Outcomes organise every workspace — define a few to focus
              judgement.
            </p>
          </article>
        ) : (
          <ul
            className={cn(
              "grid gap-2",
              compact ? "grid-cols-1" : "lg:grid-cols-2 gap-3",
            )}
          >
            {outcomes.map((outcome) => (
              <li key={outcome.id}>
                <OutcomePortfolioCard outcome={outcome} compact={compact} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}

export function OutcomePortfolioCard({
  outcome,
  compact,
}: {
  outcome: OutcomePortfolioItem;
  compact?: boolean;
}) {
  return (
    <article className="exs-card h-full">
      <header className="flex items-start justify-between gap-2">
        <p className="exs-label flex min-w-0 items-center gap-1.5 truncate">
          <EXECUTIVE_ICONS.strategic_outcomes
            className="h-3.5 w-3.5 shrink-0"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span className="truncate capitalize">{outcome.health}</span>
        </p>
        <ExsOpenLink href={outcome.href}>Open →</ExsOpenLink>
      </header>
      <h3
        className={cn(
          "exs-title mt-1.5",
          compact ? "text-[length:0.9rem]" : undefined,
        )}
      >
        {outcome.name}
      </h3>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
        <span className="inline-flex items-center gap-1 exs-label normal-case">
          <ExsTrend trend={outcome.trend} severity={outcome.healthTone} />
          {outcome.trajectory}
        </span>
        <span className="exs-label normal-case">
          Confidence{" "}
          <span className="tabular-nums text-[var(--exs-text)]">
            {outcome.confidence}%
          </span>
        </span>
      </div>
      <p className="exs-body mt-1.5 line-clamp-2 text-[length:0.78rem]">
        {outcome.businessImpact}
      </p>
      <p className="exs-label mt-1.5 flex flex-wrap gap-x-3 normal-case">
        <span>Owner {outcome.owner}</span>
        <span>Target {outcome.targetDate}</span>
      </p>
    </article>
  );
}
