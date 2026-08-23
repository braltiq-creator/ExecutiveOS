import type { IntelligenceProfileId } from "@/profiles";
import type { Tenant } from "@/runtime/tenant/types";
import type { PilotEnvironment } from "@/pilot/types";

export type TenantTemplate = {
  id: string;
  name: string;
  intelligenceProfileId: IntelligenceProfileId;
  industryDefault: string;
  knowledgePackIds: string[];
  contextProviderIds: string[];
  modules: string[];
  description: string;
};

export const OPERATIONS_TENANT_TEMPLATE: TenantTemplate = {
  id: "template-operations-executive",
  name: "Operations Executive Pilot",
  intelligenceProfileId: "operations_executive",
  industryDefault: "Field Services",
  knowledgePackIds: ["field-services-simpro"],
  contextProviderIds: ["microsoft365", "simpro"],
  modules: [
    "executive_intelligence",
    "executive_council",
    "futures",
    "agenda",
    "connectivity",
    "microsoft365_context",
    "simpro_context",
  ],
  description:
    "Default configuration for Operations Executive Design Partners (M365 + Simpro).",
};

export const COMMERCIAL_TENANT_TEMPLATE: TenantTemplate = {
  id: "template-commercial-executive",
  name: "Commercial Executive Pilot",
  intelligenceProfileId: "commercial_executive",
  industryDefault: "B2B Services",
  knowledgePackIds: [],
  contextProviderIds: ["microsoft365", "salesforce"],
  modules: [
    "executive_intelligence",
    "executive_council",
    "futures",
    "agenda",
    "connectivity",
    "microsoft365_context",
    "salesforce_context",
  ],
  description:
    "Default configuration for Commercial Executive Design Partners (M365 + Salesforce).",
};

export const MANUFACTURING_FORECASTING_TENANT_TEMPLATE: TenantTemplate = {
  id: "template-manufacturing-forecasting",
  name: "Manufacturing Forecasting Design Partner",
  intelligenceProfileId: "operations_executive",
  industryDefault: "Manufacturing",
  knowledgePackIds: [],
  /** Pilot starts with export connector only — no live ERP credentials. */
  contextProviderIds: [],
  modules: [
    "executive_intelligence",
    "executive_council",
    "manufacturing_forecasting",
    "executive_snapshot_studio",
    "udg_csv",
  ],
  description:
    "Design Partner configuration for Manufacturing Forecasting via Excel/CSV export. No live ERP/MRP credentials required to prove value.",
};

export function getTenantTemplate(
  profileId: IntelligenceProfileId,
  focusModule?: "manufacturing_forecasting" | null,
): TenantTemplate {
  if (focusModule === "manufacturing_forecasting") {
    return MANUFACTURING_FORECASTING_TENANT_TEMPLATE;
  }
  return profileId === "commercial_executive"
    ? COMMERCIAL_TENANT_TEMPLATE
    : OPERATIONS_TENANT_TEMPLATE;
}

export function buildTenantFromTemplate(input: {
  tenantId: string;
  slug: string;
  partnerName: string;
  industry: string;
  region: Tenant["dataResidency"];
  environment: PilotEnvironment;
  seats: number;
  template: TenantTemplate;
  asOf: string;
}): Tenant {
  return {
    id: input.tenantId,
    identity: {
      slug: input.slug,
      legalName: `${input.partnerName} Pty Ltd`,
      displayName: input.partnerName,
    },
    organisationId: `org-${input.slug}`,
    businessUnitIds: ["bu-primary"],
    regions: [input.region],
    executiveTeamIds: ["team-elt"],
    connectorRegistryIds: input.template.contextProviderIds.map(
      (id) => `connector-${id}`,
    ),
    knowledgePackIds: input.template.knowledgePackIds,
    contextProviderIds: input.template.contextProviderIds,
    configuration: {
      timezone:
        input.region === "us"
          ? "America/New_York"
          : input.region === "eu" || input.region === "uk"
            ? "Europe/London"
            : "Australia/Sydney",
      briefingHour: 7,
      intelligenceProfileId: input.template.intelligenceProfileId,
      industry: input.industry,
      pilotEnvironment: input.environment,
    },
    branding: {
      displayName: input.partnerName,
      primaryColor: "#1a1a1a",
    },
    licensing: {
      planId: "design-partner-pilot",
      status: "trial",
      seats: input.seats,
      modules: input.template.modules,
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
    createdAt: input.asOf,
    status: "provisioning",
  };
}
