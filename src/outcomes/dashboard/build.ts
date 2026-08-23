/**
 * Executive Outcomes dashboard builder.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { buildOutcomesAnalytics } from "@/outcomes/analytics";
import { measureDecisionImpact } from "@/outcomes/decision-impact";
import { measureValueRealisation } from "@/outcomes/value-realisation";
import { estimateOutcomesRoi } from "@/outcomes/roi";
import { assessOutcomesConfidence } from "@/outcomes/confidence";
import { listExecutiveOutcomes } from "@/outcomes/business-outcomes";
import { listExecutiveActions } from "@/outcomes/executive-actions";
import { listRecommendationTracks } from "@/outcomes/recommendation-tracking";
import { applyConfirmedOutcomesLearning } from "@/outcomes/learning";
import type { OutcomesDashboard } from "@/outcomes/framework/types";

export function buildOutcomesDashboard(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): OutcomesDashboard {
  const asOf = input.asOf ?? new Date().toISOString();
  applyConfirmedOutcomesLearning({ tenantId: input.tenantId, asOf });

  return {
    asOf,
    tenantId: input.tenantId,
    analytics: buildOutcomesAnalytics(input),
    decisionImpact: measureDecisionImpact({
      tenantId: input.tenantId,
      asOf,
    }),
    value: measureValueRealisation(input),
    roi: estimateOutcomesRoi(input),
    confidence: assessOutcomesConfidence({
      tenantId: input.tenantId,
      asOf,
    }),
    recentOutcomes: listExecutiveOutcomes(input.tenantId).slice(0, 8),
    recentActions: listExecutiveActions(input.tenantId).slice(0, 8),
    openRecommendations: listRecommendationTracks(input.tenantId)
      .filter((r) => !["archived", "dismissed"].includes(r.status))
      .slice(0, 10),
  };
}
