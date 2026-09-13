/**
 * Source freshness from expected cadence.
 * Never invent cadence — UNKNOWN when cadence is not established.
 */

import type {
  DataSourceCadence,
  DataSourceFreshness,
  OrganizationDataSource,
} from "./types";

const MS_DAY = 24 * 60 * 60 * 1000;

function cadenceDays(cadence: DataSourceCadence): number | null {
  switch (cadence) {
    case "DAILY":
      return 1;
    case "WEEKLY":
      return 7;
    case "FORTNIGHTLY":
      return 14;
    case "MONTHLY":
      return 30;
    case "AD_HOC":
      return null;
    default:
      return null;
  }
}

export function computeFreshness(
  source: Pick<
    OrganizationDataSource,
    "expectedCadence" | "lastReceivedAt"
  >,
  now: Date = new Date(),
): DataSourceFreshness {
  if (!source.expectedCadence) {
    return "UNKNOWN";
  }

  if (source.expectedCadence === "AD_HOC") {
    return source.lastReceivedAt ? "CURRENT" : "MISSING";
  }

  const interval = cadenceDays(source.expectedCadence);
  if (interval == null) return "UNKNOWN";

  if (!source.lastReceivedAt) {
    return "MISSING";
  }

  const last = Date.parse(source.lastReceivedAt);
  if (Number.isNaN(last)) return "UNKNOWN";

  const ageDays = (now.getTime() - last) / MS_DAY;

  // CURRENT: within expected interval
  if (ageDays <= interval) return "CURRENT";
  // DUE: just past cadence window (up to +25%)
  if (ageDays <= interval * 1.25) return "DUE";
  // OVERDUE: past due but not yet stale (up to 2x)
  if (ageDays <= interval * 2) return "OVERDUE";
  // STALE: older than 2x cadence
  return "STALE";
}

export function freshnessInfluencesConfidence(
  freshness: DataSourceFreshness,
): { confidenceModifier: number; judgementHint: string | null } {
  switch (freshness) {
    case "CURRENT":
      return { confidenceModifier: 0, judgementHint: null };
    case "DUE":
      return {
        confidenceModifier: -0.05,
        judgementHint: "Weekly data is due — confirm before relying on prior evidence.",
      };
    case "OVERDUE":
      return {
        confidenceModifier: -0.15,
        judgementHint: "Source data is overdue — executive judgement required on freshness.",
      };
    case "STALE":
      return {
        confidenceModifier: -0.3,
        judgementHint: "Source data is stale — treat prior evidence with caution.",
      };
    case "MISSING":
      return {
        confidenceModifier: -0.4,
        judgementHint: "No upload received yet for this source.",
      };
    case "UNKNOWN":
    default:
      return {
        confidenceModifier: 0,
        judgementHint: "Cadence not established — freshness not assessed.",
      };
  }
}

/** Design Partner copy — avoid technical jargon. */
export function freshnessExecutiveCopy(
  freshness: DataSourceFreshness,
  sourceName: string,
): string {
  switch (freshness) {
    case "CURRENT":
      return `Your Executive Intelligence is ready (${sourceName}).`;
    case "DUE":
      return `Your weekly data is due (${sourceName}).`;
    case "OVERDUE":
      return `Your weekly data is overdue (${sourceName}).`;
    case "STALE":
      return `Your data looks outdated (${sourceName}). Upload a fresh export.`;
    case "MISSING":
      return `Upload your first ${sourceName} export to begin.`;
    case "UNKNOWN":
    default:
      return `${sourceName} is available for upload.`;
  }
}
