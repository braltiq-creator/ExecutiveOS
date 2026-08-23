"use client";

import { cn } from "@/lib/utils/cn";

type ReviewTimeEstimateProps = {
  minutes: number;
  boardMode?: boolean;
};

/**
 * Estimated executive review time — confidence, not a timer KPI.
 */
export function ReviewTimeEstimate({
  minutes,
  boardMode = false,
}: ReviewTimeEstimateProps) {
  return (
    <div>
      <p
        className={cn(
          "text-[11px] font-medium uppercase tracking-[0.16em]",
          boardMode ? "text-[var(--eos-briefing-text)]/55" : "text-muted",
        )}
      >
        Estimated executive review
      </p>
      <p
        className={cn(
          "mt-3 font-display text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl",
          boardMode
            ? "text-[var(--eos-briefing-text)]"
            : "text-foreground",
        )}
      >
        {minutes}
        <span
          className={cn(
            "ml-2 text-lg font-medium tracking-normal sm:text-xl",
            boardMode
              ? "text-[var(--eos-briefing-text)]/60"
              : "text-muted",
          )}
        >
          minutes
        </span>
      </p>
    </div>
  );
}
