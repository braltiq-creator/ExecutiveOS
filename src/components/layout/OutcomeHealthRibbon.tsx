"use client";

import Link from "next/link";
import { useOutcomesOptional } from "@/components/providers/OutcomeProvider";
import { cn } from "@/lib/utils/cn";
import { usePortfolioStore } from "@/store/portfolio-store";

type OutcomeHealthRibbonProps = {
  className?: string;
};

/**
 * Persistent Outcome Health chrome — glass, emerald fill.
 */
export function OutcomeHealthRibbon({ className }: OutcomeHealthRibbonProps) {
  const outcomes = useOutcomesOptional();
  const storeScore = usePortfolioStore((state) => state.portfolio.overallScore);
  const providerScore = outcomes?.portfolio.overallScore;
  const score =
    typeof providerScore === "number" && Number.isFinite(providerScore)
      ? providerScore
      : storeScore;
  const hasScore = typeof score === "number" && Number.isFinite(score);
  const label = hasScore
    ? `Outcome Health ${Math.round(score)} of 100`
    : "Outcome Health unavailable";

  return (
    <Link
      href="/outcomes"
      aria-label={label}
      className={cn(
        "eos-glass-soft inline-flex min-h-10 items-center gap-3 rounded-[var(--eos-radius-md)] px-3 py-1.5",
        "transition-[transform,background-color] duration-[var(--eos-duration-normal)] ease-[var(--eos-ease-out)] hover:-translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        className,
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
        Outcome Health
      </span>
      <span
        className="h-1 w-14 overflow-hidden rounded-full bg-[var(--eos-health-track)] sm:w-16"
        aria-hidden="true"
      >
        {hasScore ? (
          <span
            className="block h-full rounded-full bg-[var(--eos-health-fill)] transition-[width] duration-500 ease-[var(--eos-ease-soft)]"
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        ) : null}
      </span>
      <span className="tabular-nums text-sm font-medium text-foreground">
        {hasScore ? Math.round(score) : "—"}
      </span>
    </Link>
  );
}
