/**
 * Portable Operational Executive Context — vendor-independent.
 * Simpro (or Maximo / another FSM) produces this shape; Core never sees vendor objects.
 */

export const OPERATIONAL_SIGNAL_IDS = [
  "operational_capacity",
  "field_productivity",
  "revenue_pipeline",
  "customer_delivery_risk",
  "cash_collection_risk",
  "technician_availability",
  "project_health",
  "operational_bottlenecks",
  "margin_risk",
  "service_backlog",
  "safety_signal",
  "asset_availability",
] as const;

export type OperationalSignalId = (typeof OPERATIONAL_SIGNAL_IDS)[number];

export type OperationalSignalSeverity =
  | "critical"
  | "high"
  | "moderate"
  | "low"
  | "healthy";

export type OperationalSignal = {
  id: OperationalSignalId;
  label: string;
  severity: OperationalSignalSeverity;
  score: number;
  summary: string;
  evidence: string[];
  relatedEntityIds: string[];
};

export type OperationalHealthLevel =
  | "healthy"
  | "watch"
  | "strained"
  | "critical";

export type CapacitySnapshot = {
  level: OperationalHealthLevel;
  label: string;
  utilisedPct: number;
  availableTechnicians: number;
  unavailableTechnicians: number;
  detail: string;
};

export type ServiceDeliverySnapshot = {
  openJobs: number;
  criticalJobs: number;
  completedToday: number;
  backlogLabel: string;
  detail: string;
};

export type RevenuePipelineSnapshot = {
  acceptedQuotesValue: number;
  openOpportunities: number;
  label: string;
  detail: string;
};

export type CashCollectionSnapshot = {
  overdueInvoices: number;
  overdueValue: number;
  riskLevel: OperationalHealthLevel;
  detail: string;
};

export type CustomerRiskItem = {
  id: string;
  customerName: string;
  risk: string;
  severity: OperationalSignalSeverity;
  relatedEntityIds: string[];
};

export type BottleneckItem = {
  id: string;
  title: string;
  kind: "capacity" | "supply" | "scheduling" | "margin" | "delivery";
  impact: string;
};

export type ExecutiveRecommendationItem = {
  id: string;
  title: string;
  why: string;
  urgency: "now" | "today" | "this_week";
};

export type JobAtRiskItem = {
  id: string;
  title: string;
  customerName: string;
  reason: string;
  severity: OperationalSignalSeverity;
};

export type OperationalOpportunityItem = {
  id: string;
  title: string;
  detail: string;
  relatedEntityIds: string[];
};

export type FieldProductivitySnapshot = {
  level: OperationalHealthLevel;
  label: string;
  utilisationPct: number;
  overtimeHours: number;
  detail: string;
};

export type ServicePerformanceSnapshot = {
  level: OperationalHealthLevel;
  label: string;
  completedToday: number;
  criticalOpen: number;
  onTimePct: number;
  detail: string;
};

/**
 * Vendor-independent operational brief.
 * providerId identifies the producing connector — content stays executive language.
 */
export type OperationalContextBrief = {
  asOf: string;
  providerId: "simpro" | "maximo" | "field_service";
  framing: string;
  operationalHealth: {
    level: OperationalHealthLevel;
    label: string;
    detail: string;
  };
  capacity: CapacitySnapshot;
  fieldProductivity: FieldProductivitySnapshot;
  technicianUtilisation: {
    level: OperationalHealthLevel;
    utilisedPct: number;
    label: string;
    detail: string;
  };
  serviceDelivery: ServiceDeliverySnapshot;
  servicePerformance: ServicePerformanceSnapshot;
  revenuePipeline: RevenuePipelineSnapshot;
  cashCollection: CashCollectionSnapshot;
  jobsAtRisk: JobAtRiskItem[];
  criticalCustomers: CustomerRiskItem[];
  customerRisks: CustomerRiskItem[];
  bottlenecks: BottleneckItem[];
  safetySignals: string[];
  assetAvailability: {
    level: OperationalHealthLevel;
    label: string;
    detail: string;
  };
  operationalOpportunities: OperationalOpportunityItem[];
  signals: OperationalSignal[];
  recommendations: ExecutiveRecommendationItem[];
  closingNote: string;
};

/** Today presentation model — still vendor-free */
export type OperationalContextView = {
  framing: string;
  operationalHealth: { level: string; label: string; detail: string };
  capacity: {
    label: string;
    utilisedPct: number;
    availableTechnicians: number;
    detail: string;
  };
  fieldProductivity: {
    label: string;
    utilisationPct: number;
    overtimeHours: number;
    detail: string;
  };
  technicianUtilisation: {
    label: string;
    utilisedPct: number;
    detail: string;
  };
  serviceDelivery: {
    openJobs: number;
    criticalJobs: number;
    backlogLabel: string;
    detail: string;
  };
  servicePerformance: {
    label: string;
    completedToday: number;
    criticalOpen: number;
    onTimePct: number;
    detail: string;
  };
  revenuePipeline: {
    acceptedQuotesValue: number;
    openOpportunities: number;
    label: string;
    detail: string;
  };
  cashCollection: {
    overdueInvoices: number;
    overdueValue: number;
    riskLevel: string;
    detail: string;
  };
  jobsAtRisk: Array<{
    title: string;
    customerName: string;
    reason: string;
    severity: string;
  }>;
  criticalCustomers: Array<{
    customerName: string;
    risk: string;
    severity: string;
  }>;
  customerRisks: Array<{
    customerName: string;
    risk: string;
    severity: string;
  }>;
  bottlenecks: Array<{ title: string; kind: string; impact: string }>;
  safetySignals: string[];
  assetAvailability: { label: string; detail: string };
  operationalOpportunities: Array<{ title: string; detail: string }>;
  signals: Array<{ label: string; severity: string; summary: string }>;
  recommendations: Array<{ title: string; why: string; urgency: string }>;
  closingNote: string;
};
