/**
 * Operational Excellence & Observability — Braltiq-only types.
 * Never exposed to customers. No tenant business content.
 */

export type HealthState = "healthy" | "degraded" | "critical" | "unknown";

export type MetricPoint = {
  at: string;
  value: number;
};

export type PlatformComponentHealth = {
  id: string;
  label: string;
  state: HealthState;
  latencyMs: number | null;
  message: string;
  trend: MetricPoint[];
};

export type PlatformHealthSnapshot = {
  asOf: string;
  overall: HealthState;
  uptimePct: number;
  components: PlatformComponentHealth[];
  errorRatePct: number;
  recoveryStatus: "stable" | "recovering" | "failed";
  explanation: string;
};

export type ProviderId = "microsoft365" | "simpro" | "salesforce";

export type ProviderHealthRecord = {
  providerId: ProviderId;
  label: string;
  state: HealthState;
  connectionSuccessPct: number;
  apiLimitUtilisationPct: number;
  syncLatencyMs: number;
  authFailures24h: number;
  availabilityPct: number;
  lastCheckedAt: string;
  notifyBeforeImpact: boolean;
  explanation: string;
  trend: MetricPoint[];
};

export type CustomerIntervention = {
  tenantId: string;
  companyName: string;
  reason: string;
  severity: "critical" | "high" | "moderate";
  signals: string[];
};

export type CustomerHealthPortfolio = {
  asOf: string;
  activationSuccessPct: number;
  medianTimeToFirstValueMinutes: number;
  averageExecutiveValueScore: number;
  engagementIndex: number;
  recommendationAdoptionPct: number;
  trialConversionPct: number;
  renewalRiskCount: number;
  expansionOpportunityCount: number;
  interventions: CustomerIntervention[];
  evsTrend: MetricPoint[];
  explanation: string;
};

export type CommercialHealthSnapshot = {
  asOf: string;
  mrr: number;
  arr: number;
  trialConversions: number;
  churnPct: number;
  expansionRevenue: number;
  customerAcquisition: number;
  activationRatePct: number;
  customerLifetimeValue: number;
  averageExecutiveValueScore: number;
  revenueByProfile: Array<{
    profileId: string;
    label: string;
    mrr: number;
  }>;
  trends: {
    mrr: MetricPoint[];
    churn: MetricPoint[];
    activation: MetricPoint[];
  };
  explanation: string;
};

export type BillingHealthSnapshot = {
  asOf: string;
  activeSubscriptions: number;
  pastDue: number;
  trialActive: number;
  webhookSuccessPct: number;
  state: HealthState;
  explanation: string;
};

export type AdoptionHealthSnapshot = {
  asOf: string;
  briefAdoptionPct: number;
  moduleAdoptionPct: number;
  providerAdoptionPct: number;
  state: HealthState;
  explanation: string;
  trend: MetricPoint[];
};

export type ValueHealthSnapshot = {
  asOf: string;
  portfolioEvs: number;
  decliningTenants: number;
  improvingTenants: number;
  state: HealthState;
  trend: MetricPoint[];
  explanation: string;
};

export type SecurityHealthSnapshot = {
  asOf: string;
  authSuccessPct: number;
  failedLoginSpike: boolean;
  adminAccessAnomalies: number;
  rateLimitBreaches24h: number;
  state: HealthState;
  explanation: string;
};

export type PerformanceSnapshot = {
  asOf: string;
  p50ApiLatencyMs: number;
  p95ApiLatencyMs: number;
  memoryUtilisationPct: number;
  queueDepth: number;
  backgroundJobSuccessPct: number;
  state: HealthState;
  latencyTrend: MetricPoint[];
  explanation: string;
};

export type DiagnosticFinding = {
  id: string;
  area: string;
  severity: "info" | "warning" | "critical";
  summary: string;
  recommendation: string;
};

export type DiagnosticReport = {
  asOf: string;
  findings: DiagnosticFinding[];
  overall: HealthState;
};

export type ReleaseRecord = {
  version: string;
  deployedAt: string;
  environment: "production" | "staging" | "pilot";
  rollbackReady: boolean;
  knownIssueIds: string[];
  notes: string;
};

export type FeatureFlagRecord = {
  id: string;
  name: string;
  enabled: boolean;
  audience: "internal" | "design_partners" | "all";
  description: string;
};

export type MaintenanceWindow = {
  id: string;
  startsAt: string;
  endsAt: string;
  summary: string;
  status: "scheduled" | "active" | "completed";
};

export type ReleaseManagementSnapshot = {
  asOf: string;
  currentVersion: string;
  history: ReleaseRecord[];
  featureFlags: FeatureFlagRecord[];
  knownIssues: Array<{ id: string; title: string; severity: string }>;
  maintenanceWindows: MaintenanceWindow[];
  rollbackReady: boolean;
  explanation: string;
};

export type IncidentSeverity = "sev1" | "sev2" | "sev3" | "sev4";
export type IncidentStatus =
  | "open"
  | "investigating"
  | "mitigated"
  | "resolved"
  | "postmortem";

export type IncidentRecord = {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  openedAt: string;
  resolvedAt: string | null;
  affectedTenantIds: string[];
  providerId: ProviderId | null;
  timeline: Array<{ at: string; note: string }>;
  rootCause: string | null;
  resolution: string | null;
  postIncidentReview: string | null;
  lessonsLearned: string[];
};

export type AlertThresholds = {
  platformErrorRatePct: number;
  apiP95LatencyMs: number;
  providerAvailabilityPct: number;
  evsDeclinePoints: number;
  activationRateFloorPct: number;
  trialConversionFloorPct: number;
  renewalRiskCount: number;
  churnPct: number;
  mrrDropPct: number;
};

export type PlatformAlertKind =
  | "platform_degradation"
  | "provider_outage"
  | "executive_value_decline"
  | "activation_drop"
  | "trial_conversion_fall"
  | "renewal_risk"
  | "commercial_kpi"
  | "security_anomaly"
  | "performance_degradation";

export type PlatformAlert = {
  id: string;
  kind: PlatformAlertKind;
  severity: "critical" | "high" | "moderate" | "low";
  title: string;
  detail: string;
  createdAt: string;
  status: "open" | "acknowledged" | "resolved";
  tenantId: string | null;
  providerId: ProviderId | null;
};

export type OperationalExcellenceDashboard = {
  asOf: string;
  platform: PlatformHealthSnapshot;
  providers: ProviderHealthRecord[];
  commercial: CommercialHealthSnapshot;
  customerHealth: CustomerHealthPortfolio;
  valueHealth: ValueHealthSnapshot;
  billingHealth: BillingHealthSnapshot;
  adoptionHealth: AdoptionHealthSnapshot;
  securityHealth: SecurityHealthSnapshot;
  performance: PerformanceSnapshot;
  diagnostics: DiagnosticReport;
  releases: ReleaseManagementSnapshot;
  openIncidents: IncidentRecord[];
  criticalAlerts: PlatformAlert[];
  deploymentStatus: {
    version: string;
    rollbackReady: boolean;
    lastDeployAt: string;
    state: HealthState;
  };
};
