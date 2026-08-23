import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR, toneFromTrend } from "../../colour";
import type { ExdsTrendDirection } from "../../types";

type MovementIndicatorProps = {
  direction: ExdsTrendDirection;
  label?: string;
  /** Invert meaning (e.g. risk down is improving). */
  invert?: boolean;
  className?: string;
};

/** Trend arrow with semantic colour. */
export function MovementIndicator({
  direction,
  label,
  invert = false,
  className,
}: MovementIndicatorProps) {
  const tone = toneFromTrend(direction, invert);
  const Icon =
    direction === "up"
      ? ArrowUpRight
      : direction === "down"
        ? ArrowDownRight
        : ArrowRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 eos-type-caption",
        className,
      )}
      style={{ color: EXDS_TONE_VAR[tone] }}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      {label ? <span className="exds-soft-counter">{label}</span> : null}
      <span className="sr-only">
        {direction === "up"
          ? "Trending up"
          : direction === "down"
            ? "Trending down"
            : "Unchanged"}
      </span>
    </span>
  );
}
