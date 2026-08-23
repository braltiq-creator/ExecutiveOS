import { resetHypotheses } from "@/experiments/hypotheses";
import { resetExperiments } from "@/experiments/experiments";
import { resetBehaviourEvents } from "@/experiments/behaviour";
import { resetInterviews } from "@/experiments/interviews";
import { resetProductFeedback } from "@/experiments/feedback";
import { resetProductInsights } from "@/experiments/insights";
import { resetRoadmapRecommendations } from "@/experiments/roadmap";

export function resetExperimentationPlatform(): void {
  resetHypotheses();
  resetExperiments();
  resetBehaviourEvents();
  resetInterviews();
  resetProductFeedback();
  resetProductInsights();
  resetRoadmapRecommendations();
}
