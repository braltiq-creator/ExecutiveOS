/**
 * Attach Trust & Explainability to Today recommendations.
 * Presentation layer only — Core engines unchanged.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import { buildExplanationForAction } from "@/trust/explainability/build-explanation";
import { decisionPathLabels } from "@/trust/decision-path";
import { recordProvenance } from "@/trust/provenance";
import { appendTrustAudit } from "@/trust/audit";
import { assertTrustPayload } from "@/trust/governance";

export function attachTrustExplanationsToTodayActions(
  snapshot: ExecutiveSnapshot,
  tenantId: string,
  _profileId?: IntelligenceProfileId,
): ExecutiveSnapshot {
  const asOf = snapshot.asOf;

  const recommendedActions = snapshot.recommendedActions.map((action) => {
    const explanation = buildExplanationForAction({
      tenantId,
      action,
      asOf,
    });

    const governance = assertTrustPayload({
      evidenceCount: explanation.evidenceSources.length,
    });

    for (const step of explanation.reasoningPath) {
      recordProvenance({
        tenantId,
        explanationId: explanation.id,
        recommendationId: action.id,
        stage: step.id,
        summary: step.summary,
        actor: "trust-framework",
        at: asOf,
      });
    }

    appendTrustAudit({
      tenantId,
      explanationId: explanation.id,
      recommendationId: action.id,
      kind: "recommendation",
      summary: `Explanation built for “${action.title}”`,
      confidenceScore: explanation.confidence.score,
      at: asOf,
      payload: { governanceOk: governance.ok },
    });
    appendTrustAudit({
      tenantId,
      explanationId: explanation.id,
      recommendationId: action.id,
      kind: "confidence",
      summary: explanation.confidence.headline,
      confidenceScore: explanation.confidence.score,
      at: asOf,
    });
    appendTrustAudit({
      tenantId,
      explanationId: explanation.id,
      recommendationId: action.id,
      kind: "evidence",
      summary: `${explanation.evidenceSources.length} evidence source(s)`,
      confidenceScore: explanation.confidence.score,
      at: asOf,
    });
    appendTrustAudit({
      tenantId,
      explanationId: explanation.id,
      recommendationId: action.id,
      kind: "reasoning",
      summary: `${explanation.reasoningPath.length}-step decision path`,
      confidenceScore: explanation.confidence.score,
      at: asOf,
    });

    return {
      ...action,
      explanationId: explanation.id,
      whyWeBelieveThis: explanation.whyWeBelieveThis,
      confidenceExplanation: explanation.confidence.headline,
      confidenceReasons: [
        ...explanation.confidence.reasonsFor.map((r) => `+ ${r}`),
        ...explanation.confidence.reasonsAgainst.map((r) => `− ${r}`),
      ],
      confidenceBand: explanation.confidence.band,
      evidenceSummary: explanation.evidenceSources
        .slice(0, 4)
        .map((e) => e.label),
      memorySummary: explanation.relatedMemoryEpisodes.slice(0, 3),
      alternativeSummary:
        explanation.alternativeInterpretations[0]?.interpretation,
      decisionPathLabels: decisionPathLabels(explanation.reasoningPath),
      confidence: explanation.confidence.score,
    };
  });

  return { ...snapshot, recommendedActions };
}
