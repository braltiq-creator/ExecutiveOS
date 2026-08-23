import type { InsightScores } from "@/lib/intelligence-center/types";

export type PrioritizationInput = {
  impact: number;
  urgency: number;
  confidence: number;
  strategicAlignment: number;
  risk: number;
};

const WEIGHTS = {
  impact: 0.28,
  urgency: 0.24,
  confidence: 0.14,
  strategicAlignment: 0.2,
  risk: 0.14,
} as const;

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function computePriorityScore(input: PrioritizationInput): number {
  const score =
    input.impact * WEIGHTS.impact +
    input.urgency * WEIGHTS.urgency +
    input.confidence * WEIGHTS.confidence +
    input.strategicAlignment * WEIGHTS.strategicAlignment +
    input.risk * WEIGHTS.risk;

  return clamp(score);
}

export function buildInsightScores(input: PrioritizationInput): InsightScores {
  return {
    impact: clamp(input.impact),
    urgency: clamp(input.urgency),
    confidence: clamp(input.confidence),
    strategicAlignment: clamp(input.strategicAlignment),
    risk: clamp(input.risk),
    priorityScore: computePriorityScore(input),
  };
}

export function rankByPriority<T extends { scores: InsightScores }>(
  items: T[],
): T[] {
  return [...items].sort(
    (left, right) => right.scores.priorityScore - left.scores.priorityScore,
  );
}

export function importanceToScore(importance: string): number {
  switch (importance) {
    case "critical":
      return 95;
    case "high":
      return 78;
    case "medium":
      return 55;
    case "low":
      return 30;
    default:
      return 45;
  }
}

export function objectivePriorityToScore(priority: string): number {
  switch (priority) {
    case "high":
      return 85;
    case "medium":
      return 60;
    case "low":
      return 35;
    default:
      return 50;
  }
}

export function initiativeHealthToUrgency(healthStatus: string): number {
  switch (healthStatus) {
    case "off_track":
      return 92;
    case "at_risk":
      return 78;
    case "on_track":
      return 40;
    case "completed":
      return 15;
    default:
      return 50;
  }
}

export function decisionRiskToScore(riskLevel: string): number {
  switch (riskLevel) {
    case "critical":
      return 95;
    case "high":
      return 80;
    case "medium":
      return 55;
    case "low":
      return 30;
    default:
      return 45;
  }
}

export function hoursUntil(isoDate: string): number {
  return (new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60);
}

export function urgencyFromHours(hours: number): number {
  if (hours <= 0) return 95;
  if (hours <= 4) return 88;
  if (hours <= 24) return 75;
  if (hours <= 72) return 58;
  if (hours <= 168) return 42;
  return 25;
}
