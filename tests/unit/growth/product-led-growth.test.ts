import { describe, expect, it, beforeEach } from "vitest";
import {
  resetGrowthPlatform,
  beginSelfServiceCheckout,
  GROWTH_PLANS,
  runFiveMinuteActivationPath,
  getCustomerJourney,
  activationProgressPct,
  hasMinimumProviders,
  listConnectedProviders,
  computeExecutiveValueScore,
  listValueEstimates,
  synthesiseValueEstimates,
  generateExecutiveValueReport,
  generateValueNotifications,
  recommendUpgrades,
  assessCustomerHealth,
  buildUsageDashboard,
  getTrialStatus,
  cancelSubscription,
  changeSubscriptionPlan,
  assertGrowthPayload,
  getSubscriptionForOrganization,
} from "@/growth";

describe("Product-Led Growth & Executive Value Platform", () => {
  beforeEach(() => {
    resetGrowthPlatform();
  });

  const organizationId = "org-growth-1";
  const tenantId = "tenant-growth-1";

  it("supports self-service checkout, trial, upgrades, and cancellation", () => {
    expect(GROWTH_PLANS.length).toBe(4);
    const trial = beginSelfServiceCheckout({
      organizationId,
      planId: "professional",
      mode: "trial",
    });
    expect(trial.subscription.status).toBe("trialing");
    expect(getTrialStatus(organizationId).active).toBe(true);

    const paid = beginSelfServiceCheckout({
      organizationId,
      planId: "executive",
      mode: "paid",
    });
    expect(paid.subscription.status).toBe("active");
    expect(changeSubscriptionPlan({ organizationId, planId: "enterprise" })?.planId).toBe(
      "enterprise",
    );

    const usage = buildUsageDashboard(organizationId);
    expect(usage.history.length).toBeGreaterThan(0);
    expect(cancelSubscription(organizationId)?.status).toBe("cancelled");
    expect(getSubscriptionForOrganization(organizationId)?.status).toBe(
      "cancelled",
    );
  });

  it("completes the five-minute activation path with M365 + Simpro", () => {
    const result = runFiveMinuteActivationPath({
      organizationId,
      tenantId,
      profileId: "operations_executive",
      secondaryProvider: "simpro",
    });

    expect(result.progressPct).toBe(100);
    expect(result.fiveMinuteReady).toBe(true);
    expect(hasMinimumProviders(organizationId, "operations_executive")).toBe(
      true,
    );
    expect(listConnectedProviders(organizationId)).toEqual(
      expect.arrayContaining(["microsoft365", "simpro"]),
    );

    const journey = getCustomerJourney(organizationId)!;
    expect(activationProgressPct(journey.steps)).toBe(100);
    expect(
      journey.steps.every((s) => s.status === "complete"),
    ).toBe(true);
    expect(journey.firstBriefAt).toBeTruthy();
  });

  it("builds explainable Executive Value Score and ROI reports", () => {
    synthesiseValueEstimates({
      organizationId,
      recommendationTitle: "Rebalance capacity",
      strategicOutcome: "Improve operational reliability",
      acceptanceCount: 4,
    });

    const estimates = listValueEstimates(organizationId);
    expect(estimates.length).toBeGreaterThan(8);
    for (const estimate of estimates.filter((e) => e.timePeriod === "30d")) {
      expect(estimate.confidence).toBeGreaterThan(0);
      expect(estimate.evidence.length).toBeGreaterThan(0);
      expect(estimate.explanation.length).toBeGreaterThan(10);
    }

    const evs = computeExecutiveValueScore({ organizationId });
    expect(evs.score).toBeGreaterThan(0);
    expect(evs.last30Days).toBeGreaterThan(0);
    expect(evs.lifetimeValue).toBeGreaterThan(0);
    expect(evs.breakdown.revenueProtected).toBeGreaterThan(0);
    expect(evs.topRecommendationByValue?.title).toContain("Rebalance");

    const report = generateExecutiveValueReport({ organizationId });
    expect(report.suitableFor).toContain("board_pack");
    expect(report.confidence).toBeGreaterThan(0);
    expect(report.narrative).toMatch(/ExecutiveOS/);

    assertGrowthPayload({
      score: evs.score,
      last30Days: evs.last30Days,
    });
  });

  it("notifies on value events and recommends upgrades from health", () => {
    beginSelfServiceCheckout({
      organizationId,
      planId: "professional",
      mode: "paid",
    });
    synthesiseValueEstimates({
      organizationId,
      acceptanceCount: 5,
      hoursProxy: 10,
    });

    const notifications = generateValueNotifications(organizationId);
    expect(notifications.length).toBeGreaterThan(0);
    expect(
      notifications.some((n) => n.kind === "significant_value"),
    ).toBe(true);

    runFiveMinuteActivationPath({
      organizationId: "org-growth-2",
      tenantId: "tenant-growth-2",
      profileId: "commercial_executive",
      secondaryProvider: "salesforce",
    });
    beginSelfServiceCheckout({
      organizationId: "org-growth-2",
      planId: "starter",
      mode: "paid",
    });
    synthesiseValueEstimates({
      organizationId: "org-growth-2",
      acceptanceCount: 6,
    });
    const upgrades = recommendUpgrades("org-growth-2");
    expect(upgrades.length).toBeGreaterThan(0);

    const health = assessCustomerHealth("org-growth-2");
    expect(["green", "amber", "red"]).toContain(health.health);
    expect(health.activationPct).toBe(100);
  });

  it("rejects forbidden billing/customer payload keys", () => {
    expect(() =>
      assertGrowthPayload({ cardNumber: "4111" } as Record<string, unknown>),
    ).toThrow(/isolation/i);
  });
});
