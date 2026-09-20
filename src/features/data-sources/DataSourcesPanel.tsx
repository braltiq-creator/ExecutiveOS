"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import type { OrganizationDataSource } from "@/verified-evidence/data-sources/types";
import {
  dataSourceStatusDisplay,
  dataSourceStatusLabel,
  formatCadenceLabel,
  formatLastUpdatedLabel,
  type DataSourceStatusDisplay,
} from "@/verified-evidence/data-sources/status-display";

type DataSourcesPanelProps = {
  sources: OrganizationDataSource[];
  className?: string;
};

function statusDotClass(status: DataSourceStatusDisplay): string {
  switch (status) {
    case "current":
      return "bg-[var(--exds-improving)]";
    case "update_due":
      return "bg-[var(--exds-attention,var(--eos-color-warning,#b45309))]";
    case "awaiting_first_upload":
      return "bg-[var(--eos-color-text-muted)]";
  }
}

export function DataSourcesPanel({ sources, className }: DataSourcesPanelProps) {
  if (sources.length === 0) {
    return (
      <div className={cn("space-y-[var(--eos-space-lg)]", className)}>
        <p className="eos-type-body text-[var(--eos-color-text)]">
          No data sources yet. Create your first Executive Snapshot to establish
          a durable weekly source such as Commercial Pipeline.
        </p>
        <Link
          href="/onboarding/snapshot"
          className={cn(
            "inline-flex items-center rounded-[var(--eos-radius-md)] px-4 py-2",
            "bg-[var(--exds-intelligence)] text-[var(--eos-color-text-inverse,#fff)]",
            ds.type.label,
          )}
        >
          Open Snapshot Studio
        </Link>
      </div>
    );
  }

  return (
    <ul className={cn("divide-y divide-[var(--eos-color-border)]", className)}>
      {sources.map((source) => {
        const status = dataSourceStatusDisplay(source);
        const hasHistory = Boolean(
          source.lastReceivedAt || source.lastSnapshotId,
        );
        const ctaLabel = hasHistory ? "Upload New Data" : "Upload Data";
        const href = `/onboarding/snapshot?source=${encodeURIComponent(source.id)}&mode=recurring`;

        return (
          <li
            key={source.id}
            className="flex flex-col gap-3 py-[var(--eos-space-lg)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <h2 className="eos-type-heading text-[var(--eos-color-text)]">
                {source.name}
              </h2>
              <p className="eos-type-supporting">
                {formatCadenceLabel(source.expectedCadence)}
              </p>
              <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
                Last updated:{" "}
                {formatLastUpdatedLabel(
                  source.lastReceivedAt ?? source.lastSnapshotAt,
                )}
              </p>
              <p className="eos-type-supporting flex items-center gap-2">
                <span
                  className={cn("inline-block h-2 w-2 rounded-full", statusDotClass(status))}
                  aria-hidden
                />
                <span>Status: {dataSourceStatusLabel(status)}</span>
              </p>
            </div>
            <Link
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-[var(--eos-radius-md)] px-4 py-2",
                "border border-[var(--eos-color-border)] text-[var(--eos-color-text)]",
                "hover:bg-[var(--eos-color-surface-muted)]",
                ds.type.label,
                ds.focusRing,
              )}
            >
              {ctaLabel}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
