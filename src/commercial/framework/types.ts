/**
 * Commercial Readiness Platform — types.
 * Braltiq-internal commercial operations. Not customer-facing.
 */

import type { IntelligenceProfileId } from "@/profiles";

export type CommercialEditionId =
  | "operations_executive"
  | "commercial_executive";

export type LicenseTier =
  | "trial"
  | "design_partner"
  | "pilot"
  | "production"
  | "enterprise";

export type ImplementationStageId =
  | "discovery"
  | "provisioning"
  | "provider_connection"
  | "executive_discovery"
  | "validation"
  | "executive_brief"
  | "scenario_validation"
  | "success_review"
  | "go_live";

export type ImplementationStageStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "complete";

export type CommercialEdition = {
  id: CommercialEditionId;
  name: string;
  targetCustomer: string;
  targetExecutive: string;
  intelligenceProfileId: IntelligenceProfileId;
  includedProviders: string[];
  includedScenarioPacks: string[];
  includedStrategicOutcomes: string[];
  includedReporting: string[];
  implementationScope: string[];
  expansionOpportunities: string[];
  registeredAt: string;
};

export type LicenseEntitlements = {
  seats: number;
  executives: number;
  providerEntitlements: string[];
  featureEntitlements: string[];
};

export type CommercialLicense = {
  id: string;
  tenantId: string;
  editionId: CommercialEditionId;
  tier: LicenseTier;
  entitlements: LicenseEntitlements;
  startsAt: string;
  renewalAt: string;
  usage: {
    seatsUsed: number;
    executivesActive: number;
    providersConnected: number;
  };
  expansionEligible: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PricingBand = {
  tier: LicenseTier;
  editionId: CommercialEditionId | "all";
  currency: "AUD";
  listPriceMonthly: number;
  listPriceAnnual: number;
  seatPriceMonthly: number;
  notes: string;
};

export type ImplementationStageDefinition = {
  id: ImplementationStageId;
  label: string;
  objective: string;
  exitCriteria: string[];
  order: number;
};

export type ImplementationStageProgress = {
  stageId: ImplementationStageId;
  status: ImplementationStageStatus;
  completedAt: string | null;
  evidence: string[];
  blockers: string[];
};

export type ImplementationPlan = {
  id: string;
  tenantId: string;
  editionId: CommercialEditionId;
  currentStageId: ImplementationStageId;
  stages: ImplementationStageProgress[];
  startedAt: string;
  updatedAt: string;
  goLiveAt: string | null;
};

export type SuccessPlan = {
  id: string;
  tenantId: string;
  editionId: CommercialEditionId;
  customerObjectives: string[];
  strategicOutcomes: string[];
  executiveSponsors: string[];
  reviewCadence: "weekly" | "fortnightly" | "monthly" | "quarterly";
  successMilestones: Array<{
    id: string;
    label: string;
    dueAt: string | null;
    complete: boolean;
  }>;
  risks: string[];
  actions: string[];
  nextReviewAt: string | null;
  health: "green" | "amber" | "red";
  createdAt: string;
  updatedAt: string;
};

export type RoiEstimateRange = {
  low: number;
  mid: number;
  high: number;
  unit: "hours" | "count" | "score" | "percent";
  confidence: number;
  evidence: string[];
};

export type CustomerRoiReport = {
  id: string;
  tenantId: string;
  editionId: CommercialEditionId;
  asOf: string;
  executiveHoursSaved: RoiEstimateRange;
  recommendationsAdopted: RoiEstimateRange;
  businessOutcomesConfirmed: RoiEstimateRange;
  decisionConfidence: RoiEstimateRange;
  operationalImprovements: RoiEstimateRange;
  commercialImprovements: RoiEstimateRange;
  strategicProgress: RoiEstimateRange;
  narrative: string;
};

export type SecurityPackSection = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
};

export type SecurityPack = {
  version: string;
  asOf: string;
  sections: SecurityPackSection[];
};

export type SalesEnablementAssetId =
  | "edition_comparison"
  | "executive_profile_comparison"
  | "implementation_overview"
  | "pilot_methodology"
  | "roi_summary"
  | "security_summary"
  | "faq";

export type SalesEnablementAsset = {
  id: SalesEnablementAssetId;
  title: string;
  audience: string;
  body: string[];
  updatedAt: string;
};

export type ExpansionOpportunity = {
  id: string;
  tenantId: string;
  fromEditionId: CommercialEditionId;
  toLabel: string;
  rationale: string;
  confidence: number;
  signals: string[];
  recommendedAction: string;
  createdAt: string;
};

export type RenewalRecord = {
  id: string;
  tenantId: string;
  licenseId: string;
  renewalAt: string;
  status: "upcoming" | "in_discussion" | "renewed" | "at_risk" | "churned";
  notes: string | null;
};

export type ContractRecord = {
  id: string;
  tenantId: string;
  licenseId: string;
  kind: "pilot_msa" | "production_order" | "enterprise_msa" | "dpa";
  status: "draft" | "sent" | "signed" | "expired";
  effectiveAt: string | null;
  notes: string | null;
};

export type CommercialDashboard = {
  asOf: string;
  editions: CommercialEdition[];
  licenses: CommercialLicense[];
  implementationPlans: ImplementationPlan[];
  successPlans: SuccessPlan[];
  roiReports: CustomerRoiReport[];
  expansion: ExpansionOpportunity[];
  renewals: RenewalRecord[];
  contracts: ContractRecord[];
  securityPack: SecurityPack;
  salesAssets: SalesEnablementAsset[];
  pricing: PricingBand[];
  summary: {
    activeLicenses: number;
    pilotsInImplementation: number;
    productionReady: number;
    expansionOpportunities: number;
    renewalsUpcoming: number;
    avgRoiConfidence: number;
  };
};
