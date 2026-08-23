"use client";

import { cn } from "@/lib/utils/cn";

type ExecutiveSummaryProseProps = {
  summary: string;
  focusAreas: string[];
  canWait: string;
  whatRequiresAttention: string;
  whyItMatters: string;
  boardMode?: boolean;
};

/**
 * Chief of Staff executive summary — editorial prose, not a card grid.
 */
export function ExecutiveSummaryProse({
  summary,
  focusAreas,
  canWait,
  whatRequiresAttention,
  whyItMatters,
  boardMode = false,
}: ExecutiveSummaryProseProps) {
  const sentences = summary
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="space-y-10">
      <div>
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.16em]",
            boardMode ? "text-[var(--eos-briefing-text)]/55" : "text-muted",
          )}
        >
          Executive summary
        </p>
        <div
          className={cn(
            "mt-5 max-w-2xl space-y-4 text-base leading-8 sm:text-[17px] sm:leading-8",
            boardMode
              ? "text-[var(--eos-briefing-text)]/90"
              : "text-secondary",
          )}
        >
          {sentences.map((sentence) => (
            <p key={sentence}>{sentence}</p>
          ))}
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p
            className={cn(
              "text-[11px] font-medium uppercase tracking-[0.14em]",
              boardMode ? "text-[var(--eos-briefing-text)]/55" : "text-muted",
            )}
          >
            What requires attention
          </p>
          <p
            className={cn(
              "mt-3 text-base font-medium leading-7",
              boardMode
                ? "text-[var(--eos-briefing-text)]"
                : "text-foreground",
            )}
          >
            {whatRequiresAttention}
          </p>
        </div>
        <div>
          <p
            className={cn(
              "text-[11px] font-medium uppercase tracking-[0.14em]",
              boardMode ? "text-[var(--eos-briefing-text)]/55" : "text-muted",
            )}
          >
            Why it matters
          </p>
          <p
            className={cn(
              "mt-3 text-base leading-7",
              boardMode
                ? "text-[var(--eos-briefing-text)]/80"
                : "text-secondary",
            )}
          >
            {whyItMatters}
          </p>
        </div>
      </div>

      <div>
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.14em]",
            boardMode ? "text-[var(--eos-briefing-text)]/55" : "text-muted",
          )}
        >
          What can wait
        </p>
        <p
          className={cn(
            "mt-3 max-w-2xl text-base leading-7",
            boardMode
              ? "text-[var(--eos-briefing-text)]/75"
              : "text-secondary",
          )}
        >
          {canWait}
        </p>
      </div>

      <div>
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.14em]",
            boardMode ? "text-[var(--eos-briefing-text)]/55" : "text-muted",
          )}
        >
          Focus this morning
        </p>
        <p
          className={cn(
            "mt-3 font-display text-lg font-semibold tracking-tight sm:text-xl",
            boardMode
              ? "text-[var(--eos-briefing-text)]"
              : "text-foreground",
          )}
        >
          {focusAreas.join(" · ")}
        </p>
      </div>
    </div>
  );
}
