/**
 * Intelligence Profile — first-class packaging of ExecutiveOS for a role outcome.
 * Connectors are implementation details; profiles are what customers buy.
 */

export type ContextDomain = "activity" | "operational" | "commercial";

export type ProviderId = "microsoft365" | "salesforce" | "simpro";

export type BriefSectionId =
  | "pulse"
  | "compass"
  | "outcomes"
  | "metrics"
  | "decisions"
  | "actions"
  | "since_yesterday"
  | "executive_context"
  | "operational_context"
  | "commercial_context"
  | "council"
  | "futures"
  | "agenda";

export type IntelligenceProfileId =
  | "operations_executive"
  | "commercial_executive";

export type IntelligenceProfile = {
  id: IntelligenceProfileId;
  name: string;
  /** One-line outcome buyers understand immediately */
  tagline: string;
  summary: string;
  targetExecutives: string[];
  targetIndustries: string[];
  recommendedProviders: ProviderId[];
  /** Providers required for the profile to deliver its primary questions */
  requiredProviders: ProviderId[];
  executiveKpis: string[];
  executiveQuestions: string[];
  executiveContext: {
    primary: ContextDomain[];
    secondary: ContextDomain[];
  };
  knowledgeGraphExtensions: string[];
  /** Relative Council agent emphasis 0–1 — permanent five seats only */
  councilWeighting: Partial<
    Record<"ceo" | "cfo" | "coo" | "cro" | "cso", number>
  >;
  foresightWeighting: {
    operational: number;
    commercial: number;
    strategic: number;
  };
  /** Today brief section order — Core unchanged; presentation only */
  briefLayout: BriefSectionId[];
  validationScenarioIds: string[];
  recommendedDashboards: string[];
};

export type ProfileRecommendation = {
  profileId: IntelligenceProfileId;
  profileName: string;
  confidence: number;
  explanation: string;
  alternatives: Array<{
    profileId: IntelligenceProfileId;
    profileName: string;
    why: string;
  }>;
};

export type TenantProfileSelection = {
  tenantId: string;
  profileId: IntelligenceProfileId;
  source: "recommended" | "manual";
  recommendedProfileId: IntelligenceProfileId;
  explanation: string;
  selectedAt: string;
};
