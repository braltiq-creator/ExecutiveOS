import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";

type ExecutiveIndicatorProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: number;
  tone?: "focus" | "risk" | "opportunity" | "capacity" | "neutral";
  direction?: "rising" | "falling" | "steady";
};

const TONE_CLASS = {
  focus: "bg-[var(--eos-color-focus)]",
  risk: "bg-[var(--eos-color-attention-critical)]",
  opportunity: "bg-[var(--eos-color-momentum-positive)]",
  capacity: "bg-[var(--eos-color-attention-watch)]",
  neutral: "bg-[var(--eos-color-text-muted)]",
} as const;

const DIRECTION_MARK = {
  rising: "→",
  falling: "←",
  steady: "·",
} as const;

/** Horizontal strength indicator — never a gauge. */
export function ExecutiveIndicator({
  label,
  value,
  tone = "neutral",
  direction = "steady",
  className,
  ...props
}: ExecutiveIndicatorProps) {
  const strength = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("min-w-0", className)} {...props}>
      <div className="flex items-baseline justify-between gap-[var(--eos-space-sm)]">
        <span className={cn(ds.type.subheading, "text-[var(--eos-color-text)]")}>
          {label}
        </span>
        <span className={cn(ds.type.caption, "font-mono tabular-nums")}>
          <span aria-hidden="true">{DIRECTION_MARK[direction]}</span> {strength}
        </span>
      </div>
      <div
        className="mt-[var(--eos-space-sm)] h-[3px] overflow-hidden rounded-full bg-[var(--eos-health-track)]"
        role="meter"
        aria-label={`${label} ${strength}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={strength}
      >
        <div
          className={cn(
            "eos-compass-fill h-full rounded-full",
            TONE_CLASS[tone],
          )}
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );
}
