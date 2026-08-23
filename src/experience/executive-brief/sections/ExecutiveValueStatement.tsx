"use client";

import { useMemo } from "react";
import {
  computeExecutiveValueScore,
  synthesiseValueEstimates,
  listValueEstimates,
} from "@/growth/executive-value";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ConfidenceBar } from "@/experience/motion/ConfidenceBar";
import { Reveal } from "@/experience/motion/Reveal";
import { SnapshotCta } from "@/experience/executive-brief/SnapshotCta";

type Props = {
  organizationId: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

/** Snapshot value — detail lives in Value Analysis. */
export function ExecutiveValueStatement({
  organizationId,
  delay = 3,
}: Props) {
  const evs = useMemo(() => {
    if (listValueEstimates(organizationId).length === 0) {
      synthesiseValueEstimates({ organizationId });
    }
    return computeExecutiveValueScore({ organizationId });
  }, [organizationId]);

  const trendLabel =
    evs.trend === "up" ? "Rising" : evs.trend === "down" ? "Softening" : "Steady";

  return (
    <Reveal delay={delay}>
      <section
        id="executive-value"
        aria-labelledby="executive-value-heading"
        className="ex-snapshot-block"
      >
        <p className="ex-caption mb-2">What value has been created?</p>
        <h2 id="executive-value-heading" className="sr-only">
          Executive value
        </h2>

        <ExperienceCardShell className="space-y-3 p-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="ex-value-figure text-[length:clamp(1.75rem,2.8vw,2.25rem)] tabular-nums tracking-tight">
                ${evs.last30Days.toLocaleString()}
              </p>
              <p className="ex-body mt-1">Monthly value</p>
            </div>
            <div className="space-y-1.5 text-right">
              <p className="text-sm font-medium text-[var(--ex-text)]">
                {trendLabel}
              </p>
              <ConfidenceBar
                value={evs.confidence}
                className="w-28"
                label="Confidence"
              />
            </div>
          </div>

          {evs.topRecommendationByValue ? (
            <p className="ex-body border-t border-[var(--eos-border)] pt-3 text-[var(--ex-text)]">
              <span className="ex-caption mr-2">Top recommendation</span>
              {evs.topRecommendationByValue.title}
            </p>
          ) : null}

          <SnapshotCta href="/value">View Value Analysis</SnapshotCta>
        </ExperienceCardShell>
      </section>
    </Reveal>
  );
}
