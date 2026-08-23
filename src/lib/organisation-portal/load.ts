/**
 * Server-side loader for Organisation Portal pages.
 */

import { requireAppAccess } from "@/lib/auth/access";
import { getOrganisationPortalSnapshot } from "@/organisation-portal";
import { listJobs } from "@/provisioning/store";

export async function loadOrganisationPortal() {
  const user = await requireAppAccess({ requireOnboarding: false });

  const job = listJobs().find(
    (j) =>
      j.status === "completed" &&
      (j.accountId === user.id ||
        user.email?.toLowerCase() === undefined),
  );

  // Prefer latest completed job for demo/self-service; fall back to snapshot defaults
  const latest = listJobs().find((j) => j.status === "completed");

  const snapshot = getOrganisationPortalSnapshot({
    organisationId: job?.organisationId ?? latest?.organisationId ?? undefined,
    accountId: job?.accountId ?? latest?.accountId ?? user.id,
    tenantId: job?.tenantId ?? latest?.tenantId ?? undefined,
  });

  return { user, snapshot };
}
