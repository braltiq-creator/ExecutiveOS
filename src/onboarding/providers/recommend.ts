/**
 * Provider connection recommendations during discovery.
 * Profiles decide which systems matter — executives never shop integrations.
 */

import type { IntelligenceProfileId, ProviderId } from "@/profiles";
import { getIntelligenceProfile } from "@/profiles";

export type ProviderRecommendation = {
  id: ProviderId;
  title: string;
  why: string;
  requiredFor: string[];
  priority: "required" | "recommended";
};

const PROVIDER_COPY: Record<
  ProviderId,
  Omit<ProviderRecommendation, "id" | "priority">
> = {
  microsoft365: {
    title: "Microsoft 365",
    why: "Learn meetings, people, and governance without asking you to describe them.",
    requiredFor: ["Executive team", "Board cadence", "Relationships"],
  },
  simpro: {
    title: "Field operations",
    why: "Learn customers, capacity, and delivery risk from live operations.",
    requiredFor: ["Customers", "Capacity", "Cash", "Jobs"],
  },
  salesforce: {
    title: "Commercial systems",
    why: "Learn pipeline, forecast, and strategic accounts from live commercial activity.",
    requiredFor: ["Pipeline", "Forecast", "Strategic accounts"],
  },
};

export function recommendProviders(input?: {
  alreadyConnected?: ProviderId[];
  profileId?: IntelligenceProfileId;
}): ProviderRecommendation[] {
  const connected = new Set(input?.alreadyConnected ?? []);
  const preferred = input?.profileId
    ? getIntelligenceProfile(input.profileId).recommendedProviders
    : (["microsoft365", "simpro", "salesforce"] as ProviderId[]);

  return preferred
    .filter((id) => !connected.has(id))
    .map((id) => ({
      id,
      ...PROVIDER_COPY[id],
      priority:
        input?.profileId &&
        getIntelligenceProfile(input.profileId).requiredProviders.includes(id)
          ? ("required" as const)
          : id === "microsoft365"
            ? ("required" as const)
            : ("recommended" as const),
    }));
}
