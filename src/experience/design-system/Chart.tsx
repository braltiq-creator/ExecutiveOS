import { cn } from "@/lib/utils/cn";

type ExperienceSparklineProps = {
  values: number[];
  className?: string;
  label?: string;
};

/** Minimal sparkline — presentation only, no chart library. */
export function ExperienceSparkline({
  values,
  className,
  label = "Trend",
}: ExperienceSparklineProps) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const width = 72;
  const height = 24;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible text-[var(--ex-accent)]", className)}
      width={width}
      height={height}
      role="img"
      aria-label={label}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
