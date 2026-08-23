/**
 * Admin provisioning dashboard queries.
 */

import { listAccounts, listJobs, listOrganisations } from "@/provisioning/store";
import { listAllTrials, refreshTrialStatus } from "@/provisioning/trial/manage";
import type {
  ProvisioningAdminSnapshot,
  ProvisioningJobStatus,
} from "@/provisioning/types";

export function buildProvisioningAdminSnapshot(
  asOf = new Date().toISOString(),
): ProvisioningAdminSnapshot {
  const jobs = listJobs();
  const orgs = listOrganisations();
  const jobsByStatus = {
    pending: 0,
    running: 0,
    awaiting_verification: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  } satisfies Record<ProvisioningJobStatus, number>;

  for (const job of jobs) {
    jobsByStatus[job.status] += 1;
  }

  const organisations = orgs.map((org) => {
    const job = jobs.find((j) => j.organisationId === org.id);
    return {
      organisationId: org.id,
      name: org.name,
      tenantId: job?.tenantId ?? null,
      status: (job?.status ?? "pending") as ProvisioningJobStatus,
      executiveProfileId:
        job?.executiveProfileId ?? ("operations_executive" as const),
      createdAt: org.createdAt,
    };
  });

  const trials = listAllTrials().map(
    (trial) => refreshTrialStatus(trial.tenantId, asOf) ?? trial,
  );

  return {
    asOf,
    organisations,
    jobsByStatus,
    failedJobs: jobs.filter((j) => j.status === "failed"),
    trials,
    pendingVerification: listAccounts().filter((a) => !a.emailVerified),
  };
}
