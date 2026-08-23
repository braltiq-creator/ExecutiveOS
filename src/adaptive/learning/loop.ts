/**
 * Continuous learning loop — orchestrates behaviour → preferences → ranking.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { recordAdaptiveBehaviour } from "@/adaptive/behaviour/store";
import { buildPersonalisationPlan } from "@/adaptive/personalisation/plan";
import { improveValueEstimation } from "@/adaptive/confidence/evolve";
import { identifyImprovementOpportunities } from "@/adaptive/optimisation/improve";
import { ensureAdaptiveProfile } from "@/adaptive/preferences/store";

export function runAdaptiveLearningCycle(input: {
  tenantId: string;
  executiveId: string;
  profileId: IntelligenceProfileId;
}): {
  profile: ReturnType<typeof ensureAdaptiveProfile>;
  plan: ReturnType<typeof buildPersonalisationPlan>;
  improvements: ReturnType<typeof identifyImprovementOpportunities>;
} {
  ensureAdaptiveProfile(input);
  recordAdaptiveBehaviour({
    ...input,
    kind: "brief_open",
  });
  const plan = buildPersonalisationPlan(input);
  improveValueEstimation({
    tenantId: input.tenantId,
    executiveId: input.executiveId,
  });
  const improvements = identifyImprovementOpportunities({
    tenantId: input.tenantId,
  });
  const profile = ensureAdaptiveProfile(input);
  return { profile, plan, improvements };
}
