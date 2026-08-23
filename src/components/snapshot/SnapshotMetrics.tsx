"use client";

import Link from "next/link";
import { AnimatedValue } from "@/components/snapshot/AnimatedValue";
import type { SnapshotMetric } from "@/lib/snapshot/types";
import { ExecutiveMetric, ds } from "@/design-system";
import { cn } from "@/lib/utils/cn";

type SnapshotMetricsProps = {
  metrics: SnapshotMetric[];
};

export function SnapshotMetrics({ metrics }: SnapshotMetricsProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-3 sm:grid-cols-6",
        "gap-x-[var(--eos-space-lg)] gap-y-[var(--eos-space-md)]",
      )}
    >
      {metrics.map((metric) => (
        <li key={metric.id}>
          <Link
            href={metric.href}
            className={cn("eos-metric-block block", ds.focusRing)}
            data-emphasis={metric.emphasis ? "true" : "false"}
          >
            <ExecutiveMetric
              label={metric.label}
              emphasis={metric.emphasis}
              value={
                <AnimatedValue
                  value={metric.value}
                  numericValue={metric.numericValue}
                />
              }
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
