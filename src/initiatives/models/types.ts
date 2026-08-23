/**
 * Strategic Initiative Engine — first-class initiative models.
 * Executive coordination layer — never a project management system.
 */

import type { CouncilAgentId, AgentStance } from "@/agents/types";
import type { BusinessDriverId, TimeHorizonId } from "@/futures/models/types";

export const INITIATIVE_PRIORITIES = [
  "critical",
  "high",
  "medium",
  "watch",
] as const;

export type InitiativePriority = (typeof INITIATIVE_PRIORITIES)[number];

export const INITIATIVE_PROGRESS_STATES = [
  "not_started",
  "mobilising",
  "on_track",
  "watch",
  "at_risk",
  "blocked",
  "completed",
  "cancelled",
] as const;

export type InitiativeProgressState =
  (typeof INITIATIVE_PROGRESS_STATES)[number];

export const EXECUTION_SYSTEMS = [
  "microsoft_planner",
  "jira",
  "asana",
  "monday",
  "clickup",
  "sap_ps",
  "oracle_primavera",
  "microsoft_project",
  "none",
] as const;

export type ExecutionSystemId = (typeof EXECUTION_SYSTEMS)[number];

export type ExecutionSystemRef = {
  system: ExecutionSystemId;
  label: string;
  externalRef?: string;
  /** What ExecutiveOS does NOT own in that system */
  ownsInSystem: "tasks" | "schedules" | "resources" | "delivery";
};

export type SuccessMeasure = {
  id: string;
  label: string;
  target: string;
  current?: string;
  linkedOutcomeIds: string[];
};

export type InitiativeLeadingIndicator = {
  id: string;
  label: string;
  monitor: string;
  threshold: string;
  relatedDriverIds: BusinessDriverId[];
};

export type InitiativeDependency = {
  id: string;
  kind:
    | "cross_functional"
    | "capability"
    | "critical_path"
    | "decision_point"
    | "resource"
    | "assumption"
    | "business_event";
  label: string;
  detail: string;
  relatedEntityIds: string[];
  blocking: boolean;
};

export type InitiativeGovernance = {
  executiveCheckpoints: string[];
  boardReportingCadence: string;
  decisionMilestones: string[];
  reviewMeetings: string[];
  evidenceCollection: string[];
  businessEventSubscriptions: string[];
  councilReviewTriggers: string[];
};

export type CouncilInitiativePerspective = {
  agentId: CouncilAgentId;
  title: string;
  shortTitle: string;
  stance: AgentStance;
  contribution: string;
  agreement: "supports" | "challenges" | "conditional";
  prioritiesNamed: string[];
  confidence: number;
  reasoning: string[];
};

export type InitiativeCoordination = {
  perspectives: CouncilInitiativePerspective[];
  disagreements: Array<{
    topic: string;
    positions: Array<{ agent: string; stance: string; statement: string }>;
    facilitation: string;
  }>;
  sequencingNote: string;
};

export type StrategicInitiative = {
  id: string;
  title: string;
  executiveOutcome: string;
  businessObjective: string;
  strategicAlignment: string;
  executiveSponsor: CouncilAgentId;
  supportingCouncilMembers: CouncilAgentId[];
  priority: InitiativePriority;
  timeHorizon: TimeHorizonId;
  businessDrivers: BusinessDriverId[];
  relatedFutureIds: string[];
  relatedDecisionIds: string[];
  relatedRiskIds: string[];
  relatedOpportunityIds: string[];
  relatedBusinessEventIds: string[];
  relatedOutcomeIds: string[];
  dependencies: InitiativeDependency[];
  successMeasures: SuccessMeasure[];
  leadingIndicators: InitiativeLeadingIndicator[];
  progress: InitiativeProgressState;
  /** 0–100 completion of strategic intent (not task % ) */
  progressPercent: number;
  confidence: number;
  evidence: string[];
  reviewCadence: string;
  completionCriteria: string[];
  operationalSystems: ExecutionSystemRef[];
  governance: InitiativeGovernance;
  coordination: InitiativeCoordination;
  /** Executive attention required */
  attentionRequired: boolean;
  strategicMomentum: "building" | "steady" | "drifting" | "stalled";
  explanation: {
    whyItExists: string;
    whyNow: string;
    whatSuccessLooksLike: string;
    whatExecutiveOSOwns: string;
    whatExecutionSystemsOwn: string;
  };
};

export type InitiativeTemplateId =
  | "improve_cash_flow"
  | "increase_asset_availability"
  | "reduce_customer_churn"
  | "improve_safety_performance"
  | "expand_new_markets"
  | "strengthen_cyber_resilience"
  | "increase_technician_capacity"
  | "prepare_board_strategy_review"
  | "improve_workforce_capability"
  | "accelerate_digital_transformation";

export type InitiativeSimulationScore = {
  strategicEffectiveness: number;
  outcomeAchievement: number;
  executiveCoordination: number;
  decisionQuality: number;
  alignment: number;
  interventionEffectiveness: number;
  businessImpact: number;
  overall: number;
  notes: string[];
};
