import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";

type UploadProgressProps = {
  stage:
    | "idle"
    | "uploading"
    | "validating"
    | "mapping"
    | "scoring"
    | "importing"
    | "complete"
    | "failed";
  progress: number;
  className?: string;
};

const STAGE_LABEL: Record<UploadProgressProps["stage"], string> = {
  idle: "Ready",
  uploading: "Receiving",
  validating: "Validating",
  mapping: "Mapping",
  scoring: "Scoring confidence",
  importing: "Creating snapshot",
  complete: "Executive Snapshot created",
  failed: "Ingestion stopped",
};

export function UploadProgress({
  stage,
  progress,
  className,
}: UploadProgressProps) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div className={cn("space-y-[var(--eos-space-sm)]", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className={ds.type.label}>{STAGE_LABEL[stage]}</p>
        <p className="eos-type-caption tabular-nums">{pct}%</p>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--eos-health-track)" }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={STAGE_LABEL[stage]}
      >
        <div
          className="h-full rounded-full transition-[width] duration-[var(--exds-duration)]"
          style={{
            width: `${pct}%`,
            background:
              stage === "failed"
                ? "var(--exds-attention)"
                : stage === "complete"
                  ? "var(--exds-improving)"
                  : "var(--exds-intelligence)",
          }}
        />
      </div>
    </div>
  );
}
