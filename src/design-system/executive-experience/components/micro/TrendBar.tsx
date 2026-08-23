import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR, toneFromTrend } from "../../colour";
import type { ExdsTrendDirection } from "../../types";

type TrendBarProps = {
  values: number[];
  trend?: ExdsTrendDirection;
  className?: string;
  "aria-label"?: string;
};

/** Compact vertical bars for short series. */
export function TrendBar({
  values,
  trend = "flat",
  className,
  "aria-label": ariaLabel,
}: TrendBarProps) {
  const tone = toneFromTrend(trend);
  const max = Math.max(1, ...values.map((v) => Math.abs(v)));

  return (
    <div
      className={cn("flex h-5 items-end gap-0.5", className)}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    >
      {values.map((value, index) => {
        const height = Math.max(12, (Math.abs(value) / max) * 100);
        return (
          <span
            key={`${index}-${value}`}
            className="w-1 rounded-sm"
            style={{
              height: `${height}%`,
              background: EXDS_TONE_VAR[tone],
              opacity: 0.45 + (index / Math.max(1, values.length - 1)) * 0.55,
            }}
          />
        );
      })}
    </div>
  );
}
