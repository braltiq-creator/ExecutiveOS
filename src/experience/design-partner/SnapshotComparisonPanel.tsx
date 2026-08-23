"use client";

import type { ManufacturingSnapshotComparison } from "@/design-partner";
import { cn } from "@/lib/utils/cn";

type Props = {
  comparison: ManufacturingSnapshotComparison;
  className?: string;
};

/**
 * Executive snapshot comparison — only supported deltas.
 */
export function SnapshotComparisonPanel({ comparison, className }: Props) {
  return (
    <section
      aria-label="Snapshot comparison"
      data-snapshot-comparison="true"
      className={cn(
        "rounded-[var(--exds-card-radius)] border p-[var(--eos-space-lg)]",
        className,
      )}
      style={{
        borderColor: "var(--exds-card-border)",
        background: "var(--exds-card-bg)",
      }}
    >
      <p className="exds-editorial-label">This snapshot vs previous</p>
      <p className="eos-type-supporting mt-1">
        {comparison.currentLabel} · vs · {comparison.previousLabel}
      </p>

      <p className="exds-editorial-label mt-6">What changed?</p>
      {comparison.changes.length === 0 ? (
        <p className="eos-type-supporting mt-2">
          No comparable changes established across both snapshots.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {comparison.changes.map((change) => (
            <li
              key={change.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b py-2"
              style={{ borderColor: "var(--exds-card-border)" }}
            >
              <div>
                <p className="eos-type-subheading">{change.label}</p>
                <p className="eos-type-caption mt-0.5">{change.detail}</p>
              </div>
              {change.deltaLabel ? (
                <p
                  className="tabular-nums font-semibold"
                  style={{ color: "var(--exds-intelligence)" }}
                >
                  {change.deltaLabel}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {comparison.unsupported.length > 0 ? (
        <div className="mt-6">
          <p className="exds-editorial-label">Not established for comparison</p>
          <ul className="mt-2 space-y-1">
            {comparison.unsupported.map((item) => (
              <li key={item} className="eos-type-caption">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
