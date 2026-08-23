import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ExecutiveBadgeTone = "neutral" | "positive" | "watch" | "critical" | "ai";

type ExecutiveBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: ExecutiveBadgeTone;
  children: ReactNode;
};

const TONE = {
  neutral: "text-[var(--eos-color-text-muted)]",
  positive: "text-[var(--eos-color-momentum-positive)]",
  watch: "text-[var(--eos-color-attention-watch)]",
  critical: "text-[var(--eos-color-attention-critical)]",
  ai: "text-[var(--eos-color-ai)]",
} as const;

/** Quiet badge — typography over chrome. */
export function ExecutiveBadge({
  tone = "neutral",
  className,
  children,
  ...props
}: ExecutiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        "text-[length:var(--eos-type-label-size)] font-medium uppercase tracking-[var(--eos-type-label-tracking)]",
        TONE[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
