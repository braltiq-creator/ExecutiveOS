import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

type ConfidenceBarProps = {
  value: number;
  className?: string;
  label?: string;
};

/** Confidence animation — reinforces trust, never distracts. */
export function ConfidenceBar({
  value,
  className,
  label = "Confidence",
}: ConfidenceBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const style = {
    "--ex-confidence": `${clamped}%`,
    width: `${clamped}%`,
  } as CSSProperties;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="ex-caption">{label}</span>
        <span className="text-[length:var(--ex-caption-size)] tabular-nums text-[var(--ex-text-muted)]">
          {clamped}%
        </span>
      </div>
      <div
        className="ex-confidence-bar"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <span className="ex-motion" style={style} />
      </div>
    </div>
  );
}
