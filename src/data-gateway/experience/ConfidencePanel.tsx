import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { ConfidenceBand } from "@/design-system/executive-experience";
import type { UdgConfidenceScore } from "../contracts";

type ConfidencePanelProps = {
  confidence: UdgConfidenceScore;
  className?: string;
};

const DIMENSIONS: Array<{
  key: keyof Omit<UdgConfidenceScore, "overall" | "scoredAt">;
  label: string;
}> = [
  { key: "completeness", label: "Completeness" },
  { key: "consistency", label: "Consistency" },
  { key: "freshness", label: "Freshness" },
  { key: "coverage", label: "Coverage" },
  { key: "quality", label: "Quality" },
];

export function ConfidencePanel({
  confidence,
  className,
}: ConfidencePanelProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
        "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className={ds.type.label}>Ingestion confidence</p>
        <p
          className="eos-type-metric tabular-nums"
          style={{ color: "var(--exds-intelligence)" }}
        >
          {confidence.overall}%
        </p>
      </div>
      <div className="mt-[var(--eos-space-md)] space-y-[var(--eos-space-md)]">
        {DIMENSIONS.map((dim) => (
          <ConfidenceBand
            key={dim.key}
            label={dim.label}
            value={confidence[dim.key]}
            tone="intelligence"
          />
        ))}
      </div>
    </section>
  );
}
