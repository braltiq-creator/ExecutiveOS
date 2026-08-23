import type {
  ActivationStepId,
  CustomerJourneyState,
} from "@/growth/framework/types";
import type { IntelligenceProfileId } from "@/profiles";
import type { PlanId } from "@/lib/billing/types";
import {
  activationProgressPct,
  createActivationSteps,
} from "@/growth/activation/steps";
import { recordGrowthTelemetry } from "@/growth/telemetry";

const journeys = new Map<string, CustomerJourneyState>();

export function resetActivationJourneys(): void {
  journeys.clear();
}

export function startCustomerJourney(input: {
  organizationId: string;
  tenantId: string;
  profileId: IntelligenceProfileId;
  authMethod?: CustomerJourneyState["authMethod"];
  planId?: PlanId | "trial";
}): CustomerJourneyState {
  const now = new Date().toISOString();
  const state: CustomerJourneyState = {
    organizationId: input.organizationId,
    tenantId: input.tenantId,
    profileId: input.profileId,
    authMethod: input.authMethod ?? "email",
    planId: input.planId ?? "trial",
    steps: createActivationSteps(["account_created"]),
    startedAt: now,
    firstBriefAt: null,
    fiveMinuteReady: false,
    updatedAt: now,
  };
  journeys.set(input.organizationId, state);
  recordGrowthTelemetry({
    organizationId: input.organizationId,
    name: "journey_started",
    properties: { profileId: input.profileId },
  });
  return state;
}

export function completeActivationStep(input: {
  organizationId: string;
  stepId: ActivationStepId;
  detail?: string;
}): CustomerJourneyState | null {
  const current = journeys.get(input.organizationId);
  if (!current) return null;
  const now = new Date().toISOString();
  const steps = current.steps.map((step) =>
    step.id === input.stepId
      ? {
          ...step,
          status: "complete" as const,
          completedAt: now,
          detail: input.detail ?? step.detail,
        }
      : step,
  );

  // Mark next pending step in_progress for guidance
  const firstPending = steps.find((s) => s.status === "pending");
  const guided = steps.map((step) =>
    firstPending && step.id === firstPending.id
      ? { ...step, status: "in_progress" as const }
      : step,
  );

  const briefReady = guided.some(
    (s) => s.id === "first_brief_ready" && s.status === "complete",
  );
  const valueReady = guided.some(
    (s) => s.id === "value_explained" && s.status === "complete",
  );
  const elapsedMs = Date.now() - new Date(current.startedAt).getTime();
  const fiveMinuteReady =
    briefReady && valueReady && elapsedMs <= 5 * 60 * 1000;

  const next: CustomerJourneyState = {
    ...current,
    steps: guided,
    firstBriefAt: briefReady ? current.firstBriefAt ?? now : current.firstBriefAt,
    fiveMinuteReady: current.fiveMinuteReady || fiveMinuteReady,
    updatedAt: now,
  };
  journeys.set(input.organizationId, next);
  recordGrowthTelemetry({
    organizationId: input.organizationId,
    name: "activation_step_complete",
    properties: {
      stepId: input.stepId,
      progressPct: activationProgressPct(guided),
    },
  });
  return next;
}

export function getCustomerJourney(
  organizationId: string,
): CustomerJourneyState | undefined {
  return journeys.get(organizationId);
}

export function listCustomerJourneys(): CustomerJourneyState[] {
  return [...journeys.values()];
}

export { activationProgressPct };
