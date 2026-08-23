import {
  assessSecurityHealth,
  getMfaStatus,
  importProvisionedApiKeys,
  listOrganisationApiKeys,
  listSessions,
  listTrustedDevices,
} from "@/account";
import { listProvisioningAudit } from "@/provisioning/audit/log";
import type { ProvisionedApiKey } from "@/provisioning/types";
import type { OrganisationPortalSnapshot } from "@/organisation-portal/types";

export function buildSecuritySection(input: {
  accountId: string;
  organisationId: string;
  tenantId: string | null;
  provisionedKeys?: ProvisionedApiKey[];
}): OrganisationPortalSnapshot["security"] {
  if (input.provisionedKeys?.length) {
    importProvisionedApiKeys(input.organisationId, input.provisionedKeys);
  }

  const auditHistory = input.tenantId
    ? listProvisioningAudit(input.tenantId).map((e) => ({
        id: e.id,
        summary: e.summary,
        at: e.at,
      }))
    : [];

  return {
    mfa: getMfaStatus(input.accountId),
    sessions: listSessions(input.accountId),
    trustedDevices: listTrustedDevices(input.accountId),
    auditHistory: auditHistory.slice(0, 12),
    apiKeys: listOrganisationApiKeys(input.organisationId),
    health: assessSecurityHealth({
      accountId: input.accountId,
      organisationId: input.organisationId,
    }),
  };
}
