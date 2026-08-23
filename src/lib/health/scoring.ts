import type { InitiativeHealthStatus } from "@/lib/initiatives/types";
import type {
  EntityHealthAssessment,
  HealthSignal,
  HealthTrend,
  RecommendedAction,
} from "@/lib/health/types";
import {
  scoreToHealthStatus,
  statusLabelForScore,
} from "@/lib/health/types";

const BASE_SCORE = 100;

const PRIORITY_WEIGHT: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function clampScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function sumSignalImpact(signals: HealthSignal[]): number {
  return signals.reduce((total, signal) => total + signal.impact, 0);
}

export function deriveTrend(signals: HealthSignal[], score: number): HealthTrend {
  const impact = sumSignalImpact(signals);

  if (impact <= -18 || score < 55) {
    return "declining";
  }

  if (impact >= 12 && score >= 70) {
    return "improving";
  }

  return "stable";
}

export function buildExplanation(signals: HealthSignal[]): string[] {
  const negative = signals
    .filter((signal) => signal.impact < 0)
    .sort((left, right) => left.impact - right.impact)
    .slice(0, 3)
    .map((signal) => signal.label);

  const positive = signals
    .filter((signal) => signal.impact > 0)
    .sort((left, right) => right.impact - left.impact)
    .slice(0, 2)
    .map((signal) => signal.label);

  if (negative.length === 0 && positive.length === 0) {
    return ["No significant health signals detected."];
  }

  return [...negative, ...positive];
}

export function buildRecommendedActions(
  signals: HealthSignal[],
  entityTitle: string,
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  const overdueAction = signals.find((signal) =>
    signal.id.includes("overdue-action"),
  );
  if (overdueAction) {
    actions.push({
      id: `${overdueAction.id}-recommendation`,
      title: "Clear overdue actions",
      rationale: `Resolve overdue actions linked to ${entityTitle} to reduce execution risk.`,
      priority: "high",
    });
  }

  const behindSchedule = signals.find((signal) =>
    signal.id.includes("behind-schedule") || signal.id.includes("past-target"),
  );
  if (behindSchedule) {
    actions.push({
      id: `${behindSchedule.id}-recommendation`,
      title: "Reset delivery plan",
      rationale: `Reconcile progress against the target timeline for ${entityTitle}.`,
      priority: "high",
    });
  }

  const riskSignal = signals.find((signal) => signal.category === "risk");
  if (riskSignal) {
    actions.push({
      id: `${riskSignal.id}-recommendation`,
      title: "Review linked risks",
      rationale: `Assess mitigation plans for risks affecting ${entityTitle}.`,
      priority: "medium",
    });
  }

  const noInitiatives = signals.find((signal) =>
    signal.id.includes("no-initiatives"),
  );
  if (noInitiatives) {
    actions.push({
      id: `${noInitiatives.id}-recommendation`,
      title: "Launch supporting initiative",
      rationale: `Create or link an initiative to drive progress on ${entityTitle}.`,
      priority: "high",
    });
  }

  const staleMeetings = signals.find((signal) =>
    signal.id.includes("stale-meetings") || signal.id.includes("no-meetings"),
  );
  if (staleMeetings) {
    actions.push({
      id: `${staleMeetings.id}-recommendation`,
      title: "Schedule executive check-in",
      rationale: `Restore meeting cadence to maintain momentum on ${entityTitle}.`,
      priority: "medium",
    });
  }

  return actions.slice(0, 4);
}

export function scoreSignals(
  signals: HealthSignal[],
  completed = false,
): Pick<
  EntityHealthAssessment,
  "score" | "trend" | "status" | "statusLabel" | "explanation" | "recommendedActions"
> {
  const score = clampScore(BASE_SCORE + sumSignalImpact(signals));
  const trend = deriveTrend(signals, score);
  const status: InitiativeHealthStatus = scoreToHealthStatus(score, completed);
  const statusLabel = statusLabelForScore(score, completed);

  return {
    score,
    trend,
    status,
    statusLabel,
    explanation: buildExplanation(signals),
    recommendedActions: buildRecommendedActions(signals, "this item"),
  };
}

export function weightedAverage(
  items: Array<{ score: number; weight: number }>,
  fallback = 75,
): number {
  if (items.length === 0) {
    return fallback;
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight === 0) {
    return fallback;
  }

  const weightedSum = items.reduce(
    (sum, item) => sum + item.score * item.weight,
    0,
  );

  return clampScore(weightedSum / totalWeight);
}

export function priorityWeight(priority: string): number {
  return PRIORITY_WEIGHT[priority] ?? 2;
}

export function mergeRecommendedActions(
  assessments: EntityHealthAssessment[],
  limit = 6,
): RecommendedAction[] {
  const seen = new Set<string>();
  const merged: RecommendedAction[] = [];

  for (const assessment of assessments) {
    for (const action of assessment.recommendedActions) {
      if (seen.has(action.title)) {
        continue;
      }

      seen.add(action.title);
      merged.push(action);
    }
  }

  const priorityRank = { high: 3, medium: 2, low: 1 };

  return merged
    .sort(
      (left, right) => priorityRank[right.priority] - priorityRank[left.priority],
    )
    .slice(0, limit);
}

export function mergePortfolioExplanation(
  report: Pick<ExecutiveHealthReportLike, "objectives" | "initiatives">,
  portfolioSignals: HealthSignal[],
): string[] {
  const decliningObjectives = report.objectives.filter(
    (item) => item.trend === "declining",
  ).length;
  const decliningInitiatives = report.initiatives.filter(
    (item) => item.trend === "declining",
  ).length;

  const lines: string[] = [];

  if (decliningInitiatives > 0) {
    lines.push(
      `${decliningInitiatives} initiative${decliningInitiatives === 1 ? "" : "s"} showing declining health.`,
    );
  }

  if (decliningObjectives > 0) {
    lines.push(
      `${decliningObjectives} objective${decliningObjectives === 1 ? "" : "s"} showing declining health.`,
    );
  }

  lines.push(...buildExplanation(portfolioSignals).slice(0, 2));

  if (lines.length === 0) {
    return ["Portfolio health is stable across objectives and initiatives."];
  }

  return lines;
}

type ExecutiveHealthReportLike = {
  objectives: EntityHealthAssessment[];
  initiatives: EntityHealthAssessment[];
};

export function countDeclining(
  objectives: EntityHealthAssessment[],
  initiatives: EntityHealthAssessment[],
): number {
  return (
    objectives.filter((item) => item.trend === "declining").length +
    initiatives.filter((item) => item.trend === "declining").length
  );
}
