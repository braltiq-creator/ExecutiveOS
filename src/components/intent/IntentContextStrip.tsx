"use client";

import Link from "next/link";
import { useIntent } from "@/components/providers/IntentProvider";
import { cn } from "@/lib/utils/cn";

type IntentContextStripProps = {
  className?: string;
  boardMode?: boolean;
};

/**
 * Intent Strip — recognition before recommendation.
 * Frames the Briefing; full Intent lives in utility.
 */
export function IntentContextStrip({
  className,
  boardMode = false,
}: IntentContextStripProps) {
  const { context } = useIntent();
  const focusNames = context.focusOutcomes
    .slice(0, 3)
    .map((outcome) => outcome.name);

  return (
    <section
      id="intent-strip"
      aria-labelledby="intent-strip-title"
      className={cn(
        "border-b border-border pb-8",
        boardMode && "pb-10",
        className,
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            Intent
          </p>
          <h2
            id="intent-strip-title"
            className={cn(
              "mt-3 font-display font-semibold tracking-tight text-foreground",
              boardMode ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
            )}
          >
            {context.title}
          </h2>
          <p
            className={cn(
              "mt-3 max-w-2xl leading-7 text-secondary",
              boardMode ? "text-base" : "text-sm sm:text-[15px]",
            )}
          >
            {context.narrative}
          </p>
          {focusNames.length > 0 ? (
            <p className="mt-4 text-sm text-secondary">
              <span className="text-muted">Focus · </span>
              {focusNames.join(" · ")}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 space-y-1 lg:text-right">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Horizon
          </p>
          <p className="text-sm text-foreground">{context.horizon}</p>
          <p className="pt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Review
          </p>
          <p className="font-mono text-sm text-foreground">{context.reviewDate}</p>
          <Link
            href="/intent"
            className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-secondary underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Review Intent
          </Link>
        </div>
      </div>
    </section>
  );
}
