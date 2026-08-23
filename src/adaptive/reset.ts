import { resetAdaptiveProfiles } from "@/adaptive/preferences/store";
import { resetAdaptiveBehaviour } from "@/adaptive/behaviour/store";
import { resetRecommendationLearning } from "@/adaptive/recommendation-learning/store";
import { resetLearningHistory } from "@/adaptive/governance/history";
import { resetConfidenceLearning } from "@/adaptive/confidence/evolve";
import { resetImprovementOpportunities } from "@/adaptive/optimisation/improve";

export function resetAdaptivePlatform(): void {
  resetAdaptiveProfiles();
  resetAdaptiveBehaviour();
  resetRecommendationLearning();
  resetLearningHistory();
  resetConfidenceLearning();
  resetImprovementOpportunities();
}
