/**
 * Industry inference — only ask when not confidently inferred.
 */

import type { DiscoveryItem } from "@/onboarding/types";

export function inferIndustry(discoveries: DiscoveryItem[]): {
  industry: string | null;
  confidence: number;
  askUser: boolean;
} {
  const hasFieldService = discoveries.some((d) => d.source === "simpro");
  if (hasFieldService) {
    return {
      industry: "Field Services",
      confidence: 90,
      askUser: false,
    };
  }
  const hasCollabOnly =
    discoveries.some((d) => d.source === "microsoft365") &&
    !discoveries.some((d) => d.source === "simpro");
  if (hasCollabOnly) {
    return {
      industry: null,
      confidence: 40,
      askUser: true,
    };
  }
  return { industry: null, confidence: 0, askUser: true };
}
