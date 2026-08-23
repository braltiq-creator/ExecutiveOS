import type { ExecutiveDecisionRecord } from "@/lib/decisions/types";
import type { RecommendedAction } from "@/lib/health/types";
import type { HealthTrend } from "@/lib/health/types";
import type { InitiativeWithLinks } from "@/lib/initiatives/types";
import type {
  ExecutiveCalendarIntelligence,
  ExecutiveDayIntelligence,
} from "@/lib/intelligence/providers/types";
import type {
  ExecutiveProfile,
  ObjectivePriority,
  StrategicObjective,
} from "@/types/onboarding";

export class ExecutiveIntelligenceError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ExecutiveIntelligenceError";
    this.code = code;
  }
}

export type ExecutiveIdentity = {
  userId: string;
  email: string | null;
  fullName: string;
  preferredName: string | null;
  jobTitle: string;
  company: string;
  industry: string;
  country: string;
  timezone: string;
};

export type OrganisationContext = {
  companySize: string;
  annualRevenueBand: string;
  teamSize: number;
  directReports: number;
  departmentsResponsibleFor: string;
  geographicResponsibility: string;
};

export type OrganizationEntityContext = {
  id: string;
  name: string;
  legalName: string | null;
  industry: string | null;
  companySize: string | null;
  country: string | null;
  timezone: string;
  website: string | null;
  logoUrl: string | null;
  subscriptionPlan: string;
};

export type TeamMemberContext = {
  id: string;
  userId: string;
  role: string;
  roleLabel: string;
  email: string | null;
  displayName: string | null;
  joinedAt: string | null;
};

export type DepartmentContext = {
  id: string;
  name: string;
  description: string | null;
};

export type ExecutiveObjectiveContext = {
  id: string;
  title: string;
  description: string;
  priority: ObjectivePriority;
  sortOrder: number;
  healthScore?: number;
  healthTrend?: HealthTrend;
  healthStatus?: string;
  healthLabel?: string;
  healthExplanation?: string[];
};

export type ExecutiveHealthContext = {
  score: number;
  trend: HealthTrend;
  trendLabel: string;
  explanation: string[];
  recommendedActions: RecommendedAction[];
  decliningCount: number;
  computedAt: string;
};

export type ExecutiveChallengesContext = {
  business: string;
  leadership: string;
  productivity: string;
};

export type ExecutiveSystemsContext = {
  businessSystems: string[];
};

export type OnboardingContext = {
  completedAt: string | null;
  isComplete: boolean;
};

export type ExecutiveMemoryEntry = {
  id: string;
  memoryType: string;
  title: string;
  content: string;
  importance: string;
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type ExecutiveMemoryContext = {
  entries: ExecutiveMemoryEntry[];
  lastUpdatedAt: string | null;
};

export type ExecutiveDecisionContext = {
  id: string;
  title: string;
  summary: string;
  decisionReason: string;
  alternativesConsidered: string | null;
  expectedOutcome: string;
  status: string;
  statusLabel: string;
  owner: string;
  decisionDate: string;
  reviewDate: string | null;
  strategicObjectiveId: string | null;
  riskLevel: string;
  riskLevelLabel: string;
  updatedAt: string;
};

export type ExecutiveDecisionsContext = {
  decisions: ExecutiveDecisionContext[];
  lastUpdatedAt: string | null;
};

export type ExecutiveInitiativeContext = {
  id: string;
  title: string;
  description: string;
  status: string;
  statusLabel: string;
  priority: string;
  priorityLabel: string;
  owner: string;
  startDate: string;
  targetDate: string | null;
  progressPercentage: number;
  healthScore: number;
  healthTrend: HealthTrend;
  healthStatus: string;
  healthLabel: string;
  healthExplanation: string[];
  linkCount: number;
  updatedAt: string;
};

export type ExecutiveInitiativesContext = {
  initiatives: ExecutiveInitiativeContext[];
  lastUpdatedAt: string | null;
  atRiskCount: number;
  offTrackCount: number;
  activeCount: number;
};

export type CalendarEventContext = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  source: string;
  location?: string | null;
  onlineMeetingUrl?: string | null;
  isAllDay?: boolean;
  isRecurring?: boolean;
  showAs?: string;
  attendeeCount?: number;
  organizer?: string | null;
  importance?: string;
};

export type CalendarContext = {
  events: CalendarEventContext[];
  connected: boolean;
};

export type EmailThreadContext = {
  id: string;
  subject: string;
  source: string;
};

export type EmailContext = {
  threads: EmailThreadContext[];
  connected: boolean;
};

export type CrmRecordContext = {
  id: string;
  name: string;
  stage: string;
  source: string;
};

export type CrmContext = {
  records: CrmRecordContext[];
  connected: boolean;
};

export type IntegrationMeetingContext = {
  id: string;
  title: string;
  source: string;
};

export type MeetingsContext = {
  meetings: IntegrationMeetingContext[];
  connected: boolean;
};

export type TaskContext = {
  id: string;
  title: string;
  status: string;
  source: string;
};

export type TasksContext = {
  tasks: TaskContext[];
  connected: boolean;
};

export type DocumentContext = {
  id: string;
  title: string;
  source: string;
};

export type DocumentsContext = {
  documents: DocumentContext[];
  connected: boolean;
};

export type KnowledgeGraphNodeContext = {
  id: string;
  label: string;
  nodeType?: string;
  summary?: string | null;
};

export type KnowledgeGraphEdgeContext = {
  id: string;
  source: string;
  target: string;
  edgeType?: string;
};

export type KnowledgeGraphContext = {
  nodes: KnowledgeGraphNodeContext[];
  edges: KnowledgeGraphEdgeContext[];
  connected: boolean;
};

export type IntelligenceIntegrationsContext = {
  calendar: CalendarContext;
  email: EmailContext;
  crm: CrmContext;
  meetings: MeetingsContext;
  tasks: TasksContext;
  documents: DocumentsContext;
  knowledgeGraph: KnowledgeGraphContext;
};

export type ExecutiveContext = {
  userId: string;
  loadedAt: string;
  executive: ExecutiveIdentity;
  organisation: OrganisationContext;
  objectives: ExecutiveObjectiveContext[];
  challenges: ExecutiveChallengesContext;
  systems: ExecutiveSystemsContext;
  onboarding: OnboardingContext;
  memory: ExecutiveMemoryContext;
  decisions: ExecutiveDecisionsContext;
  initiatives: ExecutiveInitiativesContext;
  health?: ExecutiveHealthContext;
  organization: OrganizationEntityContext | null;
  teamMembers: TeamMemberContext[];
  departments: DepartmentContext[];
  integrations: IntelligenceIntegrationsContext;
  calendar?: ExecutiveCalendarIntelligence;
};

export type ExecutiveIntelligenceResult = {
  executive: ExecutiveIdentity;
  organisation: OrganisationContext;
  objectives: ExecutiveObjectiveContext[];
  challenges: ExecutiveChallengesContext;
  systems: ExecutiveSystemsContext;
  memory: ExecutiveMemoryContext;
  decisions: ExecutiveDecisionsContext;
  initiatives: ExecutiveInitiativesContext;
  health: ExecutiveHealthContext;
  organization: OrganizationEntityContext | null;
  teamMembers: TeamMemberContext[];
  departments: DepartmentContext[];
  integrations: IntelligenceIntegrationsContext;
  executivePrompt: string;
  executiveDay: ExecutiveDayIntelligence;
  calendar: ExecutiveCalendarIntelligence;
};

export type ExecutiveContextInput = {
  userId: string;
  email: string | null;
  profile: ExecutiveProfile;
  objectives: StrategicObjective[];
  memory: ExecutiveMemoryContext;
  decisions: ExecutiveDecisionRecord[];
  initiatives: InitiativeWithLinks[];
};

