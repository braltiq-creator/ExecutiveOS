/**
 * Reality Lab evaluation public API.
 */

export type * from "@/evaluation/types";
export {
  EVALUATION_DIMENSIONS,
  EVALUATION_DIMENSION_LABELS,
  DEFAULT_EVALUATION_GATES,
} from "@/evaluation/types";

export {
  evaluateRecommendation,
  evaluateSnapshotRecommendations,
  fingerprintRecommendation,
} from "@/evaluation/evaluate-recommendation";
export type { EvaluateRecommendationInput } from "@/evaluation/evaluate-recommendation";
