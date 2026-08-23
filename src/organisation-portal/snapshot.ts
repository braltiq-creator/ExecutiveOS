/**
 * Customer-facing Organisation Portal snapshot.
 * Joins account → organisation → provisioning job → trial → packs.
 */

import { listExecutives, seedDefaultOwner } from "@/account";
import { buildOrganisationDetails } from "@/organisation-portal/organisation/details";
import { buildConnectedSystems } from "@/organisation-portal/connected-systems/catalog";
import { buildExecutiveIntelligenceSection } from "@/organisation-portal/executive-intelligence/section";
import { buildSubscriptionSection } from "@/organisation-portal/subscription/section";
import { buildSecuritySection } from "@/organisation-portal/security/section";
import { buildUsageValueSection } from "@/organisation-portal/usage-value/section";
import { buildSupportSection } from "@/organisation-portal/support/section";
import type { OrganisationPortalSnapshot } from "@/organisation-portal/types";
import {
  getAccount,
  listJobs,
  listOrganisations,
} from "@/provisioning/store";
import type { ProvisioningExecutiveProfileId } from "@/provisioning/types";

export type PortalContextInput = {
  /** Prefer explicit ids; otherwise uses latest provisioned org */
  organisationId?: string;
  accountId?: string;
  tenantId?: string;
  asOf?: string;
};

function resolveContext(input: PortalContextInput): {
  organisationId: string;
  accountId: string;
  tenantId: string | null;
  executiveProfileId: ProvisioningExecutiveProfileId | string;
  packIds: string[];
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  apiKeys: import("@/provisioning/types").ProvisionedApiKey[];
} {
  const jobs = listJobs().filter((j) => j.status === "completed");
  const orgs = listOrganisations();

  const job =
    (input.tenantId
      ? jobs.find((j) => j.tenantId === input.tenantId)
      : undefined) ??
    (input.organisationId
      ? jobs.find((j) => j.organisationId === input.organisationId)
      : undefined) ??
    (input.accountId
      ? jobs.find((j) => j.accountId === input.accountId)
      : undefined) ??
    jobs[0];

  const org =
    (input.organisationId
      ? orgs.find((o) => o.id === input.organisationId)
      : undefined) ??
    (job ? orgs.find((o) => o.id === job.organisationId) : undefined) ??
    orgs[0];

  const accountId = input.accountId ?? job?.accountId ?? "acct-demo";
  const account = getAccount(accountId);

  if (!org && !job) {
    return {
      organisationId: "org-demo-portal",
      accountId: "acct-demo",
      tenantId: "tenant-northline",
      executiveProfileId: "operations_executive",
      packIds: [],
      companyName: "Demo Organisation",
      ownerName: "Executive Owner",
      ownerEmail: "owner@example.com",
      apiKeys: [],
    };
  }

  return {
    organisationId: org?.id ?? job?.organisationId ?? "org-demo-portal",
    accountId,
    tenantId: input.tenantId ?? job?.tenantId ?? null,
    executiveProfileId: job?.executiveProfileId ?? "operations_executive",
    packIds: job?.packIds ?? [],
    companyName: org?.name ?? account?.company ?? "Your organisation",
    ownerName: account?.name ?? "Executive Owner",
    ownerEmail: account?.email ?? "owner@example.com",
    apiKeys: job?.apiKeys ?? [],
  };
}

/**
 * Primary API for Organisation Portal pages.
 */
export function getOrganisationPortalSnapshot(
  input: PortalContextInput = {},
): OrganisationPortalSnapshot {
  const asOf = input.asOf ?? new Date().toISOString();
  const ctx = resolveContext(input);

  seedDefaultOwner({
    organisationId: ctx.organisationId,
    name: ctx.ownerName,
    email: ctx.ownerEmail,
    executiveProfileId: String(ctx.executiveProfileId),
    asOf,
  });

  const executives = listExecutives(ctx.organisationId);

  const organisation = buildOrganisationDetails({
    organisationId: ctx.organisationId,
    tenantId: ctx.tenantId,
    companyFallback: ctx.companyName,
  });

  const connectedSystems = buildConnectedSystems({
    connectedProviderIds: [],
    asOf,
  });

  const executiveIntelligence = buildExecutiveIntelligenceSection({
    executiveProfileId: ctx.executiveProfileId,
    packIds: ctx.packIds,
  });

  const subscription = buildSubscriptionSection({
    organisationId: ctx.organisationId,
    tenantId: ctx.tenantId,
    asOf,
  });

  const security = buildSecuritySection({
    accountId: ctx.accountId,
    organisationId: ctx.organisationId,
    tenantId: ctx.tenantId,
    provisionedKeys: ctx.apiKeys,
  });

  const usageValue = buildUsageValueSection({
    organisationName: organisation.name,
    executivesActive: executives.filter((e) => e.status === "active").length,
    packsInstalled: ctx.packIds.length,
    connectorsConnected: connectedSystems.filter((s) => s.status === "connected")
      .length,
  });

  return {
    asOf,
    organisation,
    executives,
    connectedSystems,
    executiveIntelligence,
    subscription,
    security,
    usageValue,
    support: buildSupportSection(),
  };
}
