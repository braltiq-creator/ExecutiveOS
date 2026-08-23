type InitiativeProgressProps = {
  percentage: number;
  size?: "sm" | "md";
};

export function InitiativeProgress({
  percentage,
  size = "md",
}: InitiativeProgressProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const barHeight = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-zinc-500">Progress</span>
        <span className="text-xs font-semibold tabular-nums text-zinc-900">
          {clamped}%
        </span>
      </div>
      <div
        className={`overflow-hidden rounded-full bg-zinc-100 ${barHeight}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${barHeight} rounded-full bg-zinc-900 transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
