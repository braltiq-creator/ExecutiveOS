import type { IntelligenceProfileId } from "@/profiles";
import { listPilots } from "@/pilot";
import type {
  PilotIntelligenceSnapshot,
  ProductInsight,
  ProfileAnalytics,
} from "@/experiments/framework/types";
import { measurePilotIntelligence } from "@/experiments/pilot-intelligence";
import { listCachedInsights } from "@/experiments/insights";

export function buildProfileAnalytics(input?: {
  asOf?: string;
  intelligence?: PilotIntelligenceSnapshot[];
  insights?: ProductInsight[];
}): ProfileAnalytics[] {
  const asOf = input?.asOf;
  const profiles: IntelligenceProfileId[] = [
    "operations_executive",
    "commercial_executive",
  ];
  const allInsights = input?.insights ?? listCachedInsights();

  return profiles.map((profileId) => {
    const partners = listPilots().filter(
      (p) => p.intelligenceProfileId === profileId,
    );
    if (partners.length === 0) {
      return {
        profileId,
        partnerCount: 0,
        avgAdoption: 0,
        avgEngagement: 0,
        avgAcceptance: 0,
        avgPilotHealth: 0,
        avgSuccessProbability: 0,
        topFriction: [],
        explanation: `No ${profileId.replace(/_/g, " ")} Design Partners provisioned.`,
      };
    }

    const snaps =
      input?.intelligence?.filter((s) => s.profileId === profileId) ??
      partners.map((p) =>
        measurePilotIntelligence({
          tenantId: p.tenantId,
          profileId,
          asOf,
        }),
      );

    const avg = (pick: (s: (typeof snaps)[number]) => number) =>
      snaps.length === 0
        ? 0
        : Math.round(snaps.reduce((sum, s) => sum + pick(s), 0) / snaps.length);

    const friction = allInsights
      .filter(
        (i) =>
          (i.profileId === profileId || i.profileId === "all") &&
          (i.kind === "executive_friction" ||
            i.kind === "confusing_workflow" ||
            i.kind === "low_adoption"),
      )
      .slice(0, 3)
      .map((i) => i.title);

    return {
      profileId,
      partnerCount: partners.length,
      avgAdoption: avg((s) => s.metrics.executiveAdoption.value),
      avgEngagement: avg((s) => s.metrics.executiveEngagement.value),
      avgAcceptance: avg((s) => s.metrics.recommendationAcceptance.value),
      avgPilotHealth: avg((s) => s.metrics.pilotHealth.value),
      avgSuccessProbability: avg((s) => s.metrics.successProbability.value),
      topFriction: friction,
      explanation: `${profileId === "operations_executive" ? "Operations" : "Commercial"} Executive analytics — anonymised portfolio averages only.`,
    };
  });
}
