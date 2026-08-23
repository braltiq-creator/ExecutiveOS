"use client";

import { cn } from "@/lib/utils/cn";

type ExecutiveSparklineProps = {
  values: number[];
  trend?: "up" | "down" | "flat";
  className?: string;
};

/** Minimal sparkline — colour from momentum tokens. */
export function ExecutiveSparkline({
  values,
  trend = "flat",
  className,
}: ExecutiveSparklineProps) {
  const width = 52;
  const height = 16;
  const pad = 1;

  if (values.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn("eos-sparkline", className)}
        data-trend={trend}
        aria-hidden="true"
      >
        <line
          x1={pad}
          y1={height / 2}
          x2={width - pad}
          y2={height / 2}
          stroke="currentColor"
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
      const y =
        height - pad - ((value - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("eos-sparkline", className)}
      data-trend={trend}
      aria-hidden="true"
    >
      <polyline
        className="eos-sparkline-path"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        pathLength={120}
      />
    </svg>
  );
}
