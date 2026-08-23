"use client";

import type { AttentionBand } from "@/lib/briefing/lead-judgement-types";
import { cn } from "@/lib/utils/cn";

const BANDS: AttentionBand[] = ["critical", "strategic", "routine"];

const BAND_LABEL: Record<AttentionBand, string> = {
  critical: "Critical",
  strategic: "Strategic",
  routine: "Routine",
};

type AttentionLevelProps = {
  band: AttentionBand;
  explanation: string;
  boardMode?: boolean;
};

/**
 * Attention indicator — weight and type hierarchy, not colour as primary signal.
 */
export function AttentionLevel({
  band,
  explanation,
  boardMode = false,
}: AttentionLevelProps) {
  return (
    <div>
      <p
        className={cn(
          "text-[11px] font-medium uppercase tracking-[0.16em]",
          boardMode ? "text-[var(--eos-briefing-text)]/55" : "text-muted",
        )}
      >
        Executive attention
      </p>
      <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-8">
        {BANDS.map((item) => {
          const active = item === band;
          return (
            <li key={item} className="flex items-baseline gap-2">
              <span
                aria-hidden
                className={cn(
                  "inline-block h-px w-4 shrink-0",
                  active
                    ? boardMode
                      ? "bg-[var(--eos-briefing-text)]"
                      : "bg-foreground"
                    : boardMode
                      ? "bg-[var(--eos-briefing-text)]/25"
                      : "bg-border",
                )}
              />
              <span
                className={cn(
                  active
                    ? cn(
                        "font-display text-xl font-semibold tracking-tight sm:text-2xl",
                        boardMode
                          ? "text-[var(--eos-briefing-text)]"
                          : "text-foreground",
                      )
                    : cn(
                        "text-sm font-medium",
                        boardMode
                          ? "text-[var(--eos-briefing-text)]/40"
                          : "text-muted",
                      ),
                )}
              >
                {BAND_LABEL[item]}
                {active ? (
                  <span className="sr-only"> (current)</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
      <p
        className={cn(
          "mt-4 max-w-xl text-sm leading-6",
          boardMode
            ? "text-[var(--eos-briefing-text)]/75"
            : "text-secondary",
        )}
      >
        {explanation}
      </p>
    </div>
  );
}
