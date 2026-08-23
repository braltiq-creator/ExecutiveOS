import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ExecutiveStatusTone =
  | "neutral"
  | "positive"
  | "watch"
  | "critical"
  | "ai"
  | "focus";

type ExecutiveStatusProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: ExecutiveStatusTone;
  children: ReactNode;
};

const TONE = {
  neutral:
    "text-[var(--eos-color-text-secondary)] bg-[var(--eos-color-surface-inset)]",
  positive:
    "text-[var(--eos-color-momentum-positive)] bg-[var(--eos-color-momentum-positive-soft)]",
  watch:
    "text-[var(--eos-color-attention-watch)] bg-[var(--eos-color-attention-watch-soft)]",
  critical:
    "text-[var(--eos-color-attention-critical)] bg-[var(--eos-color-attention-critical-soft)]",
  ai: "text-[var(--eos-color-ai)] bg-[var(--eos-color-ai-soft)]",
  focus: "text-[var(--eos-color-focus)] bg-[var(--eos-color-ai-soft)]",
} as const;

/** Compact status chip — colour from tokens only. */
export function ExecutiveStatus({
  tone = "neutral",
  className,
  children,
  ...props
}: ExecutiveStatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--eos-radius-sm)]",
        "px-[var(--eos-space-sm)] py-[var(--eos-space-xs)]",
        "text-[length:var(--eos-type-caption-size)] font-medium tracking-wide",
        TONE[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
