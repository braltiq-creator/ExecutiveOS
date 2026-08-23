import type { FutureSpotlight, InterventionKind } from "@/futures/models/types";

export const SPOTLIGHT_LABELS: Record<FutureSpotlight, string> = {
  most_likely: "Most Likely",
  greatest_risk: "Greatest Risk",
  greatest_opportunity: "Greatest Opportunity",
  fastest_emerging: "Fastest Emerging",
  most_strategic: "Most Strategic",
};

export const INTERVENTION_KIND_LABELS: Record<InterventionKind, string> = {
  high_impact: "High impact",
  low_effort: "Low effort",
  urgent: "Urgent",
  preventative: "Preventative",
  deferred: "Deferred",
};
