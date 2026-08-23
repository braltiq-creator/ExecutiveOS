import { ensureOrganizationSubscription } from "@/lib/billing/service";
import { getOrganizationUsageSnapshot } from "@/lib/billing/usage";
import { fetchPlanById } from "@/lib/billing/queries";
import type { FeatureEntitlements } from "@/lib/features/types";
import { fetchActiveMembership } from "@/lib/organizations/queries";

export async function getFeatureEntitlementsForUser(
  userId: string,
): Promise<FeatureEntitlements | null> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    return null;
  }

  return getFeatureEntitlementsForOrganization(
    membership.organization.id,
    membership.organization.created_by,
  );
}

export async function getFeatureEntitlementsForOrganization(
  organizationId: string,
  ownerUserId: string,
): Promise<FeatureEntitlements> {
  const subscription = await ensureOrganizationSubscription(organizationId);
  const plan = await fetchPlanById(subscription.plan);

  if (!plan) {
    throw new Error("Plan not found.");
  }

  const usage = await getOrganizationUsageSnapshot(organizationId, ownerUserId);

  return {
    organizationId,
    plan,
    subscription,
    features: plan.features_json,
    usage,
    limits: {
      aiRequests: plan.ai_request_limit,
      storageBytes: plan.storage_limit,
      seats: plan.seat_limit,
    },
  };
}

export async function requireFeatureEntitlements(
  userId: string,
): Promise<FeatureEntitlements> {
  const entitlements = await getFeatureEntitlementsForUser(userId);

  if (!entitlements) {
    throw new Error("Organization membership required.");
  }

  return entitlements;
}
