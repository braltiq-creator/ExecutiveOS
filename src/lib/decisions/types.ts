import type { MemoryImportance } from "@/lib/memory/types";

export const DECISION_STATUSES = [
  "draft",
  "approved",
  "in_progress",
  "implemented",
  "under_review",
  "archived",
] as const;

export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export const DECISION_RISK_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type DecisionRiskLevel = (typeof DECISION_RISK_LEVELS)[number];

export type ExecutiveDecisionRecord = {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  decision_reason: string;
  alternatives_considered: string | null;
  expected_outcome: string;
  status: DecisionStatus;
  owner: string;
  decision_date: string;
  review_date: string | null;
  strategic_objective_id: string | null;
  risk_level: DecisionRiskLevel;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveDecisionInput = {
  id?: string;
  title: string;
  summary: string;
  decisionReason: string;
  alternativesConsidered?: string;
  expectedOutcome: string;
  status: DecisionStatus;
  owner: string;
  decisionDate: string;
  reviewDate?: string;
  strategicObjectiveId?: string;
  riskLevel: DecisionRiskLevel;
};

export type DecisionQueryOptions = {
  includeArchived?: boolean;
  status?: DecisionStatus;
  limit?: number;
};

export class ExecutiveDecisionError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ExecutiveDecisionError";
    this.code = code;
  }
}

export function formatDecisionStatus(status: DecisionStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDecisionRiskLevel(level: DecisionRiskLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function decisionMemorySource(decisionId: string): string {
  return `executive_decision:${decisionId}`;
}

export function buildDecisionMemoryContent(
  decision: ExecutiveDecisionRecord,
): string {
  const parts = [
    decision.summary,
    `Reason: ${decision.decision_reason}`,
    `Expected outcome: ${decision.expected_outcome}`,
    decision.alternatives_considered
      ? `Alternatives: ${decision.alternatives_considered}`
      : null,
    `Owner: ${decision.owner}`,
    `Status: ${formatDecisionStatus(decision.status)}`,
    `Risk: ${formatDecisionRiskLevel(decision.risk_level)}`,
  ].filter(Boolean);

  return parts.join("\n\n");
}

export function riskLevelToMemoryImportance(
  level: DecisionRiskLevel,
): MemoryImportance {
  switch (level) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
      return "medium";
    case "low":
      return "low";
  }
}
