/**
 * Executive Agenda — leadership team's current strategic priorities.
 * Coordinates initiatives; never owns operational task execution.
 */

import type { CouncilAgentId } from "@/agents/types";
import type { BusinessDriverId } from "@/futures/models/types";
import type {
  InitiativePriority,
  InitiativeProgressState,
  StrategicInitiative,
} from "@/initiatives/models/types";

export const AGENDA_PRIORITIES = [
  "critical",
  "high",
  "medium",
  "watch",
] as const;

export type AgendaPriority = (typeof AGENDA_PRIORITIES)[number];

export type AgendaHealth =
  | "healthy"
  | "stable"
  | "watch"
  | "at_risk"
  | "critical";

export type ExecutiveAgendaItem = {
  id: string;
  title: string;
  strategicTheme: string;
  executiveSponsor: CouncilAgentId;
  executiveCouncilParticipants: CouncilAgentId[];
  priority: AgendaPriority;
  businessDrivers: BusinessDriverId[];
  relatedStrategicInitiativeIds: string[];
  relatedFutureIds: string[];
  relatedDecisionIds: string[];
  relatedRiskIds: string[];
  relatedOpportunityIds: string[];
  overallHealth: AgendaHealth;
  confidence: number;
  reviewCadence: string;
  evidence: string[];
  /** Primary initiative backing this agenda item */
  primaryInitiativeId: string;
  strategicMomentum: StrategicInitiative["strategicMomentum"];
  attentionRequired: boolean;
};

export type ExecutiveAgenda = {
  id: string;
  asOf: string;
  title: string;
  framing: string;
  items: ExecutiveAgendaItem[];
  initiatives: StrategicInitiative[];
  boardReadiness: {
    level: "ready" | "nearly" | "not_ready";
    label: string;
    detail: string;
  };
  overallHealth: AgendaHealth;
  confidence: number;
  strategicMomentum: "building" | "steady" | "drifting" | "stalled";
  closingNote: string;
};

export type AgendaItemView = {
  id: string;
  title: string;
  strategicTheme: string;
  priority: AgendaPriority;
  priorityLabel: string;
  executiveSponsor: string;
  executiveSponsorTitle: string;
  health: AgendaHealth;
  healthLabel: string;
  confidence: number;
  strategicMomentum: string;
  momentumLabel: string;
  attentionRequired: boolean;
  reviewCadence: string;
  businessDrivers: string[];
  relatedFutures: string[];
  upcomingDecisions: string[];
  criticalDependencies: string[];
  evidence: string[];
  councilAlignment: Array<{
    agent: string;
    shortTitle: string;
    agreement: string;
    contribution: string;
    stance: string;
  }>;
  disagreements: Array<{
    topic: string;
    positions: Array<{ agent: string; stance: string; statement: string }>;
    facilitation: string;
  }>;
  initiative: {
    id: string;
    title: string;
    executiveOutcome: string;
    businessObjective: string;
    progress: InitiativeProgressState;
    progressLabel: string;
    progressPercent: number;
    successMeasures: string[];
    completionCriteria: string[];
    whyItExists: string;
    whyNow: string;
    whatSuccessLooksLike: string;
    operationalLinks: Array<{ system: string; owns: string }>;
    reasoning: string[];
  };
};

export type ExecutiveAgendaView = {
  title: string;
  framing: string;
  overallHealth: AgendaHealth;
  overallHealthLabel: string;
  confidence: number;
  strategicMomentum: string;
  momentumLabel: string;
  boardReadiness: {
    level: string;
    label: string;
    detail: string;
  };
  items: AgendaItemView[];
  closingNote: string;
};
