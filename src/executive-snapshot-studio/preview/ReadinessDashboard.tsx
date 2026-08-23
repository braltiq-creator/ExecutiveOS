import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { ConfidenceBand } from "@/design-system/executive-experience";
import type { StudioReadiness } from "../types";

type ReadinessDashboardProps = {
  readiness: StudioReadiness;
  className?: string;
};

/**
 * Executive Readiness Dashboard — Dataset readiness ≠ Judgement readiness.
 */
export function ReadinessDashboard({
  readiness,
  className,
}: ReadinessDashboardProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
        "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
        className,
      )}
      data-readiness-split="true"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className={ds.type.label}>Dataset readiness</p>
          <p
            className="eos-type-metric mt-2 text-[length:2rem]"
            style={{ color: "var(--exds-intelligence)" }}
          >
            {readiness.commercialDatasetReadiness}
            <span className="ml-1 text-[length:0.85rem] font-medium opacity-70">
              %
            </span>
          </p>
          <p className="eos-type-caption mt-1">
            Quality · coverage · freshness · relationships
          </p>
        </div>
        <div>
          <p className={ds.type.label}>Executive judgement readiness</p>
          <p
            className="eos-type-metric mt-2 text-[length:2rem]"
            style={{ color: "var(--exds-decision, var(--exds-attention))" }}
          >
            {readiness.executiveReadiness}
            <span className="ml-1 text-[length:0.85rem] font-medium opacity-70">
              %
            </span>
          </p>
          <p className="eos-type-caption mt-1">
            Separate from dataset cleanliness — never collapsed
          </p>
        </div>
      </div>

      <div className="mt-[var(--eos-space-lg)] grid gap-[var(--eos-space-md)] sm:grid-cols-2">
        <ConfidenceBand label="Quality" value={readiness.dataQuality} />
        <ConfidenceBand label="Coverage" value={readiness.coverage} />
        <ConfidenceBand label="Freshness" value={readiness.freshness} />
        <ConfidenceBand
          label="Relationships"
          value={readiness.relationshipIntegrity}
        />
        <ConfidenceBand
          label="Evidence coverage"
          value={readiness.evidenceCoverage}
        />
      </div>

      {readiness.judgementReadiness.narrative.length > 0 ? (
        <div className="mt-[var(--eos-space-md)] space-y-1">
          <p className={ds.type.label}>Judgement constraints</p>
          {readiness.judgementReadiness.narrative.map((line) => (
            <p key={line} className="eos-type-supporting">
              {line}
            </p>
          ))}
        </div>
      ) : null}

      <div className="mt-[var(--eos-space-lg)] space-y-2">
        <p className={ds.type.label}>What requires attention</p>
        {readiness.recommendations.map((rec) => (
          <div
            key={rec.id}
            className="rounded-[var(--eos-radius-sm)] border border-[var(--exds-card-border)] px-3 py-2"
          >
            <p className="eos-type-caption capitalize">{rec.priority}</p>
            <p className="eos-type-subheading text-[var(--eos-color-text)]">
              {rec.title}
            </p>
            <p className="eos-type-supporting mt-1">{rec.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
