/**
 * Five-minute activation path:
 * Purchase → Connect providers → Discovery → First Brief → Value explained
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { PlanId } from "@/lib/billing/types";
import {
  completeActivationStep,
  getCustomerJourney,
  startCustomerJourney,
} from "@/growth/activation/store";
import { beginSelfServiceCheckout } from "@/growth/checkout";
import { markProviderConnected } from "@/growth/provider-setup";

export function runFiveMinuteActivationPath(input: {
  organizationId: string;
  tenantId: string;
  profileId: IntelligenceProfileId;
  planId?: PlanId;
  secondaryProvider: "simpro" | "salesforce";
}): {
  journey: NonNullable<ReturnType<typeof getCustomerJourney>>;
  fiveMinuteReady: boolean;
  progressPct: number;
} {
  startCustomerJourney({
    organizationId: input.organizationId,
    tenantId: input.tenantId,
    profileId: input.profileId,
    planId: input.planId ?? "professional",
  });

  beginSelfServiceCheckout({
    organizationId: input.organizationId,
    planId: input.planId ?? "professional",
    mode: "trial",
  });

  const steps = [
    "plan_selected",
    "checkout_complete",
    "microsoft_connected",
    "provider_connected",
    "data_validated",
    "executive_discovery",
    "profile_created",
    "knowledge_graph_ready",
    "scenarios_ready",
    "first_brief_ready",
    "value_explained",
  ] as const;

  markProviderConnected({
    organizationId: input.organizationId,
    providerId: "microsoft365",
  });
  markProviderConnected({
    organizationId: input.organizationId,
    providerId: input.secondaryProvider,
  });

  for (const stepId of steps) {
    completeActivationStep({
      organizationId: input.organizationId,
      stepId,
      detail: `Completed ${stepId.replace(/_/g, " ")}`,
    });
  }

  const journey = getCustomerJourney(input.organizationId)!;
  const progressPct = Math.round(
    (journey.steps.filter((s) => s.status === "complete").length /
      journey.steps.length) *
      100,
  );

  return {
    journey,
    fiveMinuteReady: journey.fiveMinuteReady || progressPct === 100,
    progressPct,
  };
}
