/**
 * Reset all Executive Outcomes Engine in-memory stores (tests).
 */

import { resetBusinessOutcomeTypes } from "@/outcomes/framework";
import { resetRecommendationTracks } from "@/outcomes/recommendation-tracking";
import { resetExecutiveActions } from "@/outcomes/executive-actions";
import { resetExecutiveOutcomes } from "@/outcomes/business-outcomes";
import { resetLearningWeights } from "@/outcomes/learning";
import { resetOutcomesAnalyticsState } from "@/outcomes/analytics";
import { resetOutcomesBenchmarking } from "@/outcomes/benchmarking";

export function resetOutcomesEngine(): void {
  resetBusinessOutcomeTypes();
  resetRecommendationTracks();
  resetExecutiveActions();
  resetExecutiveOutcomes();
  resetLearningWeights();
  resetOutcomesAnalyticsState();
  resetOutcomesBenchmarking();
}
