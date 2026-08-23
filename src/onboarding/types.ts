/**
 * Executive Discovery — shared types.
 * Discoveries are tenant-scoped and always carry confidence + evidence.
 */

export type DiscoveryKind =
  | "organisation_name"
  | "business_unit"
  | "department"
  | "office_location"
  | "executive_team_member"
  | "management_structure"
  | "committee"
  | "board_meeting"
  | "leadership_meeting"
  | "governance_meeting"
  | "customer"
  | "site"
  | "asset"
  | "project"
  | "job"
  | "technician"
  | "supplier"
  | "recurring_workflow"
  | "connector"
  | "user_directory"
  | "business_terminology"
  | "reporting_line"
  | "strategic_theme"
  | "operating_rhythm";

export type DiscoverySource =
  | "microsoft365"
  | "simpro"
  | "salesforce"
  | "knowledge_graph"
  | "business_events"
  | "user_stated"
  | "inferred";

export type DiscoveryStatus = "proposed" | "confirmed" | "edited" | "ignored";

export type DiscoveryItem = {
  id: string;
  tenantId: string;
  kind: DiscoveryKind;
  label: string;
  summary: string;
  confidence: number;
  source: DiscoverySource;
  evidence: string[];
  status: DiscoveryStatus;
  relatedEntityIds: string[];
  editableValue?: string;
};

export type ExecutiveRoleOption =
  | "CEO"
  | "Managing Director"
  | "Owner"
  | "COO"
  | "CFO"
  | "General Manager";

export type PrimaryObjectiveOption =
  | "Growth"
  | "Profitability"
  | "Operational Excellence"
  | "Customer Experience"
  | "Safety"
  | "Innovation";

export type BriefingTimePreference = "Morning" | "Afternoon";

/** Only ask what cannot be inferred. */
export type MinimumQuestions = {
  role: ExecutiveRoleOption;
  primaryObjective: PrimaryObjectiveOption;
  industry?: string;
  briefingTime: BriefingTimePreference;
  timeZone?: string;
  /**
   * Three most important strategic outcomes over the next 12 months.
   * Seeds the Strategic Outcomes Framework; refined over time.
   */
  strategicOutcomes?: string[];
};

export type LearnedExecutiveProfile = {
  tenantId: string;
  userId: string;
  decisionStyle: string;
  communicationPreference: string;
  meetingPreference: string;
  informationDensity: "concise" | "balanced" | "detailed";
  riskTolerance: "conservative" | "balanced" | "assertive";
  strategicFocus: string[];
  notificationPreference: string;
  briefingStyle: string;
  confidence: number;
  corrections: Array<{ field: string; value: string; at: string }>;
};

export type OrganisationInference = {
  tenantId: string;
  organisationName: string;
  reportingLines: string[];
  leadershipHierarchy: string[];
  operationalStructure: string[];
  businessScale: string;
  operationalComplexity: "low" | "moderate" | "high";
  executiveResponsibilities: string[];
  strategicThemes: string[];
  primaryOperatingRhythm: string;
  confidence: number;
  evidence: string[];
};

export type DiscoveryProgress = {
  tenantId: string;
  phase:
    | "welcome"
    | "questions"
    | "connecting"
    | "discovering"
    | "validating"
    | "briefing"
    | "complete";
  percent: number;
  elapsedSeconds: number;
  targetMinutes: number;
  message: string;
  discoveriesFound: number;
  systemsConnected: string[];
};

export type ValidationAction = "confirm" | "edit" | "ignore";

export type FirstExecutiveBrief = {
  tenantId: string;
  asOf: string;
  executiveSummary: string;
  businessHealth: string;
  operationalHealth: string;
  strategicPriorities: string[];
  executiveAgenda: string[];
  upcomingGovernance: string[];
  keyRelationships: string[];
  customerRisks: string[];
  operationalRisks: string[];
  cashSignals: string[];
  capacitySignals: string[];
  strategicOpportunities: string[];
  confidenceSummary: string;
  whatWeLearned: string[];
};

export type LearningMaturity = {
  tenantId: string;
  startedAt: string;
  daysActive: number;
  discoveryConfidence: number;
  organisationCoverage: number;
  connectedSystems: string[];
  knowledgeGraphGrowth: number;
  executiveProfileConfidence: number;
  /** Hide Learning banner when overall maturity exceeds this (0–100). */
  hideBannerThreshold: number;
  showLearningBanner: boolean;
};

export type OnboardingMetricsSnapshot = {
  tenantId: string;
  timeToFirstBriefingSeconds: number | null;
  discoveryAccuracy: number;
  manualConfigurationMinutes: number;
  organisationCoverage: number;
  knowledgeGraphCompleteness: number;
  executiveSatisfactionProxy: number;
  confidenceGrowth: number;
  setupCompletionRate: number;
};

export const TARGET_ONBOARDING_MINUTES = 15;
export const LEARNING_BANNER_DAYS = 30;
export const DEFAULT_MATURITY_HIDE_THRESHOLD = 75;
