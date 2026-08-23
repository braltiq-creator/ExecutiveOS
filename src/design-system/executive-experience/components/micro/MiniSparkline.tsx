import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR } from "../../colour";
import type { ExdsSemanticTone, ExdsTrendDirection } from "../../types";
import { toneFromTrend } from "../../colour";

type MiniSparklineProps = {
  values: number[];
  trend?: ExdsTrendDirection;
  tone?: ExdsSemanticTone;
  width?: number;
  height?: number;
  className?: string;
  "aria-label"?: string;
};

/** Compact sparkline — state in seconds, not a BI chart. */
export function MiniSparkline({
  values,
  trend = "flat",
  tone,
  width = 64,
  height = 20,
  className,
  "aria-label": ariaLabel,
}: MiniSparklineProps) {
  const resolved = tone ?? toneFromTrend(trend);
  const stroke = EXDS_TONE_VAR[resolved];
  const pad = 1.5;

  if (values.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn("exds-sparkline", className)}
        aria-hidden={ariaLabel ? undefined : true}
        aria-label={ariaLabel}
        role={ariaLabel ? "img" : undefined}
      >
        <line
          x1={pad}
          y1={height / 2}
          x2={width - pad}
          y2={height / 2}
          stroke={stroke}
          strokeWidth="1.25"
          opacity="0.35"
        />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = pad + (index / (values.length - 1)) * (width - pad * 2);
      const y = height - pad - ((value - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("exds-sparkline", className)}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
