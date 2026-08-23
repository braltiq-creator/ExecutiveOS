"use client";

import type { DesignPartnerStatus } from "@/design-partner";
import { cn } from "@/lib/utils/cn";

type Props = {
  status: Pick<
    DesignPartnerStatus,
    | "label"
    | "focusLabel"
    | "snapshotLabel"
    | "dataHealth"
    | "executiveReadiness"
    | "datasetReadiness"
    | "pilotDayLabel"
  > | {
    environmentLabel: string;
    focusLabel: string | null;
    snapshotLabel: string | null;
    dataHealth: string;
    executiveReadiness: number | null;
    datasetReadiness: number | null;
    pilotDayLabel: string;
  };
  className?: string;
};

/**
 * Subtle Design Partner status — premium, not beta language.
 */
export function DesignPartnerStatusStrip({ status, className }: Props) {
  const label =
    "environmentLabel" in status ? status.environmentLabel : status.label;

  return (
    <aside
      aria-label="Design Partner status"
      data-design-partner-status="true"
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 border-b px-1 py-3",
        className,
      )}
      style={{ borderColor: "var(--exds-electric-border)" }}
    >
      <div className="min-w-0 space-y-1">
        <p
          className="exds-editorial-label"
          style={{ color: "var(--exds-intelligence)" }}
        >
          {label}
        </p>
        {status.focusLabel ? (
          <p
            className="text-[length:0.95rem] font-semibold tracking-tight"
            style={{ color: "var(--eos-color-text)" }}
          >
            {status.focusLabel}
          </p>
        ) : null}
        {status.snapshotLabel ? (
          <p className="eos-type-caption">Snapshot · {status.snapshotLabel}</p>
        ) : null}
      </div>
      <dl className="flex flex-wrap gap-6">
        <div>
          <dt className="exds-editorial-label">Data</dt>
          <dd className="eos-type-supporting mt-0.5 capitalize">
            {status.dataHealth}
          </dd>
        </div>
        <div>
          <dt className="exds-editorial-label">Executive readiness</dt>
          <dd className="eos-type-supporting mt-0.5 tabular-nums">
            {status.executiveReadiness != null
              ? `${status.executiveReadiness}%`
              : "Not yet established"}
          </dd>
        </div>
        <div>
          <dt className="exds-editorial-label">Pilot</dt>
          <dd className="eos-type-supporting mt-0.5">{status.pilotDayLabel}</dd>
        </div>
      </dl>
    </aside>
  );
}
