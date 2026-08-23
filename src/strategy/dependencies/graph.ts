/**
 * Outcome dependency graph (within tenant).
 */

import { listStrategicOutcomes, getStrategicOutcome } from "@/strategy/outcomes";

export type OutcomeDependencyEdge = {
  fromOutcomeId: string;
  toOutcomeId: string;
  kind: "depends_on" | "enables" | "conflicts";
};

export function listOutcomeDependencies(
  tenantId: string,
): OutcomeDependencyEdge[] {
  const edges: OutcomeDependencyEdge[] = [];
  for (const outcome of listStrategicOutcomes(tenantId)) {
    for (const depId of outcome.dependencyIds) {
      if (!getStrategicOutcome(depId)) continue;
      edges.push({
        fromOutcomeId: outcome.id,
        toOutcomeId: depId,
        kind: "depends_on",
      });
    }
  }
  return edges;
}

export function linkOutcomeDependency(input: {
  outcomeId: string;
  dependsOnOutcomeId: string;
}): boolean {
  const outcome = getStrategicOutcome(input.outcomeId);
  const dep = getStrategicOutcome(input.dependsOnOutcomeId);
  if (!outcome || !dep || outcome.tenantId !== dep.tenantId) return false;
  if (outcome.dependencyIds.includes(input.dependsOnOutcomeId)) return true;
  outcome.dependencyIds = [...outcome.dependencyIds, input.dependsOnOutcomeId];
  return true;
}
