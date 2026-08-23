/**
 * Require council perspectives to evaluate strategic outcome contribution.
 * Presentation-layer enrichment — Core council convene unchanged.
 */

import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import { listStrategicOutcomes } from "@/strategy/outcomes";
import { alignRecommendationToOutcomes } from "@/strategy/alignment";

export function attachStrategicOutcomesToCouncil(
  snapshot: ExecutiveSnapshot,
  tenantId: string,
): ExecutiveSnapshot {
  if (!snapshot.executiveCouncil) return snapshot;
  const outcomes = listStrategicOutcomes(tenantId);
  if (outcomes.length === 0) return snapshot;

  const perspectives = snapshot.executiveCouncil.perspectives.map(
    (perspective) => {
      const contributions = perspective.recommendations.flatMap((rec) => {
        const links = alignRecommendationToOutcomes({
          tenantId,
          title: rec,
          detail: perspective.summary,
        });
        return links.map(
          (link) =>
            `Contributes to "${link.outcomeName}" (~${link.estimatedContribution}% estimated contribution, conf ${link.confidence}%)`,
        );
      });

      const unique = [...new Set(contributions)].slice(0, 4);
      if (unique.length === 0) {
        const top = outcomes[0]!;
        unique.push(
          `Evaluate contribution to primary outcome "${top.name}" before endorsing`,
        );
      }

      return {
        ...perspective,
        strategicOutcomeContributions: unique,
        reasoning: [
          ...perspective.reasoning,
          ...unique.map((c) => `Strategic outcomes: ${c}`),
        ].slice(0, 12),
      };
    },
  );

  return {
    ...snapshot,
    executiveCouncil: {
      ...snapshot.executiveCouncil,
      perspectives,
      framing: `${snapshot.executiveCouncil.framing} Each perspective evaluates contribution to strategic outcomes.`,
    },
  };
}
