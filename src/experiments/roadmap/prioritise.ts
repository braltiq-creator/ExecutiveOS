import type {
  ProductInsight,
  RoadmapRecommendation,
} from "@/experiments/framework/types";
import { listExperiments } from "@/experiments/experiments";
import { listCachedInsights } from "@/experiments/insights";
import { listInterviews } from "@/experiments/interviews";
import type { PilotIntelligenceSnapshot } from "@/experiments/framework/types";

let roadmapSeq = 0;

export function resetRoadmapRecommendations(): void {
  roadmapSeq = 0;
}

/**
 * Recommend roadmap priorities from experiments, feedback, usage, and pilot success.
 * Uses cached insights + optional precomputed intelligence to avoid re-entrancy.
 */
export function recommendRoadmapPriorities(input?: {
  asOf?: string;
  insights?: ProductInsight[];
  intelligence?: PilotIntelligenceSnapshot[];
}): RoadmapRecommendation[] {
  const when = input?.asOf ?? new Date().toISOString();
  const insights = input?.insights ?? listCachedInsights();
  const experiments = listExperiments();
  const interviews = listInterviews();
  const recommendations: RoadmapRecommendation[] = [];

  const validated = experiments.filter((e) => e.result === "validated");
  for (const exp of validated.slice(0, 5)) {
    roadmapSeq += 1;
    recommendations.push({
      id: `rmap-${roadmapSeq}`,
      title: exp.recommendedAction ?? `Scale learning from ${exp.id}`,
      rationale: exp.learning ?? exp.hypothesis,
      confidence: 86,
      sources: ["experiment", "usage"],
      targetProfileId: exp.targetProfileId,
      relatedInsightIds: [],
      relatedExperimentIds: [exp.id],
      createdAt: when,
    });
  }

  const p0 = insights.filter((i) => i.priority === "p0").slice(0, 4);
  for (const insight of p0) {
    roadmapSeq += 1;
    recommendations.push({
      id: `rmap-${roadmapSeq}`,
      title: `Address: ${insight.title}`,
      rationale: insight.detail,
      confidence: insight.confidence,
      sources: ["usage", "feedback", "pilot_success"],
      targetProfileId: insight.profileId,
      relatedInsightIds: [insight.id],
      relatedExperimentIds: insight.experimentIds,
      createdAt: when,
    });
  }

  const featureRequests = interviews.flatMap((i) => i.featureRequests);
  if (featureRequests[0]) {
    roadmapSeq += 1;
    recommendations.push({
      id: `rmap-${roadmapSeq}`,
      title: `Interview-driven: ${featureRequests[0]}`,
      rationale:
        "Recurring executive interview request — validate with a focused experiment before full build.",
      confidence: 64,
      sources: ["feedback"],
      targetProfileId: "all",
      relatedInsightIds: [],
      relatedExperimentIds: interviews.flatMap((i) => i.experimentIds).slice(0, 2),
      createdAt: when,
    });
  }

  const health = input?.intelligence ?? [];
  const avgValue =
    health.length === 0
      ? 0
      : Math.round(
          health.reduce((s, h) => s + h.metrics.businessValue.value, 0) /
            health.length,
        );
  if (avgValue >= 60) {
    roadmapSeq += 1;
    recommendations.push({
      id: `rmap-${roadmapSeq}`,
      title: "Invest in recommendation + trust depth",
      rationale: `Portfolio business-value proxy at ${avgValue} — deepen explainability and outcome confirmation loops.`,
      confidence: 71,
      sources: ["business_outcome", "pilot_success", "usage"],
      targetProfileId: "all",
      relatedInsightIds: [],
      relatedExperimentIds: [],
      createdAt: when,
    });
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}
