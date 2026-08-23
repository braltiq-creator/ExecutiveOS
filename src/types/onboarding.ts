export type ObjectivePriority = "high" | "medium" | "low";

export type OnboardingStepId =
  | "identity"
  | "organisation"
  | "objectives"
  | "challenges"
  | "operating-system";

export type OnboardingStep = {
  id: OnboardingStepId;
  title: string;
  description: string;
};

export type ExecutiveProfile = {
  id: string;
  user_id: string;
  full_name: string | null;
  preferred_name: string | null;
  job_title: string | null;
  company: string | null;
  industry: string | null;
  country: string | null;
  timezone: string | null;
  company_size: string | null;
  annual_revenue_band: string | null;
  team_size: number | null;
  direct_reports: number | null;
  departments_responsible_for: string | null;
  geographic_responsibility: string | null;
  biggest_business_challenge: string | null;
  biggest_leadership_challenge: string | null;
  biggest_productivity_challenge: string | null;
  business_systems: string[];
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StrategicObjective = {
  id: string;
  user_id: string;
  executive_profile_id: string;
  title: string;
  description: string | null;
  priority: ObjectivePriority;
  sort_order: number;
  created_at: string;
};

export type ExecutiveIdentityData = {
  fullName: string;
  preferredName: string;
  jobTitle: string;
  company: string;
  industry: string;
  country: string;
  timezone: string;
};

export type OrganisationData = {
  companySize: string;
  annualRevenueBand: string;
  teamSize: number;
  directReports: number;
  departmentsResponsibleFor: string;
  geographicResponsibility: string;
};

export type ObjectiveInput = {
  title: string;
  description: string;
  priority: ObjectivePriority;
};

export type ExecutiveChallengesData = {
  biggestBusinessChallenge: string;
  biggestLeadershipChallenge: string;
  biggestProductivityChallenge: string;
};

export type OperatingSystemData = {
  businessSystems: string[];
};

export type OnboardingWizardData = {
  identity: ExecutiveIdentityData;
  organisation: OrganisationData;
  objectives: [ObjectiveInput, ObjectiveInput, ObjectiveInput];
  challenges: ExecutiveChallengesData;
  operatingSystem: OperatingSystemData;
};

export type OnboardingActionResult = {
  error: string | null;
};

export type OnboardingInitialState = {
  executiveProfile: ExecutiveProfile | null;
  objectives: StrategicObjective[];
  initialStep: OnboardingStepId;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "identity",
    title: "Executive Identity",
    description: "Define who you are as an executive.",
  },
  {
    id: "organisation",
    title: "Organisation",
    description: "Describe the organisation you lead.",
  },
  {
    id: "objectives",
    title: "Executive Objectives",
    description: "Set your strategic priorities for the next 12 months.",
  },
  {
    id: "challenges",
    title: "Executive Challenges",
    description: "Identify the challenges shaping your role.",
  },
  {
    id: "operating-system",
    title: "Executive Operating System",
    description: "Select the systems that power your work.",
  },
];

export const ESTIMATED_COMPLETION_MINUTES = 3;

export const COMPLETION_SEQUENCE_ITEMS = [
  "Creating Executive Profile",
  "Analysing Executive Objectives",
  "Preparing Executive Memory",
  "Initialising AI Context",
  "Building Executive Dashboard",
] as const;
