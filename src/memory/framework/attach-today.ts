/**
 * Attach organisational memory recall to Today recommendations.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { ExecutiveSnapshot, SnapshotAction } from "@/lib/snapshot/types";
import { recallOrganisationalMemory } from "@/memory/recall";

function recallQueryForAction(action: SnapshotAction): string {
  return [
    action.businessQuestion,
    action.title,
    action.why,
    action.scenarioName,
  ]
    .filter(Boolean)
    .join(" ");
}

export function attachMemoryRecallToTodayActions(
  snapshot: ExecutiveSnapshot,
  tenantId: string,
  _profileId?: IntelligenceProfileId,
): ExecutiveSnapshot {
  const recommendedActions = snapshot.recommendedActions.map((action) => {
    const recall = recallOrganisationalMemory({
      tenantId,
      query: recallQueryForAction(action),
    });

    if (
      recall.similarEpisodes.length === 0 &&
      recall.previousDecisions.length === 0 &&
      recall.lessons.length === 0
    ) {
      return action;
    }

    return {
      ...action,
      previousSituations: recall.similarEpisodes.map(
        (e) => `${e.name} — ${e.businessQuestion}`,
      ),
      pastDecisions: recall.previousDecisions.map((d) => d.title),
      observedOutcomes: recall.comparableOutcomes,
      lessonsLearned: recall.lessons.slice(0, 3),
      similarityConfidence: recall.overallSimilarityConfidence,
    };
  });

  return { ...snapshot, recommendedActions };
}
