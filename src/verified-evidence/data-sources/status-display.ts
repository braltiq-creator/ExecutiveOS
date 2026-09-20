/**
 * Executive-facing Data Source status labels (Phase 37C).
 * Derived only from existing freshness helpers — never invent timestamps.
 */

import {
  computeFreshness,
} from "./freshness";
import type {
  DataSourceFreshness,
  OrganizationDataSource,
} from "./types";

export type DataSourceStatusDisplay =
  | "current"
  | "update_due"
  | "awaiting_first_upload";

export function dataSourceStatusDisplay(
  source: Pick<
    OrganizationDataSource,
    "expectedCadence" | "lastReceivedAt" | "lastSnapshotId"
  >,
  now: Date = new Date(),
): DataSourceStatusDisplay {
  if (!source.lastReceivedAt && !source.lastSnapshotId) {
    return "awaiting_first_upload";
  }

  const freshness = computeFreshness(source, now);
  return statusFromFreshness(freshness);
}

export function statusFromFreshness(
  freshness: DataSourceFreshness,
): DataSourceStatusDisplay {
  switch (freshness) {
    case "MISSING":
      return "awaiting_first_upload";
    case "CURRENT":
      return "current";
    case "DUE":
    case "OVERDUE":
    case "STALE":
      return "update_due";
    case "UNKNOWN":
    default:
      // Cadence not established but data exists — treat as current (honest unknown).
      return "current";
  }
}

export function dataSourceStatusLabel(
  status: DataSourceStatusDisplay,
): string {
  switch (status) {
    case "current":
      return "Current";
    case "update_due":
      return "Update due";
    case "awaiting_first_upload":
      return "Awaiting first upload";
  }
}

export function formatCadenceLabel(
  cadence: OrganizationDataSource["expectedCadence"],
): string {
  if (!cadence) return "Cadence not set";
  switch (cadence) {
    case "WEEKLY":
      return "Weekly";
    case "DAILY":
      return "Daily";
    case "FORTNIGHTLY":
      return "Fortnightly";
    case "MONTHLY":
      return "Monthly";
    case "AD_HOC":
      return "As needed";
    default:
      return cadence;
  }
}

export function formatLastUpdatedLabel(
  iso: string | null | undefined,
): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
