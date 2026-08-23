import type {
  FeatureKey,
  OrganizationUsageRecord,
  PlanFeatures,
  PlanRecord,
  SubscriptionRecord,
} from "@/lib/billing/types";
import { BillingError } from "@/lib/billing/types";

export type FeatureEntitlements = {
  organizationId: string;
  plan: PlanRecord;
  subscription: SubscriptionRecord;
  features: PlanFeatures;
  usage: OrganizationUsageRecord;
  limits: {
    aiRequests: number;
    storageBytes: number;
    seats: number;
  };
};

export function hasFeature(
  entitlements: FeatureEntitlements,
  feature: FeatureKey,
): boolean {
  return Boolean(entitlements.features[feature]);
}

export function isWithinAiLimit(entitlements: FeatureEntitlements): boolean {
  return entitlements.usage.ai_requests < entitlements.limits.aiRequests;
}

export function isWithinStorageLimit(entitlements: FeatureEntitlements): boolean {
  return Number(entitlements.usage.storage_bytes) < entitlements.limits.storageBytes;
}

export function assertFeatureEnabled(
  entitlements: FeatureEntitlements,
  feature: FeatureKey,
): void {
  if (!hasFeature(entitlements, feature)) {
    throw new BillingError(
      `This capability requires a plan upgrade (${feature.replaceAll("_", " ")}).`,
      "FEATURE_NOT_AVAILABLE",
    );
  }
}

export function assertAiRequestAllowed(entitlements: FeatureEntitlements): void {
  assertFeatureEnabled(entitlements, "ai_chief_of_staff");

  if (!isWithinAiLimit(entitlements)) {
    throw new BillingError(
      "AI request limit reached for your current plan.",
      "AI_LIMIT_REACHED",
    );
  }
}

export function assertMeetingIntelligenceAllowed(
  entitlements: FeatureEntitlements,
): void {
  assertFeatureEnabled(entitlements, "meeting_intelligence");
}

export function assertMemoryAllowed(entitlements: FeatureEntitlements): void {
  if (hasFeature(entitlements, "unlimited_memory")) {
    return;
  }

  if (!isWithinStorageLimit(entitlements)) {
    throw new BillingError(
      "Storage limit reached for your current plan.",
      "STORAGE_LIMIT_REACHED",
    );
  }
}

export function assertHealthAnalyticsAllowed(
  entitlements: FeatureEntitlements,
): void {
  assertFeatureEnabled(entitlements, "enterprise_health_analytics");
}
