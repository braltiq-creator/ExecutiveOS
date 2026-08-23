import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { clampConfidence, EXDS_TONE_VAR } from "../colour";
import type { ExdsBusinessImpact, ExdsImpactDimension } from "../types";
import { ConfidenceBand } from "./micro/ConfidenceBand";

const DIMENSION_LABELS: Record<ExdsImpactDimension, string> = {
  revenue: "Revenue",
  workingCapital: "Working capital",
  customer: "Customer",
  risk: "Risk",
  people: "People",
  operations: "Operations",
};

const DIMENSION_ORDER: ExdsImpactDimension[] = [
  "revenue",
  "workingCapital",
  "customer",
  "risk",
  "people",
  "operations",
];

type BusinessImpactCardProps = {
  impact: ExdsBusinessImpact;
  title?: string;
  className?: string;
};

/**
 * Standard business impact surface for Strategy, Decisions, and Today.
 * Presentation only — values are supplied by existing engines.
 */
export function BusinessImpactCard({
  impact,
  title = "Business impact",
  className,
}: BusinessImpactCardProps) {
  const confidence = clampConfidence(impact.confidence);
  const rows = DIMENSION_ORDER.filter((key) => impact.dimensions[key]);

  return (
    <article
      className={cn(
        "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
        "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)] backdrop-blur-[18px]",
        className,
      )}
    >
      <p className={ds.type.label}>{title}</p>

      <div className="mt-[var(--eos-space-md)] grid gap-[var(--eos-space-sm)] sm:grid-cols-2">
        {rows.map((key) => (
          <div key={key} className="flex items-baseline justify-between gap-2">
            <span className="eos-type-supporting">{DIMENSION_LABELS[key]}</span>
            <span className="eos-type-body text-[var(--eos-color-text)] exds-soft-counter">
              {impact.dimensions[key]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-[var(--eos-space-lg)] space-y-[var(--eos-space-md)]">
        <ConfidenceBand value={confidence} tone="intelligence" />

        <div>
          <p className="eos-type-caption">Expected outcome</p>
          <p className="eos-type-body mt-1 text-[var(--eos-color-text)]">
            {impact.expectedOutcome}
          </p>
        </div>

        {impact.predicted || impact.actual ? (
          <div className="grid gap-[var(--eos-space-sm)] sm:grid-cols-2">
            {impact.predicted ? (
              <div>
                <p className="eos-type-caption">Predicted</p>
                <p
                  className="eos-type-supporting mt-1 exds-soft-counter"
                  style={{ color: EXDS_TONE_VAR.intelligence }}
                >
                  {impact.predicted}
                </p>
              </div>
            ) : null}
            {impact.actual ? (
              <div>
                <p className="eos-type-caption">Actual</p>
                <p className="eos-type-supporting mt-1 text-[var(--eos-color-text)] exds-soft-counter">
                  {impact.actual}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
