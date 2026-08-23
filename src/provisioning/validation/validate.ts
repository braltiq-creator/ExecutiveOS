/**
 * Provisioning validation — input + job completeness.
 */

import type {
  ProvisioningJob,
  StartFreeTrialInput,
} from "@/provisioning/types";

export function validateStartFreeTrialInput(
  input: StartFreeTrialInput,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input.name?.trim()) errors.push("Name required");
  if (!input.email?.includes("@")) errors.push("Valid email required");
  if (!input.password || input.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!input.company?.trim()) errors.push("Company required");
  if (
    !["operations_executive", "commercial_executive", "manufacturing_executive"].includes(
      input.executiveProfileId,
    )
  ) {
    errors.push("Executive profile required");
  }
  return { ok: errors.length === 0, errors };
}

export function validateProvisioningJobComplete(
  job: ProvisioningJob,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (job.status !== "completed") {
    errors.push(`Job status is ${job.status}`);
  }
  if (!job.tenantId) errors.push("Tenant missing");
  if (!job.organisationId) errors.push("Organisation missing");
  if (!job.trialId) errors.push("Trial missing");
  if (job.apiKeys.length === 0) errors.push("API keys missing");
  const required: Array<(typeof job.completedStepIds)[number]> = [
    "create_account",
    "create_tenant",
    "create_workspace",
    "assign_trial_licence",
    "assign_executive_profile",
    "ready_for_onboarding",
  ];
  for (const step of required) {
    if (!job.completedStepIds.includes(step)) {
      errors.push(`Missing step: ${step}`);
    }
  }
  return { ok: errors.length === 0, errors };
}

/** Target: under five minutes (wall clock). */
export function isUnderFiveMinutes(durationMs: number | null): boolean {
  if (durationMs == null) return false;
  return durationMs < 5 * 60 * 1000;
}
