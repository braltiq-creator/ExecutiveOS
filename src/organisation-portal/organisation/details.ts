import type { OrganisationDetails } from "@/organisation-portal/types";
import { getOrganisation } from "@/provisioning/store";
import { getTenant } from "@/runtime/tenant";

export function buildOrganisationDetails(input: {
  organisationId: string;
  tenantId?: string | null;
  companyFallback?: string;
}): OrganisationDetails {
  const org = getOrganisation(input.organisationId);
  const tenant = input.tenantId ? getTenant(input.tenantId) : undefined;
  const name =
    org?.name ??
    tenant?.identity.displayName ??
    input.companyFallback ??
    "Your organisation";

  return {
    id: input.organisationId,
    name,
    legalName: tenant?.identity.legalName ?? name,
    industry: String(
      tenant?.configuration.provisioningProfileId === "manufacturing_executive"
        ? "Manufacturing"
        : tenant?.configuration.intelligenceProfileId === "commercial_executive"
          ? "Commercial / B2B"
          : "Operations",
    ),
    timezone: String(tenant?.configuration.timezone ?? "Australia/Sydney"),
    branding: {
      displayName: tenant?.branding.displayName ?? name,
      primaryColor: tenant?.branding.primaryColor ?? "#1a1a1a",
    },
    businessUnits: (tenant?.businessUnitIds ?? [`bu-default`]).map((id) => ({
      id,
      name: id.replace(/^bu-/, "").replace(/-/g, " "),
    })),
    locations: (tenant?.regions ?? ["au"]).map((region) => ({
      id: `loc-${region}`,
      label: region.toUpperCase() === "AU" ? "Australia" : region.toUpperCase(),
      region,
    })),
    regionalSettings: {
      residency: tenant?.dataResidency ?? "au",
      currency: "AUD",
      locale: "en-AU",
    },
    health: {
      score: tenant?.status === "active" ? 88 : 72,
      label: tenant?.status === "active" ? "Healthy" : "Provisioning",
      notes: [
        "Organisation isolation enforced",
        "Executive workspace ready",
      ],
    },
  };
}
