import {
  evaluateInitiativeRules,
  evaluateObjectiveRules,
  evaluatePortfolioRules,
  type HealthRuleContext,
} from "@/lib/health/rules";
import { evaluateCalendarHealthRules } from "@/lib/health/calendar-rules";
import {
  buildRecommendedActions,
  countDeclining,
  mergePortfolioExplanation,
  mergeRecommendedActions,
  priorityWeight,
  scoreSignals,
  sumSignalImpact,
  weightedAverage,
  deriveTrend,
  clampScore,
} from "@/lib/health/scoring";
import type {
  EntityHealthAssessment,
  ExecutiveHealthReport,
  HealthEngine,
  HealthEngineInput,
} from "@/lib/health/types";

function buildInitiativeAssessment(
  input: HealthEngineInput,
  context: HealthRuleContext,
): EntityHealthAssessment[] {
  return input.initiatives.map((item) => {
    const signals = evaluateInitiativeRules(item, context);
    const completed =
      item.initiative.status === "completed" ||
      item.initiative.progress_percentage >= 100;
    const scored = scoreSignals(signals, completed);

    return {
      entityId: item.initiative.id,
      entityType: "initiative",
      title: item.initiative.title,
      signals,
      ...scored,
      recommendedActions: buildRecommendedActions(signals, item.initiative.title),
    };
  });
}

function buildObjectiveAssessment(
  input: HealthEngineInput,
  initiativeAssessments: EntityHealthAssessment[],
): EntityHealthAssessment[] {
  const initiativeSnapshots = input.initiatives.map((item) => ({
    initiative: item.initiative,
    links: item.links,
    score:
      initiativeAssessments.find(
        (assessment) => assessment.entityId === item.initiative.id,
      )?.score ?? 75,
  }));

  return input.objectives.map((objective) => {
    const signals = evaluateObjectiveRules(
      objective,
      initiativeSnapshots,
      input.decisions,
    );
    const scored = scoreSignals(signals);

    return {
      entityId: objective.id,
      entityType: "objective",
      title: objective.title,
      signals,
      ...scored,
      recommendedActions: buildRecommendedActions(signals, objective.title),
    };
  });
}

function buildPortfolioAssessment(
  input: HealthEngineInput,
  objectiveAssessments: EntityHealthAssessment[],
  initiativeAssessments: EntityHealthAssessment[],
  context: HealthRuleContext,
): EntityHealthAssessment {
  const allLinks = input.initiatives.flatMap((item) => item.links);
  const portfolioSignals = [
    ...evaluatePortfolioRules(context, allLinks),
    ...evaluateCalendarHealthRules(input.calendar),
  ];

  const objectiveScore = weightedAverage(
    objectiveAssessments.map((item) => ({
      score: item.score,
      weight: priorityWeight(
        input.objectives.find((objective) => objective.id === item.entityId)
          ?.priority ?? "medium",
      ),
    })),
  );

  const initiativeScore = weightedAverage(
    initiativeAssessments.map((item) => ({
      score: item.score,
      weight: priorityWeight(
        input.initiatives.find(
          ({ initiative }) => initiative.id === item.entityId,
        )?.initiative.priority ?? "medium",
      ),
    })),
  );

  const blendedScore = clampScore(
    input.objectives.length > 0 && input.initiatives.length > 0
      ? objectiveScore * 0.45 + initiativeScore * 0.55
      : input.initiatives.length > 0
        ? initiativeScore
        : objectiveScore,
  );

  const portfolioImpact = sumSignalImpact(portfolioSignals);
  const score = clampScore(blendedScore + portfolioImpact);
  const trend = deriveTrend(portfolioSignals, score);

  const explanation = mergePortfolioExplanation(
    {
      objectives: objectiveAssessments,
      initiatives: initiativeAssessments,
    },
    portfolioSignals,
  );

  const recommendedActions = mergeRecommendedActions([
    ...initiativeAssessments.filter((item) => item.trend === "declining"),
    ...objectiveAssessments.filter((item) => item.trend === "declining"),
  ]);

  return {
    entityId: "portfolio",
    entityType: "portfolio",
    title: "Executive Portfolio",
    score,
    trend,
    status:
      score >= 75 ? "on_track" : score >= 50 ? "at_risk" : "off_track",
    statusLabel:
      score >= 75 ? "On Track" : score >= 50 ? "At Risk" : "Off Track",
    explanation,
    signals: portfolioSignals,
    recommendedActions,
  };
}

export const analyzeExecutiveHealth: HealthEngine = (
  input: HealthEngineInput,
): ExecutiveHealthReport => {
  const now = new Date();
  const context: HealthRuleContext = {
    objectives: input.objectives,
    decisions: input.decisions,
    memories: input.memories,
    meetings: input.meetings,
    now,
  };

  const initiatives = buildInitiativeAssessment(input, context);
  const objectives = buildObjectiveAssessment(input, initiatives);
  const portfolio = buildPortfolioAssessment(
    input,
    objectives,
    initiatives,
    context,
  );

  return {
    score: portfolio.score,
    trend: portfolio.trend,
    explanation: portfolio.explanation,
    recommendedActions: mergeRecommendedActions([
      portfolio,
      ...initiatives,
      ...objectives,
    ]),
    objectives,
    initiatives,
    decliningCount: countDeclining(objectives, initiatives),
    computedAt: now.toISOString(),
  };
};

export function getInitiativeHealthAssessment(
  report: ExecutiveHealthReport,
  initiativeId: string,
): EntityHealthAssessment | null {
  return (
    report.initiatives.find((item) => item.entityId === initiativeId) ?? null
  );
}

export function getObjectiveHealthAssessment(
  report: ExecutiveHealthReport,
  objectiveId: string,
): EntityHealthAssessment | null {
  return (
    report.objectives.find((item) => item.entityId === objectiveId) ?? null
  );
}
