/**
 * Portable Commercial Executive Context — vendor-independent.
 * Salesforce (or HubSpot / Dynamics) produces this shape; Core never sees vendor objects.
 */

export const COMMERCIAL_SIGNAL_IDS = [
  "pipeline_health",
  "revenue_forecast",
  "forecast_accuracy",
  "commercial_momentum",
  "customer_growth",
  "renewal_risk",
  "strategic_accounts",
  "executive_relationships",
  "sales_capacity",
  "market_expansion",
  "commercial_bottlenecks",
  "customer_health",
] as const;

export type CommercialSignalId = (typeof COMMERCIAL_SIGNAL_IDS)[number];

export type CommercialSignalSeverity =
  | "critical"
  | "high"
  | "moderate"
  | "low"
  | "healthy";

export type CommercialSignal = {
  id: CommercialSignalId;
  label: string;
  severity: CommercialSignalSeverity;
  score: number;
  summary: string;
  evidence: string[];
  relatedEntityIds: string[];
};

export type CommercialHealthLevel =
  | "healthy"
  | "watch"
  | "strained"
  | "critical";

export type PipelineHealthSnapshot = {
  level: CommercialHealthLevel;
  label: string;
  openPipelineValue: number;
  openDeals: number;
  weightedForecast: number;
  detail: string;
};

export type RevenueForecastSnapshot = {
  level: CommercialHealthLevel;
  label: string;
  forecastValue: number;
  accuracyPct: number;
  detail: string;
};

export type StrategicAccountItem = {
  id: string;
  name: string;
  attention: string;
  severity: CommercialSignalSeverity;
  relatedEntityIds: string[];
};

export type CommercialRiskItem = {
  id: string;
  title: string;
  kind: "renewal" | "deal" | "customer" | "forecast" | "capacity";
  severity: CommercialSignalSeverity;
  detail: string;
};

export type ExecutiveRecommendationItem = {
  id: string;
  title: string;
  why: string;
  urgency: "now" | "today" | "this_week";
};

export type CommercialContextBrief = {
  asOf: string;
  providerId: "salesforce" | "hubspot" | "dynamics" | "crm";
  framing: string;
  commercialHealth: {
    level: CommercialHealthLevel;
    label: string;
    detail: string;
  };
  pipelineHealth: PipelineHealthSnapshot;
  revenueForecast: RevenueForecastSnapshot;
  commercialMomentum: {
    level: CommercialHealthLevel;
    label: string;
    detail: string;
  };
  strategicAccounts: StrategicAccountItem[];
  commercialRisks: CommercialRiskItem[];
  renewalRisks: CommercialRiskItem[];
  largeDealsAtRisk: Array<{
    id: string;
    title: string;
    amount: number;
    reason: string;
  }>;
  customerHealth: {
    level: CommercialHealthLevel;
    label: string;
    detail: string;
  };
  salesMomentum: {
    level: CommercialHealthLevel;
    label: string;
    detail: string;
  };
  signals: CommercialSignal[];
  recommendations: ExecutiveRecommendationItem[];
  closingNote: string;
};

export type CommercialContextView = {
  framing: string;
  commercialHealth: { level: string; label: string; detail: string };
  pipelineHealth: {
    label: string;
    openPipelineValue: number;
    openDeals: number;
    weightedForecast: number;
    detail: string;
  };
  revenueForecast: {
    label: string;
    forecastValue: number;
    accuracyPct: number;
    detail: string;
  };
  commercialRisks: Array<{ title: string; kind: string; severity: string; detail: string }>;
  strategicAccounts: Array<{ name: string; attention: string; severity: string }>;
  renewalRisks: Array<{ title: string; detail: string; severity: string }>;
  largeDealsAtRisk: Array<{ title: string; amount: number; reason: string }>;
  forecastConfidence: { label: string; accuracyPct: number; detail: string };
  salesMomentum: { label: string; detail: string };
  customerHealth: { label: string; detail: string };
  signals: Array<{ label: string; severity: string; summary: string }>;
  recommendations: Array<{ title: string; why: string; urgency: string }>;
  closingNote: string;
};
