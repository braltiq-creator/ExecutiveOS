import type { CalendarHealthMetrics } from "@/lib/intelligence/providers/types";
import type { ExecutiveDecisionRecord } from "@/lib/decisions/types";
import type { InitiativeWithLinks } from "@/lib/initiatives/types";
import type { InitiativeHealthStatus } from "@/lib/initiatives/types";
import type {
  ExecutiveMeetingRecord,
  MeetingActionRecord,
} from "@/lib/meetings/types";
import type { ExecutiveMemoryRecord } from "@/lib/memory/types";
import type { StrategicObjective } from "@/types/onboarding";

export const HEALTH_TRENDS = ["improving", "stable", "declining"] as const;

export type HealthTrend = (typeof HEALTH_TRENDS)[number];

export const HEALTH_TREND_LABELS: Record<HealthTrend, string> = {
  improving: "Improving",
  stable: "Stable",
  declining: "Declining",
};

export type HealthSignalCategory =
  | "progress"
  | "risk"
  | "opportunity"
  | "action"
  | "decision"
  | "meeting"
  | "memory"
  | "objective";

export type HealthSignal = {
  id: string;
  label: string;
  impact: number;
  category: HealthSignalCategory;
};

export type RecommendedActionPriority = "high" | "medium" | "low";

export type RecommendedAction = {
  id: string;
  title: string;
  rationale: string;
  priority: RecommendedActionPriority;
};

export type EntityHealthAssessment = {
  entityId: string;
  entityType: "objective" | "initiative" | "portfolio";
  title: string;
  score: number;
  trend: HealthTrend;
  status: InitiativeHealthStatus;
  statusLabel: string;
  explanation: string[];
  signals: HealthSignal[];
  recommendedActions: RecommendedAction[];
};

export type ExecutiveHealthReport = {
  score: number;
  trend: HealthTrend;
  explanation: string[];
  recommendedActions: RecommendedAction[];
  objectives: EntityHealthAssessment[];
  initiatives: EntityHealthAssessment[];
  decliningCount: number;
  computedAt: string;
};

export type MeetingWithActions = {
  meeting: ExecutiveMeetingRecord;
  actions: MeetingActionRecord[];
};

export type HealthEngineInput = {
  objectives: StrategicObjective[];
  initiatives: InitiativeWithLinks[];
  decisions: ExecutiveDecisionRecord[];
  memories: ExecutiveMemoryRecord[];
  meetings: MeetingWithActions[];
  calendar?: CalendarHealthMetrics | null;
};

export type HealthEngine = (input: HealthEngineInput) => ExecutiveHealthReport;

export function formatHealthTrend(trend: HealthTrend): string {
  return HEALTH_TREND_LABELS[trend];
}

export function scoreToHealthStatus(
  score: number,
  completed = false,
): InitiativeHealthStatus {
  if (completed || score >= 100) {
    return "completed";
  }

  if (score >= 75) {
    return "on_track";
  }

  if (score >= 50) {
    return "at_risk";
  }

  return "off_track";
}

export function statusLabelForScore(
  score: number,
  completed = false,
): string {
  const status = scoreToHealthStatus(score, completed);
  const labels: Record<InitiativeHealthStatus, string> = {
    on_track: "On Track",
    at_risk: "At Risk",
    off_track: "Off Track",
    completed: "Completed",
  };

  return labels[status];
}
