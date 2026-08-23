import { inviteExecutive } from "@/account";
import { startFreeTrial, resetCustomerProvisioning } from "@/provisioning";
import { resetAccountStore } from "@/account";
import { clearTenantRegistry } from "@/runtime/tenant";
import { resetLicenses } from "@/commercial/licensing/store";
import { resetGrowthSubscriptions } from "@/growth/subscriptions/store";
import {
  createIntelligencePackRegistry,
  setIntelligencePackRegistry,
} from "@/intelligence-packs/registry";
import { getOrganisationPortalSnapshot } from "@/organisation-portal/snapshot";
import { ORGANISATION_PORTAL_NAV } from "@/organisation-portal/navigation";
import type { PortalSelfReview } from "@/organisation-portal/types";

export function reviewOrganisationPortal(): PortalSelfReview {
  resetCustomerProvisioning();
  resetAccountStore();
  clearTenantRegistry();
  resetLicenses();
  resetGrowthSubscriptions();
  setIntelligencePackRegistry(createIntelligencePackRegistry());

  const notes: string[] = [];

  const provisioned = startFreeTrial({
    name: "Portal Owner",
    email: `portal-review-${Date.now()}@example.com`,
    password: "securepass1",
    company: "Portal Review Co",
    executiveProfileId: "manufacturing_executive",
    asOf: "2026-08-08T15:00:00+10:00",
  });

  const snapshot = getOrganisationPortalSnapshot({
    organisationId: provisioned.job.organisationId ?? undefined,
    accountId: provisioned.job.accountId,
    tenantId: provisioned.job.tenantId ?? undefined,
  });

  const manageOrganisationIndependently =
    Boolean(snapshot.organisation.name) &&
    ORGANISATION_PORTAL_NAV.length === 8 &&
    snapshot.organisation.health.score > 0;
  notes.push(
    manageOrganisationIndependently
      ? "Customer can manage organisation details independently."
      : "FAIL: organisation management incomplete.",
  );

  const invited = inviteExecutive({
    organisationId: snapshot.organisation.id,
    name: "Second Executive",
    email: "second@portal-review.test",
    asOf: "2026-08-08T15:01:00+10:00",
  });
  const canInviteExecutives =
    invited.status === "invited" &&
    getOrganisationPortalSnapshot({
      organisationId: snapshot.organisation.id,
    }).executives.some((e) => e.email === "second@portal-review.test");
  notes.push(
    canInviteExecutives
      ? "Executives can be invited with roles."
      : "FAIL: invite executives.",
  );

  const canConnectSystems =
    snapshot.connectedSystems.length >= 4 &&
    snapshot.connectedSystems.some((s) => s.provider === "microsoft_365") &&
    snapshot.connectedSystems.every((s) => Boolean(s.reconnectPath));
  notes.push(
    canConnectSystems
      ? "Connected systems catalogue with reconnect paths."
      : "FAIL: connected systems.",
  );

  const canManageBilling =
    Boolean(snapshot.subscription.planName) &&
    Boolean(snapshot.subscription.upgradePath) &&
    snapshot.subscription.trial.daysRemaining >= 0;
  notes.push(
    canManageBilling
      ? "Subscription, trial, and upgrade paths available."
      : "FAIL: billing management.",
  );

  const canUnderstandValue =
    snapshot.usageValue.executiveValueScore > 0 &&
    snapshot.usageValue.businessOutcomes.length > 0 &&
    Boolean(snapshot.usageValue.roiLabel);
  notes.push(
    canUnderstandValue
      ? "Usage & Value surfaces Executive Value Score and outcomes."
      : "FAIL: value understanding.",
  );

  const allPassed =
    manageOrganisationIndependently &&
    canInviteExecutives &&
    canConnectSystems &&
    canManageBilling &&
    canUnderstandValue;

  return {
    manageOrganisationIndependently,
    canInviteExecutives,
    canConnectSystems,
    canManageBilling,
    canUnderstandValue,
    allPassed,
    notes,
  };
}
