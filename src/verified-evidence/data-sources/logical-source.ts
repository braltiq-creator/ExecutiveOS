/**
 * Stable logical Data Source identity for Snapshot Studio weekly uploads.
 * Never use raw upload filename as the durable identity.
 */

import type { StudioBusinessProfileId } from "@/executive-snapshot-studio/types";

/** Org-scoped unique name stored in organization_data_sources.name */
export function logicalDataSourceNameForProfile(
  profileId: StudioBusinessProfileId | string,
): string {
  switch (profileId) {
    case "commercial":
      return "Commercial Pipeline";
    case "manufacturing":
      return "Manufacturing Operations";
    case "field_services":
      return "Field Services Operations";
    case "mining":
      return "Mining Operations";
    case "utilities":
      return "Utilities Operations";
    case "technology":
      return "Technology Portfolio";
    default:
      return `Executive Snapshot · ${profileId}`;
  }
}

/** Design Partner commercial weekly cadence is explicit for Commercial Pipeline. */
export function defaultCadenceForLogicalSource(
  sourceName: string,
): "WEEKLY" | null {
  if (sourceName === "Commercial Pipeline") return "WEEKLY";
  if (sourceName === "Manufacturing Operations") return "WEEKLY";
  return null;
}
