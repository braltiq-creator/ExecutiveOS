/**
 * First-class Tenant model — enterprise SaaS isolation unit.
 */

export type TenantId = string;
export type DataResidency = "au" | "eu" | "us" | "uk" | "apac" | "global";

export type IsolationRule = {
  id: string;
  kind: "data" | "network" | "identity" | "connector" | "workspace";
  description: string;
  enforced: boolean;
};

export type RetentionPolicy = {
  auditDays: number;
  eventDays: number;
  knowledgeDays: number;
  softDeleteDays: number;
};

export type TenantBranding = {
  displayName: string;
  primaryColor?: string;
  logoRef?: string;
};

export type TenantLicensingRef = {
  planId: string;
  status: "trial" | "active" | "past_due" | "cancelled" | "suspended";
  seats: number;
  modules: string[];
};

export type Tenant = {
  id: TenantId;
  identity: {
    slug: string;
    legalName: string;
    displayName: string;
  };
  organisationId: string;
  businessUnitIds: string[];
  regions: string[];
  executiveTeamIds: string[];
  connectorRegistryIds: string[];
  knowledgePackIds: string[];
  contextProviderIds: string[];
  configuration: Record<string, string | number | boolean>;
  branding: TenantBranding;
  licensing: TenantLicensingRef;
  dataResidency: DataResidency;
  retention: RetentionPolicy;
  isolationRules: IsolationRule[];
  createdAt: string;
  status: "active" | "provisioning" | "suspended" | "archived";
};
