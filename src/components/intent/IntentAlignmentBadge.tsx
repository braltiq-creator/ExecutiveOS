import { cn } from "@/lib/utils/cn";
import type { OutcomeIntentAlignment } from "@/lib/intent/engine-types";

const LABELS: Record<OutcomeIntentAlignment, string> = {
  focused: "Focused",
  watching: "Watching",
  supporting: "Supporting",
  non_focus: "Non-Focus",
};

const STYLES: Record<OutcomeIntentAlignment, string> = {
  focused:
    "border-[var(--eos-accent)] bg-[var(--eos-accent-muted)] text-foreground",
  watching: "border-border-strong bg-surface-inset text-secondary",
  supporting: "border-border bg-surface text-secondary",
  non_focus: "border-border bg-transparent text-muted",
};

type IntentAlignmentBadgeProps = {
  alignment: OutcomeIntentAlignment;
  className?: string;
};

/** Text label included — colour is never the sole cue (WCAG). */
export function IntentAlignmentBadge({
  alignment,
  className,
}: IntentAlignmentBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--eos-radius-sm)] border px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em]",
        STYLES[alignment],
        className,
      )}
    >
      {LABELS[alignment]}
    </span>
  );
}

export function intentAlignmentLabel(
  alignment: OutcomeIntentAlignment,
): string {
  return LABELS[alignment];
}
