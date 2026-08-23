import type { ImprovementOpportunity } from "@/adaptive/framework/types";
import { listAdaptiveProfiles } from "@/adaptive/preferences/store";
import { listRecommendationLearning } from "@/adaptive/recommendation-learning/store";
import { listAdaptiveBehaviour } from "@/adaptive/behaviour/store";

let seq = 0;

export function resetImprovementOpportunities(): void {
  seq = 0;
}

/**
 * Continuous improvement candidates — feedable to Product Intelligence.
 */
export function identifyImprovementOpportunities(input?: {
  tenantId?: string;
}): ImprovementOpportunity[] {
  const opportunities: ImprovementOpportunity[] = [];
  const learning = listRecommendationLearning(input?.tenantId);
  const behaviour = listAdaptiveBehaviour(input?.tenantId);
  const profiles = listAdaptiveProfiles(input?.tenantId);

  const ignored = learning.filter(
    (r) => (r.dispositions.ignored ?? 0) + (r.dispositions.rejected ?? 0) >= 2,
  );
  for (const rec of ignored.slice(0, 3)) {
    seq += 1;
    opportunities.push({
      id: `imp-${seq}`,
      kind: "consistently_ignored_recommendation",
      title: `Recommendation ${rec.recommendationId} often dismissed`,
      detail: rec.explanation,
      confidence: 76,
      feedToProductIntelligence: true,
    });
  }

  const elevated = learning.filter((r) => r.priorityBoost >= 10);
  for (const rec of elevated.slice(0, 3)) {
    seq += 1;
    opportunities.push({
      id: `imp-${seq}`,
      kind: "high_value_pattern",
      title: `High-value pattern on ${rec.recommendationId}`,
      detail: "Accepted/ROI-confirmed pattern — reinforce evidence framing for similar items.",
      confidence: 80,
      feedToProductIntelligence: true,
    });
  }

  const expands = behaviour.filter((b) => b.kind === "explanation_expand").length;
  const opens = behaviour.filter((b) => b.kind === "brief_open").length;
  if (opens >= 3 && expands === 0) {
    seq += 1;
    opportunities.push({
      id: `imp-${seq}`,
      kind: "rarely_used_feature",
      title: "Trust / explanation panels underused",
      detail: "Briefs open but explanations are rarely expanded — improve discoverability.",
      confidence: 70,
      feedToProductIntelligence: true,
    });
  }

  for (const profile of profiles) {
    if (profile.briefingBehaviour.preferredStartSection === "recommendations") {
      seq += 1;
      opportunities.push({
        id: `imp-${seq}`,
        kind: "executive_habit",
        title: "Habit: recommendations-first brief",
        detail: `Executive ${profile.executiveId} consistently prioritises recommendations.`,
        confidence: profile.learningConfidence,
        feedToProductIntelligence: false,
      });
    }
    if (profile.learningConfidence < 45) {
      seq += 1;
      opportunities.push({
        id: `imp-${seq}`,
        kind: "learning_opportunity",
        title: "Low adaptive confidence — need more labelled feedback",
        detail: "Prompt review completion to accelerate explainable personalisation.",
        confidence: 65,
        feedToProductIntelligence: true,
      });
    }
  }

  if (opportunities.length === 0) {
    seq += 1;
    opportunities.push({
      id: `imp-${seq}`,
      kind: "product_improvement",
      title: "Collect more adaptive signals",
      detail: "Insufficient behaviour yet — keep capture points on accept/dismiss/review.",
      confidence: 55,
      feedToProductIntelligence: true,
    });
  }

  return opportunities.sort((a, b) => b.confidence - a.confidence);
}

/** Bridge to Product Intelligence / experiments insights feed. */
export function feedImprovementsToProductIntelligence(
  opportunities: ImprovementOpportunity[],
): Array<{ title: string; detail: string; confidence: number }> {
  return opportunities
    .filter((o) => o.feedToProductIntelligence)
    .map((o) => ({
      title: o.title,
      detail: o.detail,
      confidence: o.confidence,
    }));
}
