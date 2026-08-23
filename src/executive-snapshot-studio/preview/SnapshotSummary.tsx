import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import type { UdgExecutiveSnapshot } from "@/data-gateway";
import type { StudioReadiness } from "../types";

type SnapshotSummaryCardProps = {
  snapshot: UdgExecutiveSnapshot;
  readiness: StudioReadiness;
  profileLabel: string;
  className?: string;
};

export function SnapshotSummaryCard({
  snapshot,
  readiness,
  profileLabel,
  className,
}: SnapshotSummaryCardProps) {
  const rows: Array<[string, string]> = [
    ["Snapshot ID", snapshot.meta.snapshotId],
    ["Timestamp", snapshot.meta.createdAt.replace("T", " ").slice(0, 19)],
    ["Business profile", profileLabel],
    ["Executive readiness", `${readiness.executiveReadiness}%`],
    ["Confidence", `${snapshot.meta.confidence.overall}%`],
    ["Source", snapshot.meta.sourceKind],
    ["Data volume", `${snapshot.meta.recordCount} records`],
    ["Validation", snapshot.meta.validationStatus.replaceAll("_", " ")],
    ["Version", String(snapshot.meta.version)],
    ["Lineage", snapshot.meta.mappingId ? "Attached" : "Record-level"],
  ];

  return (
    <section
      className={cn(
        "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
        "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
        className,
      )}
    >
      <p className={ds.type.label}>Executive Snapshot</p>
      <p className="eos-type-subheading mt-1 text-[var(--eos-color-text)]">
        Immutable · replayable · ready for Reality Lab
      </p>
      <dl className="mt-[var(--eos-space-md)] grid gap-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="eos-type-caption">{k}</dt>
            <dd className="eos-type-supporting mt-0.5 break-all text-[var(--eos-color-text)]">
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
