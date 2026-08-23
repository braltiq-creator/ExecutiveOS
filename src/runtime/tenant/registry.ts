import type { Tenant, TenantId } from "@/runtime/tenant/types";

const tenants = new Map<TenantId, Tenant>();

export function registerTenant(tenant: Tenant): Tenant {
  tenants.set(tenant.id, tenant);
  return tenant;
}

export function getTenant(id: TenantId): Tenant | undefined {
  return tenants.get(id);
}

export function listTenants(): Tenant[] {
  return [...tenants.values()];
}

export function clearTenantRegistry(): void {
  tenants.clear();
}

export function createNorthlineTenant(asOf = "2026-07-26T08:00:00+10:00"): Tenant {
  const tenant: Tenant = {
    id: "tenant-northline",
    identity: {
      slug: "northline",
      legalName: "Northline Holdings Pty Ltd",
      displayName: "Northline",
    },
    organisationId: "org-northline",
    businessUnitIds: ["bu-enterprise", "bu-field"],
    regions: ["au"],
    executiveTeamIds: ["team-elt"],
    connectorRegistryIds: ["connector-m365", "connector-sap", "connector-maximo"],
    knowledgePackIds: ["field-services-simpro"],
    contextProviderIds: ["microsoft365"],
    configuration: {
      timezone: "Australia/Sydney",
      briefingHour: 7,
      intelligenceProfileId: "operations_executive",
    },
    branding: {
      displayName: "Northline",
      primaryColor: "#1a1a1a",
    },
    licensing: {
      planId: "enterprise",
      status: "active",
      seats: 25,
      modules: [
        "executive_intelligence",
        "executive_council",
        "futures",
        "agenda",
        "connectivity",
        "microsoft365_context",
        "simpro_context",
        "salesforce_context",
      ],
    },
    dataResidency: "au",
    retention: {
      auditDays: 2555,
      eventDays: 730,
      knowledgeDays: 1825,
      softDeleteDays: 90,
    },
    isolationRules: [
      {
        id: "iso-data",
        kind: "data",
        description: "Tenant data never crosses organisation boundary",
        enforced: true,
      },
      {
        id: "iso-connector",
        kind: "connector",
        description: "Connector credentials scoped to tenant",
        enforced: true,
      },
      {
        id: "iso-workspace",
        kind: "workspace",
        description: "Workspace separation within tenant",
        enforced: true,
      },
    ],
    createdAt: asOf,
    status: "active",
  };
  return registerTenant(tenant);
}

export type * from "@/runtime/tenant/types";
