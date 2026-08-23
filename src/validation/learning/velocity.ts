/**
 * Learning velocity — is ExecutiveOS improving every day?
 */

import type { ValidationHistoryPoint } from "@/validation/types";

export type LearningAssessment = {
  velocity: number;
  trend: "up" | "flat" | "down";
  dailyImprovements: string[];
  explanation: string;
};

export function assessLearning(input: {
  history: ValidationHistoryPoint[];
  graphGrowth: number;
  feedbackCount: number;
  validationsCompleted: number;
}): LearningAssessment {
  const points = input.history;
  if (points.length < 2) {
    return {
      velocity: Math.max(1, input.graphGrowth + input.validationsCompleted),
      trend: "up",
      dailyImprovements: buildImprovements(input),
      explanation: "Learning has begun — early signals are forming.",
    };
  }

  const latest = points[points.length - 1]!;
  const prior = points[points.length - 2]!;
  const delta = latest.overallScore - prior.overallScore;
  const velocity = Math.max(
    0,
    Math.round(delta + input.graphGrowth * 0.5 + input.validationsCompleted),
  );

  return {
    velocity,
    trend: delta > 1 ? "up" : delta < -1 ? "down" : "flat",
    dailyImprovements: buildImprovements(input),
    explanation:
      delta > 1
        ? `Intelligence improved ${delta} points since last checkpoint.`
        : delta < -1
          ? `Intelligence dipped ${Math.abs(delta)} points — review gaps.`
          : "Intelligence held steady; continue validating discoveries.",
  };
}

function buildImprovements(input: {
  graphGrowth: number;
  feedbackCount: number;
  validationsCompleted: number;
}): string[] {
  const items: string[] = [];
  if (input.graphGrowth > 0) {
    items.push(`Knowledge Graph grew by ${input.graphGrowth} entities`);
  }
  if (input.validationsCompleted > 0) {
    items.push(`${input.validationsCompleted} discoveries validated`);
  }
  if (input.feedbackCount > 0) {
    items.push(`${input.feedbackCount} executive feedback signals absorbed`);
  }
  if (items.length === 0) {
    items.push("Awaiting today's validation activity");
  }
  return items;
}
