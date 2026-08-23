import { cn } from "@/lib/utils/cn";
import { clampConfidence, EXDS_TONE_VAR } from "../../colour";
import type { ExdsSemanticTone } from "../../types";

type ConfidenceBandProps = {
  value: number;
  label?: string;
  tone?: ExdsSemanticTone;
  className?: string;
};

/** Horizontal confidence band — 0–100. */
export function ConfidenceBand({
  value,
  label = "Confidence",
  tone = "intelligence",
  className,
}: ConfidenceBandProps) {
  const pct = clampConfidence(value);
  return (
    <div className={cn("exds-confidence-band w-full", className)}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="eos-type-caption">{label}</span>
        <span
          className="eos-type-caption exds-soft-counter"
          style={{ color: EXDS_TONE_VAR[tone] }}
        >
          {pct}%
        </span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full"
        style={{ background: "var(--eos-health-track)" }}
        role="meter"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-[width] duration-[var(--exds-duration)] ease-[var(--exds-ease)]"
          style={{
            width: `${pct}%`,
            background: EXDS_TONE_VAR[tone],
          }}
        />
      </div>
    </div>
  );
}
