import type {
  GrowthNotification,
  GrowthNotificationKind,
} from "@/growth/framework/types";
import { computeExecutiveValueScore } from "@/growth/executive-value";

const notifications = new Map<string, GrowthNotification>();
let seq = 0;

export function resetGrowthNotifications(): void {
  notifications.clear();
  seq = 0;
}

export function pushGrowthNotification(input: {
  organizationId: string;
  kind: GrowthNotificationKind;
  title: string;
  summary: string;
}): GrowthNotification {
  seq += 1;
  const record: GrowthNotification = {
    id: `gnotif-${seq}`,
    organizationId: input.organizationId,
    kind: input.kind,
    title: input.title,
    summary: input.summary,
    createdAt: new Date().toISOString(),
    read: false,
  };
  notifications.set(record.id, record);
  return record;
}

export function generateValueNotifications(
  organizationId: string,
): GrowthNotification[] {
  const evs = computeExecutiveValueScore({ organizationId });
  const created: GrowthNotification[] = [];

  if (evs.last30Days >= 10000) {
    created.push(
      pushGrowthNotification({
        organizationId,
        kind: "significant_value",
        title: "Significant value created",
        summary: `ExecutiveOS estimates ~$${evs.last30Days.toLocaleString()} in financial value signals over the last 30 days.`,
      }),
    );
  }
  if (evs.topRecommendationByValue) {
    created.push(
      pushGrowthNotification({
        organizationId,
        kind: "recommendation_adopted",
        title: "High-value recommendation",
        summary: `${evs.topRecommendationByValue.title} is associated with ~$${evs.topRecommendationByValue.valueAud.toLocaleString()} in estimated value.`,
      }),
    );
  }
  if (evs.breakdown.revenueProtected >= 10000) {
    created.push(
      pushGrowthNotification({
        organizationId,
        kind: "revenue_protected",
        title: "Revenue protected",
        summary: `Estimated $${evs.breakdown.revenueProtected.toLocaleString()} in revenue protected from early executive action.`,
      }),
    );
  }
  if (evs.breakdown.strategicOutcomeContribution >= 50) {
    created.push(
      pushGrowthNotification({
        organizationId,
        kind: "strategic_outcome_improved",
        title: "Strategic outcome contribution",
        summary: `Recommendations are contributing ~${evs.breakdown.strategicOutcomeContribution}% toward your strategic outcomes.`,
      }),
    );
  }
  if (evs.trend === "up") {
    created.push(
      pushGrowthNotification({
        organizationId,
        kind: "high_impact_opportunity",
        title: "Value trend rising",
        summary:
          "Your Executive Value Score is trending up versus the prior period — a strong renewal signal.",
      }),
    );
  }

  return created;
}

export function listGrowthNotifications(
  organizationId: string,
): GrowthNotification[] {
  return [...notifications.values()]
    .filter((n) => n.organizationId === organizationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
