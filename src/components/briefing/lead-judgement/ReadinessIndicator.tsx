"use client";

import type { ExecutiveReadiness } from "@/lib/briefing/lead-judgement-types";
import { cn } from "@/lib/utils/cn";

type ReadinessIndicatorProps = {
  readiness: ExecutiveReadiness;
  label: string;
  why: string;
  boardMode?: boolean;
};

/**
 * Executive Readiness — not a KPI score.
 * Language over numbers.
 */
export function ReadinessIndicator({
  readiness,
  label,
  why,
  boardMode = false,
}: ReadinessIndicatorProps) {
  return (
    <div
      data-readiness={readiness}
      className={cn(
        "border-t border-border pt-6",
        boardMode && "border-[var(--eos-briefing-text)]/15",
      )}
    >
      <p
        className={cn(
          "text-[11px] font-medium uppercase tracking-[0.16em]",
          boardMode ? "text-[var(--eos-briefing-text)]/55" : "text-muted",
        )}
      >
        Executive readiness
      </p>
      <p
        className={cn(
          "mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl",
          boardMode
            ? "text-[var(--eos-briefing-text)]"
            : "text-foreground",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-3 max-w-xl text-sm leading-6",
          boardMode
            ? "text-[var(--eos-briefing-text)]/75"
            : "text-secondary",
        )}
      >
        {why}
      </p>
    </div>
  );
}
