import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR } from "../../colour";
import type { ExdsSemanticTone } from "../../types";

export type DistributionSegment = {
  id: string;
  label: string;
  value: number;
  tone?: ExdsSemanticTone;
};

type DistributionBarProps = {
  segments: DistributionSegment[];
  label?: string;
  /** stacked = one horizontal bar per segment (executive instrument). */
  variant?: "inline" | "stacked";
  className?: string;
};

/** Proportional distribution across semantic segments. */
export function DistributionBar({
  segments,
  label = "Distribution",
  variant = "inline",
  className,
}: DistributionBarProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const safe = Math.max(1, total);

  if (variant === "stacked") {
    return (
      <div className={cn("w-full space-y-4", className)} data-distribution="stacked">
        {label ? <p className="exds-editorial-label">{label}</p> : null}
        {segments.map((segment) => {
          const pct = (Math.max(0, segment.value) / safe) * 100;
          return (
            <div key={segment.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <p className="eos-type-caption text-[var(--eos-color-text)]">
                  {segment.label}
                </p>
                <p
                  className="tabular-nums text-[length:0.95rem] font-semibold"
                  style={{
                    color: EXDS_TONE_VAR[segment.tone ?? "intelligence"],
                  }}
                >
                  {segment.value}
                </p>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-[2px] bg-[rgba(47,122,229,0.1)]"
                role="img"
                aria-label={`${segment.label}: ${segment.value}`}
              >
                <div
                  className="h-full rounded-[2px]"
                  style={{
                    width: `${Math.max(4, pct)}%`,
                    background: EXDS_TONE_VAR[segment.tone ?? "intelligence"],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <p className="eos-type-caption mb-1">{label}</p>
      <div
        className="flex h-2 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`${label}: ${segments
          .map((s) => `${s.label} ${s.value}`)
          .join(", ")}`}
      >
        {segments.map((segment) => {
          const pct = (Math.max(0, segment.value) / safe) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={segment.id}
              title={`${segment.label}: ${segment.value}`}
              style={{
                width: `${pct}%`,
                background: EXDS_TONE_VAR[segment.tone ?? "intelligence"],
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
