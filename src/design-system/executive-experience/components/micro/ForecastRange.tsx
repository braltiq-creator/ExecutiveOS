import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_SOFT_VAR, EXDS_TONE_VAR } from "../../colour";
import type { ExdsSemanticTone } from "../../types";

type ForecastRangeProps = {
  low: number;
  mid: number;
  high: number;
  actual?: number;
  min?: number;
  max?: number;
  label?: string;
  tone?: ExdsSemanticTone;
  className?: string;
};

/** Forecast range with optional actual marker. */
export function ForecastRange({
  low,
  mid,
  high,
  actual,
  min,
  max,
  label = "Forecast",
  tone = "intelligence",
  className,
}: ForecastRangeProps) {
  const floor = min ?? Math.min(low, actual ?? low);
  const ceil = max ?? Math.max(high, actual ?? high);
  const span = Math.max(1, ceil - floor);
  const toPct = (v: number) =>
    Math.max(0, Math.min(100, ((v - floor) / span) * 100));

  const left = toPct(low);
  const width = Math.max(2, toPct(high) - left);
  const midPct = toPct(mid);
  const actualPct = actual === undefined ? null : toPct(actual);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="eos-type-caption">{label}</span>
        <span className="eos-type-caption exds-soft-counter">
          {low}–{high}
        </span>
      </div>
      <div
        className="relative h-2 w-full rounded-full"
        style={{ background: "var(--eos-health-track)" }}
        role="img"
        aria-label={`${label}: ${low} to ${high}, midpoint ${mid}${
          actual === undefined ? "" : `, actual ${actual}`
        }`}
      >
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            background: EXDS_TONE_SOFT_VAR[tone],
          }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded-full"
          style={{
            left: `${midPct}%`,
            background: EXDS_TONE_VAR[tone],
          }}
        />
        {actualPct !== null ? (
          <div
            className="absolute top-1/2 h-3 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm"
            style={{
              left: `${actualPct}%`,
              background: "var(--eos-color-text)",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
