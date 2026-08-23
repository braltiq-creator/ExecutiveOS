/**
 * Product-Led Growth & Executive Value Platform — types.
 * Customer-facing. Extends commercial experience. Core intelligence unchanged.
 */

import type { PlanId } from "@/lib/billing/types";
import type { IntelligenceProfileId } from "@/profiles";

export type GrowthAuthMethod = "email" | "microsoft";

export type ActivationStepId =
  | "account_created"
  | "plan_selected"
  | "checkout_complete"
  | "microsoft_connected"
  | "provider_connected"
  | "data_validated"
  | "executive_discovery"
  | "profile_created"
  | "knowledge_graph_ready"
  | "scenarios_ready"
  | "first_brief_ready"
  | "value_explained";

export type ActivationStepStatus =
  | "pending"
  | "in_progress"
  | "complete"
  | "skipped";

export type ActivationStep = {
  id: ActivationStepId;
  label: string;
  status: ActivationStepStatus;
  completedAt: string | null;
  detail: string;
};

export type CustomerJourneyState = {
  organizationId: string;
  tenantId: string;
  profileId: IntelligenceProfileId;
  authMethod: GrowthAuthMethod;
  planId: PlanId | "trial";
  steps: ActivationStep[];
  startedAt: string;
  firstBriefAt: string | null;
  fiveMinuteReady: boolean;
  updatedAt: string;
};

export type GrowthSubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "incomplete";

export type GrowthSubscription = {
  id: string;
  organizationId: string;
  planId: PlanId;
  status: GrowthSubscriptionStatus;
  trialEndsAt: string | null;
  renewsAt: string | null;
  cancelledAt: string | null;
  seatLimit: number;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  createdAt: string;
  updatedAt: string;
};

export type GrowthInvoice = {
  id: string;
  organizationId: string;
  amount: number;
  currency: "AUD";
  status: "paid" | "open" | "void";
  invoiceUrl: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type ValueDimensionId =
  | "revenue_generated"
  | "revenue_protected"
  | "cost_savings"
  | "operational_efficiency"
  | "executive_hours_saved"
  | "productivity_improvements"
  | "risk_avoidance"
  | "strategic_outcome_contribution"
  | "decision_confidence"
  | "recommendation_adoption"
  | "business_outcomes_confirmed";

export type ValueEstimate = {
  id: string;
  organizationId: string;
  dimension: ValueDimensionId;
  label: string;
  amount: number;
  unit: "aud" | "hours" | "percent" | "count" | "score";
  confidence: number;
  evidence: string[];
  relatedRecommendationId: string | null;
  relatedRecommendationTitle: string | null;
  relatedStrategicOutcome: string | null;
  timePeriod: "today" | "7d" | "30d" | "12m" | "lifetime";
  explanation: string;
  asOf: string;
};

export type ExecutiveValueScore = {
  organizationId: string;
  asOf: string;
  score: number;
  todayValue: number;
  last7Days: number;
  last30Days: number;
  last12Months: number;
  lifetimeValue: number;
  confidence: number;
  trend: "up" | "down" | "flat";
  priorPeriodScore: number;
  benchmarkDelta: number;
  currency: "AUD";
  topRecommendationByValue: {
    id: string;
    title: string;
    valueAud: number;
  } | null;
  breakdown: {
    revenueGenerated: number;
    revenueProtected: number;
    costSavings: number;
    executiveHoursSaved: number;
    operationalEfficiency: number;
    strategicOutcomeContribution: number;
  };
};

export type GrowthNotificationKind =
  | "significant_value"
  | "recommendation_adopted"
  | "strategic_outcome_improved"
  | "revenue_protected"
  | "high_impact_opportunity"
  | "renewal_reminder"
  | "upgrade_recommendation";

export type GrowthNotification = {
  id: string;
  organizationId: string;
  kind: GrowthNotificationKind;
  title: string;
  summary: string;
  createdAt: string;
  read: boolean;
};

export type UpgradeRecommendation = {
  id: string;
  organizationId: string;
  fromPlan: PlanId | "trial";
  toPlan: PlanId;
  rationale: string;
  confidence: number;
  milestone: string;
};

export type CustomerHealthSignal = {
  organizationId: string;
  health: "green" | "amber" | "red";
  activationPct: number;
  engagementPct: number;
  valueScore: number;
  renewalRisk: "low" | "medium" | "high";
  explanation: string;
};

export type GrowthTelemetryEvent = {
  id: string;
  organizationId: string;
  name: string;
  properties: Record<string, string | number | boolean>;
  at: string;
};

export type ExecutiveValueReport = {
  id: string;
  organizationId: string;
  asOf: string;
  period: "monthly" | "quarterly" | "annual";
  financialValue: number;
  operationalValue: number;
  strategicValue: number;
  timeSavingsHours: number;
  recommendationsAdopted: number;
  businessOutcomes: number;
  confidence: number;
  evidence: string[];
  narrative: string;
  suitableFor: Array<
    "monthly_review" | "executive_meeting" | "board_pack" | "renewal"
  >;
};
