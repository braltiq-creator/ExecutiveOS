"use client";

import Link from "next/link";
import type { SnapshotOutcome } from "@/lib/snapshot/types";
import {
  ExecutiveBadge,
  ExecutiveSparkline,
  ExecutiveTrend,
  ds,
} from "@/design-system";
import { cn } from "@/lib/utils/cn";

type OutcomeHealthStripProps = {
  outcomes: SnapshotOutcome[];
};

/** Premium portfolio tiles — momentum and trajectory, not reporting. */
export function OutcomeHealthStrip({ outcomes }: OutcomeHealthStripProps) {
  return (
    <section aria-labelledby="outcome-health-label" className="eos-portfolio">
      <ExecutiveBadge id="outcome-health-label">Outcome Health</ExecutiveBadge>
      <ul
        className={cn(
          "mt-[var(--eos-space-lg)] grid grid-cols-2",
          "gap-[var(--eos-space-md)]",
          "lg:grid-cols-4",
        )}
      >
        {outcomes.map((outcome) => (
          <li key={outcome.id}>
            <Link
              href={outcome.href}
              className={cn("group block h-full", ds.focusRing)}
            >
              <article
                data-momentum={outcome.momentum}
                data-trend={outcome.trend}
                className="eos-outcome-card"
              >
                <span className="eos-outcome-filament" aria-hidden="true" />
                <div className="eos-outcome-body">
                  <span
                    className={cn(
                      ds.type.subheading,
                      "block truncate text-[var(--eos-color-text)]",
                    )}
                  >
                    {outcome.name}
                  </span>
                  <div
                    className={cn(
                      "mt-[var(--eos-space-sm)] flex items-end justify-between",
                      "gap-[var(--eos-space-sm)]",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="eos-momentum flex flex-wrap items-center gap-[var(--eos-space-xs)]">
                        <span className={ds.type.caption}>
                          {outcome.momentumLabel}
                        </span>
                        <ExecutiveTrend direction={outcome.trend}>
                          {outcome.movementLabel}
                        </ExecutiveTrend>
                      </p>
                      <p
                        className={cn(
                          ds.type.caption,
                          "mt-[var(--eos-space-xs)] truncate opacity-70",
                        )}
                      >
                        <span className="group-hover:hidden">
                          {outcome.lastChange}
                        </span>
                        <span
                          className="hidden group-hover:inline text-[var(--eos-color-primary)]"
                          aria-hidden="true"
                        >
                          Open Outcome
                        </span>
                      </p>
                    </div>
                    <ExecutiveSparkline
                      values={outcome.sparkline}
                      trend={outcome.trend}
                      className="eos-outcome-spark"
                    />
                  </div>
                </div>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
