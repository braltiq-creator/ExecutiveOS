"use client";

import type { AttentionTallyItem } from "@/lib/briefing/lead-judgement-types";
import { cn } from "@/lib/utils/cn";

type AttentionTallyProps = {
  items: AttentionTallyItem[];
  framingLine: string;
  boardMode?: boolean;
};

export function AttentionTally({
  items,
  framingLine,
  boardMode = false,
}: AttentionTallyProps) {
  return (
    <div>
      <p
        className={cn(
          "max-w-2xl text-lg leading-8 sm:text-xl sm:leading-8",
          boardMode
            ? "text-[var(--eos-briefing-text)]/90"
            : "text-foreground",
        )}
      >
        {framingLine}
      </p>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex gap-3 text-base leading-7 sm:text-[17px]",
              boardMode
                ? "text-[var(--eos-briefing-text)]/85"
                : "text-secondary",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mt-3 h-1 w-1 shrink-0 rounded-full",
                boardMode
                  ? "bg-[var(--eos-briefing-text)]/50"
                  : "bg-foreground/50",
              )}
            />
            <span
              className={cn(
                item.kind === "clear"
                  ? boardMode
                    ? "text-[var(--eos-briefing-text)]/70"
                    : "text-muted"
                  : boardMode
                    ? "text-[var(--eos-briefing-text)]"
                    : "text-foreground",
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
