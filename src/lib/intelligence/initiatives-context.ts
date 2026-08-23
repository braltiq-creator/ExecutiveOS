import type { InitiativeWithLinks } from "@/lib/initiatives/types";
import type { ExecutiveInitiativesContext } from "@/types/intelligence";
import { mapExecutiveInitiatives } from "@/lib/initiatives/intelligence";

export function mapInitiativeRecordsToContext(
  initiatives: InitiativeWithLinks[],
): ExecutiveInitiativesContext {
  if (initiatives.length === 0) {
    return {
      initiatives: [],
      lastUpdatedAt: null,
      atRiskCount: 0,
      offTrackCount: 0,
      activeCount: 0,
    };
  }

  const mapped = mapExecutiveInitiatives(initiatives);
  const lastUpdatedAt = initiatives.reduce<string | null>((latest, item) => {
    if (!latest) {
      return item.initiative.updated_at;
    }

    return new Date(item.initiative.updated_at) > new Date(latest)
      ? item.initiative.updated_at
      : latest;
  }, null);

  return {
    initiatives: mapped,
    lastUpdatedAt,
    atRiskCount: mapped.filter((item) => item.healthStatus === "at_risk").length,
    offTrackCount: mapped.filter((item) => item.healthStatus === "off_track")
      .length,
    activeCount: mapped.filter((item) => item.status === "active").length,
  };
}
