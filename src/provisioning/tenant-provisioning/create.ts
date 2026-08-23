/**
 * Tenant creation for self-service customers.
 */

import { registerTenant, getTenant } from "@/runtime/tenant";
import type { DataResidency, Tenant } from "@/runtime/tenant/types";
import type { ProvisioningProfileDefinition } from "@/provisioning/executive-profile/catalog";

export function buildSelfServiceTenant(input: {
  organisationId: string;
  company: string;
  slug: string;
  profile: ProvisioningProfileDefinition;
  region: DataResidency;
  asOf: string;
}): Tenant {
  const tenantId = `tenant-${input.slug}`;
  const existing = getTenant(tenantId);
  if (existing) {
    // Idempotent retry — return existing
    return existing;
  }

  const tenant: Tenant = {
    id: tenantId,
    identity: {
      slug: input.slug,
      legalName: input.company,
      displayName: input.company,
    },
    organisationId: input.organisationId,
    businessUnitIds: [`bu-${input.slug}-default`],
    regions: [input.region],
    executiveTeamIds: [`team-${input.slug}-elt`],
    connectorRegistryIds: [],
    knowledgePackIds: [...input.profile.packIds],
    contextProviderIds: [],
    configuration: {
      timezone: "Australia/Sydney",
      briefingHour: 7,
      intelligenceProfileId: input.profile.intelligenceProfileId,
      provisioningProfileId: input.profile.id,
      selfService: true,
      executiveCouncilEnabled: true,
    },
    branding: {
      displayName: input.company,
    },
    licensing: {
      planId: "professional",
      status: "trial",
      seats: 3,
      modules: [
        "executive_intelligence",
        "executive_council",
        "strategy",
        "knowledge",
        "dashboard",
      ],
    },
    dataResidency: input.region,
    retention: {
      auditDays: 365,
      eventDays: 180,
      knowledgeDays: 365,
      softDeleteDays: 30,
    },
    isolationRules: [
      {
        id: `${tenantId}-iso-data`,
        kind: "data",
        description: "Tenant data isolation",
        enforced: true,
      },
      {
        id: `${tenantId}-iso-identity`,
        kind: "identity",
        description: "Identity isolation",
        enforced: true,
      },
    ],
    createdAt: input.asOf,
    status: "provisioning",
  };

  return registerTenant(tenant);
}

export function activateTenant(tenantId: string): Tenant | undefined {
  const tenant = getTenant(tenantId);
  if (!tenant) return undefined;
  const next: Tenant = { ...tenant, status: "active" };
  return registerTenant(next);
}
