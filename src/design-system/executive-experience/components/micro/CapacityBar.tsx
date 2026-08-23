import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR } from "../../colour";
import type { ExdsSemanticTone } from "../../types";

type CapacityBarProps = {
  used: number;
  total: number;
  label?: string;
  tone?: ExdsSemanticTone;
  className?: string;
};

/** Factory / resource capacity bar. */
export function CapacityBar({
  used,
  total,
  label = "Capacity",
  tone,
  className,
}: CapacityBarProps) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.max(0, Math.min(100, Math.round((used / safeTotal) * 100)));
  const resolved: ExdsSemanticTone =
    tone ?? (pct >= 90 ? "attention" : pct >= 75 ? "watching" : "improving");

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="eos-type-caption">{label}</span>
        <span className="eos-type-caption exds-soft-counter">
          {used}/{total}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--eos-health-track)" }}
        role="meter"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: EXDS_TONE_VAR[resolved],
          }}
        />
      </div>
    </div>
  );
}
