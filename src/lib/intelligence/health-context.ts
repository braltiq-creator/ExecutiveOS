import { formatInitiativeHealth } from "@/lib/initiatives/types";
import type { ExecutiveHealthReport } from "@/lib/health/types";
import { formatHealthTrend } from "@/lib/health/types";
import type {
  ExecutiveHealthContext,
  ExecutiveInitiativeContext,
  ExecutiveInitiativesContext,
  ExecutiveObjectiveContext,
} from "@/types/intelligence";

export function mapExecutiveHealthContext(
  report: ExecutiveHealthReport,
): ExecutiveHealthContext {
  return {
    score: report.score,
    trend: report.trend,
    trendLabel: formatHealthTrend(report.trend),
    explanation: report.explanation,
    recommendedActions: report.recommendedActions,
    decliningCount: report.decliningCount,
    computedAt: report.computedAt,
  };
}

export function enrichObjectivesWithHealth(
  objectives: ExecutiveObjectiveContext[],
  report: ExecutiveHealthReport,
): ExecutiveObjectiveContext[] {
  return objectives.map((objective) => {
    const assessment = report.objectives.find(
      (item) => item.entityId === objective.id,
    );

    if (!assessment) {
      return objective;
    }

    return {
      ...objective,
      healthScore: assessment.score,
      healthTrend: assessment.trend,
      healthStatus: assessment.status,
      healthLabel: assessment.statusLabel,
      healthExplanation: assessment.explanation,
    };
  });
}

export function enrichInitiativesWithHealth(
  initiatives: ExecutiveInitiativeContext[],
  report: ExecutiveHealthReport,
): ExecutiveInitiativesContext {
  const enriched = initiatives.map((initiative) => {
    const assessment = report.initiatives.find(
      (item) => item.entityId === initiative.id,
    );

    if (!assessment) {
      return initiative;
    }

    return {
      ...initiative,
      healthScore: assessment.score,
      healthTrend: assessment.trend,
      healthStatus: assessment.status,
      healthLabel: formatInitiativeHealth(assessment.status),
      healthExplanation: assessment.explanation,
    };
  });

  return {
    initiatives: enriched,
    lastUpdatedAt: initiatives.reduce<string | null>((latest, item) => {
      if (!latest) {
        return item.updatedAt;
      }

      return new Date(item.updatedAt) > new Date(latest) ? item.updatedAt : latest;
    }, null),
    atRiskCount: enriched.filter((item) => item.healthStatus === "at_risk").length,
    offTrackCount: enriched.filter((item) => item.healthStatus === "off_track")
      .length,
    activeCount: enriched.filter((item) => item.status === "active").length,
  };
}
