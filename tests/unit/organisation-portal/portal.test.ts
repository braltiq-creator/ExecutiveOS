import { beforeEach, describe, expect, it } from "vitest";
import { clearTenantRegistry } from "@/runtime/tenant";
import { resetLicenses } from "@/commercial/licensing/store";
import { resetGrowthSubscriptions } from "@/growth/subscriptions/store";
import {
  createIntelligencePackRegistry,
  setIntelligencePackRegistry,
} from "@/intelligence-packs/registry";
import {
  inviteExecutive,
  resetAccountStore,
  enableMfa,
} from "@/account";
import {
  ORGANISATION_PORTAL_NAV,
  getOrganisationPortalSnapshot,
  reviewOrganisationPortal,
} from "@/organisation-portal";
import {
  resetCustomerProvisioning,
  startFreeTrial,
} from "@/provisioning";

describe("Organisation Portal (Phase 54)", () => {
  beforeEach(() => {
    resetCustomerProvisioning();
    resetAccountStore();
    clearTenantRegistry();
    resetLicenses();
    resetGrowthSubscriptions();
    setIntelligencePackRegistry(createIntelligencePackRegistry());
  });

  it("exposes eight primary portal navigation items", () => {
    expect(ORGANISATION_PORTAL_NAV).toHaveLength(8);
    expect(ORGANISATION_PORTAL_NAV.map((n) => n.id)).toEqual([
      "organisation",
      "executives",
      "connected_systems",
      "executive_intelligence",
      "subscription",
      "security",
      "usage_value",
      "support",
    ]);
  });

  it("builds a full portal snapshot after self-service provisioning", () => {
    const result = startFreeTrial({
      name: "Casey Owner",
      email: "casey@portal.test",
      password: "securepass1",
      company: "Portal Industries",
      executiveProfileId: "manufacturing_executive",
      asOf: "2026-08-08T15:30:00+10:00",
    });

    const snapshot = getOrganisationPortalSnapshot({
      organisationId: result.job.organisationId ?? undefined,
      accountId: result.job.accountId,
      tenantId: result.job.tenantId ?? undefined,
    });

    expect(snapshot.organisation.name).toBe("Portal Industries");
    expect(snapshot.organisation.businessUnits.length).toBeGreaterThan(0);
    expect(snapshot.executives.some((e) => e.role === "owner")).toBe(true);
    expect(snapshot.connectedSystems).toHaveLength(4);
    expect(snapshot.executiveIntelligence.currentProfileName).toMatch(
      /Manufacturing/i,
    );
    expect(snapshot.executiveIntelligence.installedPacks.length).toBeGreaterThan(
      0,
    );
    expect(snapshot.subscription.trial.active).toBe(true);
    expect(snapshot.security.sessions.length).toBeGreaterThan(0);
    expect(snapshot.usageValue.executiveValueScore).toBeGreaterThan(0);
    expect(snapshot.support.training.length).toBeGreaterThan(0);
  });

  it("supports inviting executives and enabling MFA", () => {
    const result = startFreeTrial({
      name: "Owner",
      email: "owner@invite.test",
      password: "securepass1",
      company: "Invite Co",
      executiveProfileId: "operations_executive",
    });

    const orgId = result.job.organisationId!;
    inviteExecutive({
      organisationId: orgId,
      name: "Pat Executive",
      email: "pat@invite.test",
    });
    enableMfa(result.job.accountId);

    const snapshot = getOrganisationPortalSnapshot({
      organisationId: orgId,
      accountId: result.job.accountId,
      tenantId: result.job.tenantId ?? undefined,
    });

    expect(snapshot.executives.some((e) => e.email === "pat@invite.test")).toBe(
      true,
    );
    expect(snapshot.security.mfa.enabled).toBe(true);
  });

  it("surfaces subscription upgrade and value understanding", () => {
    startFreeTrial({
      name: "Value Owner",
      email: "value@portal.test",
      password: "securepass1",
      company: "Value Co",
      executiveProfileId: "commercial_executive",
    });

    const snapshot = getOrganisationPortalSnapshot();
    expect(snapshot.subscription.upgradePath).toBe("/subscribe");
    expect(snapshot.usageValue.businessOutcomes.length).toBeGreaterThan(0);
    expect(snapshot.usageValue.roiLabel.length).toBeGreaterThan(0);
  });

  it("passes Phase 54 self-review", () => {
    const review = reviewOrganisationPortal();
    expect(review.manageOrganisationIndependently).toBe(true);
    expect(review.canInviteExecutives).toBe(true);
    expect(review.canConnectSystems).toBe(true);
    expect(review.canManageBilling).toBe(true);
    expect(review.canUnderstandValue).toBe(true);
    expect(review.allPassed).toBe(true);
  });
});
