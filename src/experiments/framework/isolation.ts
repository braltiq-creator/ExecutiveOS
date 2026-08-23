/**
 * Tenant isolation for Pilot Intelligence & Experimentation.
 * Allowed: anonymised scores, counts, rates, feature keys.
 * Forbidden: customer business payloads.
 */

const FORBIDDEN_KEYS = [
  "discoveries",
  "opportunities",
  "jobs",
  "emails",
  "messages",
  "decisionContent",
  "businessEvents",
  "rawProviderPayload",
  "customerName",
  "accountName",
  "opportunityName",
  "jobTitle",
  "emailBody",
] as const;

export function assertExperimentsPayload(
  payload: Record<string, unknown>,
): void {
  for (const key of FORBIDDEN_KEYS) {
    if (key in payload) {
      throw new Error(
        `Experiments isolation violation: forbidden key "${key}"`,
      );
    }
  }
}

/** Strip any accidental business fields from a telemetry bag. */
export function anonymiseExperimentTelemetry<T extends Record<string, unknown>>(
  payload: T,
): T {
  const next = { ...payload };
  for (const key of FORBIDDEN_KEYS) {
    delete next[key];
  }
  return next;
}

export function partnerLabelFromTenantId(tenantId: string): string {
  const slug = tenantId.replace(/^tenant-/, "");
  return `Partner ${slug.slice(0, 12)}`;
}
