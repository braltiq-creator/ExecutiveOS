import { beforeEach, describe, expect, it } from "vitest";
import { clearTenantRegistry, getTenant } from "@/runtime/tenant";
import { resetLicenses } from "@/commercial/licensing/store";
import { resetGrowthSubscriptions } from "@/growth/subscriptions/store";
import {
  createIntelligencePackRegistry,
  setIntelligencePackRegistry,
} from "@/intelligence-packs/registry";
import {
  EMAIL_TEMPLATES,
  TRIAL_DAYS,
  buildOnboardingKickoff,
  buildProvisioningAdminSnapshot,
  getTrialDaysRemaining,
  listEmailTemplateIds,
  listProvisioningProfiles,
  resetCustomerProvisioning,
  retryProvisioning,
  reviewCustomerProvisioning,
  shouldPromptUpgrade,
  startFreeTrial,
  validateProvisioningJobComplete,
} from "@/provisioning";
import { listBootstrapArtefacts } from "@/provisioning/bootstrap/resources";
import { MANUFACTURING_PACK_ID } from "@/intelligence-packs/packs/manufacturing/constants";
import { getIntelligencePackRegistry } from "@/intelligence-packs/registry";

describe("Customer Provisioning Platform (Phase 53)", () => {
  beforeEach(() => {
    resetCustomerProvisioning();
    clearTenantRegistry();
    resetLicenses();
    resetGrowthSubscriptions();
    setIntelligencePackRegistry(createIntelligencePackRegistry());
  });

  it("lists three executive profiles including Manufacturing", () => {
    const profiles = listProvisioningProfiles();
    expect(profiles.map((p) => p.id).sort()).toEqual(
      [
        "commercial_executive",
        "manufacturing_executive",
        "operations_executive",
      ].sort(),
    );
  });

  it("provisions a tenant end-to-end without Braltiq", () => {
    const result = startFreeTrial({
      name: "Alex Founder",
      email: "alex@forgeworks.test",
      password: "securepass1",
      company: "Forgeworks Trial Co",
      executiveProfileId: "operations_executive",
      asOf: "2026-08-08T14:00:00+10:00",
    });

    expect(result.ok).toBe(true);
    expect(result.redirectPath).toBe("/onboarding");
    expect(result.job.status).toBe("completed");
    expect(result.job.tenantId).toBeTruthy();
    expect(result.job.trialId).toBeTruthy();
    expect(result.job.apiKeys.length).toBe(1);
    expect(result.job.durationMs).toBeLessThan(5 * 60 * 1000);

    const tenant = getTenant(result.job.tenantId!);
    expect(tenant?.status).toBe("active");
    expect(tenant?.licensing.status).toBe("trial");
    expect(tenant?.configuration.executiveCouncilEnabled).toBe(true);

    const complete = validateProvisioningJobComplete(result.job);
    expect(complete.ok).toBe(true);

    const artefacts = listBootstrapArtefacts(result.job.tenantId!);
    expect(artefacts.map((a) => a.kind)).toEqual(
      expect.arrayContaining([
        "executive_council",
        "knowledge_graph",
        "organisational_memory",
        "strategy",
        "dashboard",
        "api_key",
      ]),
    );
  });

  it("assigns Manufacturing pack for Manufacturing Executive profile", () => {
    const result = startFreeTrial({
      name: "Morgan Ops",
      email: "morgan@oem.test",
      password: "securepass1",
      company: "OEM Partners",
      executiveProfileId: "manufacturing_executive",
      asOf: "2026-08-08T14:05:00+10:00",
    });

    expect(result.ok).toBe(true);
    expect(result.job.packIds).toContain(MANUFACTURING_PACK_ID);
    expect(result.job.intelligenceProfileId).toBe("operations_executive");
    expect(
      getIntelligencePackRegistry().activePackIds(),
    ).toContain(MANUFACTURING_PACK_ID);
  });

  it("creates a 30-day trial and tracks days remaining", () => {
    const result = startFreeTrial({
      name: "Sam Commercial",
      email: "sam@growth.test",
      password: "securepass1",
      company: "Growth Co",
      executiveProfileId: "commercial_executive",
      asOf: "2026-08-08T14:10:00+10:00",
    });

    expect(TRIAL_DAYS).toBe(30);
    const remaining = getTrialDaysRemaining(
      result.job.tenantId!,
      "2026-08-08T14:10:00+10:00",
    );
    expect(remaining).toBe(30);
    expect(
      shouldPromptUpgrade(result.job.tenantId!, "2026-09-04T14:10:00+10:00"),
    ).toBe(true);
  });

  it("kicks off onboarding with only minimum questions", () => {
    const kickoff = buildOnboardingKickoff({
      tenantId: "tenant-demo",
      userId: "acct-1",
    });
    expect(kickoff.entryPath).toBe("/onboarding");
    expect(kickoff.ask).toEqual({
      role: true,
      topThreeStrategicOutcomes: true,
      preferredBriefingTime: true,
    });
    expect(kickoff.discoverAutomatically.length).toBeGreaterThan(3);
  });

  it("includes all required email templates", () => {
    expect(listEmailTemplateIds()).toHaveLength(8);
    expect(EMAIL_TEMPLATES.welcome.subject).toMatch(/Welcome/i);
    expect(EMAIL_TEMPLATES.trial_reminder.render({
      name: "A",
      company: "C",
      daysRemaining: "3",
      upgradeUrl: "/subscribe",
    })).toMatch(/3 days/);
  });

  it("retries completed jobs idempotently", () => {
    const result = startFreeTrial({
      name: "Retry User",
      email: "retry@example.test",
      password: "securepass1",
      company: "Retry Co",
      executiveProfileId: "operations_executive",
    });
    const again = retryProvisioning(result.job.id);
    expect(again.ok).toBe(true);
    expect(again.job.status).toBe("completed");
  });

  it("builds admin snapshot with organisations, trials, verification", () => {
    startFreeTrial({
      name: "Admin View",
      email: "adminview@example.test",
      password: "securepass1",
      company: "Admin View Co",
      executiveProfileId: "operations_executive",
    });
    const snapshot = buildProvisioningAdminSnapshot();
    expect(snapshot.organisations.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.jobsByStatus.completed).toBeGreaterThanOrEqual(1);
    expect(snapshot.trials.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.pendingVerification.length).toBeGreaterThanOrEqual(1);
  });

  it("passes Phase 53 self-review", () => {
    const review = reviewCustomerProvisioning();
    expect(review.customerCanSelfProvision).toBe(true);
    expect(review.underFiveMinutes).toBe(true);
    expect(review.onboardingStartsImmediately).toBe(true);
    expect(review.failuresRetrySafely).toBe(true);
    expect(review.allPassed).toBe(true);
  });
});
