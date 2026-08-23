import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "accent" | "success" | "attention" | "critical";

type ExperienceBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: Tone;
};

const tones: Record<Tone, string> = {
  neutral: "bg-[var(--eos-surface-inset)] text-[var(--ex-text-secondary)]",
  accent: "bg-[color-mix(in_srgb,var(--ex-accent)_12%,transparent)] text-[var(--ex-accent)]",
  success:
    "bg-[color-mix(in_srgb,var(--ex-success)_12%,transparent)] text-[var(--ex-success)]",
  attention:
    "bg-[color-mix(in_srgb,var(--ex-attention)_14%,transparent)] text-[var(--ex-attention)]",
  critical:
    "bg-[color-mix(in_srgb,var(--ex-critical)_12%,transparent)] text-[var(--ex-critical)]",
};

export function ExperienceBadge({
  children,
  tone = "neutral",
  className,
  ...props
}: ExperienceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
