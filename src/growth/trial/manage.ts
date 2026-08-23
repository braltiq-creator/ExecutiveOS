import { getSubscriptionForOrganization } from "@/growth/subscriptions";

export function getTrialStatus(organizationId: string) {
  const sub = getSubscriptionForOrganization(organizationId);
  if (!sub || sub.status !== "trialing" || !sub.trialEndsAt) {
    return {
      active: false,
      daysRemaining: 0,
      trialEndsAt: null as string | null,
      convertPath: "/subscribe",
    };
  }
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(sub.trialEndsAt).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  return {
    active: true,
    daysRemaining,
    trialEndsAt: sub.trialEndsAt,
    convertPath: "/subscribe",
  };
}
