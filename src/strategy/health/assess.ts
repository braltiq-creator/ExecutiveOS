/**
 * Strategic outcome health assessment.
 */

import { listStrategicOutcomes } from "@/strategy/outcomes";
import { listStrategicInitiatives } from "@/strategy/initiatives";
import type { StrategicOutcomeHealth } from "@/strategy/framework/types";

export type OutcomeHealthCard = {
  outcomeId: string;
  name: string;
  health: StrategicOutcomeHealth;
  confidence: number;
  owner: string;
  initiativeHealthAvg: number;
  explanation: string;
};

export function assessStrategicOutcomeHealth(
  tenantId: string,
): OutcomeHealthCard[] {
  const initiatives = listStrategicInitiatives(tenantId);
  return listStrategicOutcomes(tenantId).map((outcome) => {
    const related = initiatives.filter((i) => i.outcomeId === outcome.id);
    const initiativeHealthAvg =
      related.length === 0
        ? 50
        : Math.round(
            related.reduce((s, i) => s + i.progressPct, 0) / related.length,
          );
    return {
      outcomeId: outcome.id,
      name: outcome.name,
      health: outcome.currentHealth,
      confidence: outcome.confidence,
      owner: outcome.executiveOwner,
      initiativeHealthAvg,
      explanation: `${outcome.name} is ${outcome.currentHealth.replace(/_/g, " ")} with ${related.length} initiative(s), avg progress ${initiativeHealthAvg}%.`,
    };
  });
}
