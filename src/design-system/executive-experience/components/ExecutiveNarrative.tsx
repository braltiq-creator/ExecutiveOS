import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR } from "../colour";
import type { ExdsSemanticTone } from "../types";

export type NarrativeEvidenceMetric = {
  id: string;
  label: string;
  value: string;
  tone?: ExdsSemanticTone;
  /** Role caption e.g. Supports lead judgement */
  caption?: string;
  /** Window / denominator context */
  detail?: string;
  role?: string;
};

type ExecutiveNarrativeProps = {
  /** One executive sentence — judgement first, never numbers alone. */
  judgement: string;
  supporting?: ReactNode;
  /** Compact evidence metrics beneath the narrative — derived only. */
  evidenceMetrics?: NarrativeEvidenceMetric[];
  className?: string;
};

/**
 * Workspace opening narrative.
 * Lead with judgement. Numbers follow — never reverse.
 */
export function ExecutiveNarrative({
  judgement,
  supporting,
  evidenceMetrics,
  className,
}: ExecutiveNarrativeProps) {
  return (
    <header
      className={cn("exds-fade-in space-y-[var(--eos-space-sm)]", className)}
      data-exds-narrative="true"
    >
      <p className="eos-type-label">Executive judgement</p>
      <p className="eos-type-display-l max-w-4xl text-[var(--eos-color-text)]">
        {judgement}
      </p>
      {supporting ? (
        <div className="eos-type-body max-w-3xl text-[var(--eos-color-text-secondary)]">
          {supporting}
        </div>
      ) : null}
      {evidenceMetrics && evidenceMetrics.length > 0 ? (
        <ul
          className="mt-[var(--eos-space-md)] grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Supporting evidence metrics"
        >
          {evidenceMetrics.map((metric) => (
            <li
              key={metric.id}
              className="rounded-[var(--eos-radius-sm)] border border-[var(--exds-card-border)] bg-[var(--exds-card-bg)] px-3 py-2.5"
            >
              <p className="eos-type-caption">{metric.label}</p>
              <p
                className="eos-type-subheading mt-1 tabular-nums text-[var(--eos-color-text)]"
                style={
                  metric.tone
                    ? { color: EXDS_TONE_VAR[metric.tone] }
                    : undefined
                }
              >
                {metric.value}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
