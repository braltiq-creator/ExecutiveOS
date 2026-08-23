/**
 * Strategic initiatives linked to outcomes.
 */

import type {
  StrategicInitiativeLink,
  StrategicInitiativeStatus,
} from "@/strategy/framework/types";

const initiatives = new Map<string, StrategicInitiativeLink>();

export function resetStrategicInitiatives(): void {
  initiatives.clear();
}

export function listStrategicInitiatives(
  tenantId: string,
): StrategicInitiativeLink[] {
  return [...initiatives.values()]
    .filter((i) => i.tenantId === tenantId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function linkStrategicInitiative(input: {
  tenantId: string;
  outcomeId: string;
  name: string;
  owner: string;
  status?: StrategicInitiativeStatus;
  progressPct?: number;
  dependencyIds?: string[];
  businessEventIds?: string[];
  recommendationIds?: string[];
  executiveDecisionIds?: string[];
  scenarioIds?: string[];
  businessOutcomeIds?: string[];
  evidence?: string[];
  asOf?: string;
}): StrategicInitiativeLink {
  const asOf = input.asOf ?? new Date().toISOString();
  const id = `sinit-${input.tenantId}-${initiatives.size + 1}`;
  const record: StrategicInitiativeLink = {
    id,
    tenantId: input.tenantId,
    outcomeId: input.outcomeId,
    name: input.name,
    status: input.status ?? "active",
    progressPct: input.progressPct ?? 20,
    owner: input.owner,
    dependencyIds: input.dependencyIds ?? [],
    businessEventIds: input.businessEventIds ?? [],
    recommendationIds: input.recommendationIds ?? [],
    executiveDecisionIds: input.executiveDecisionIds ?? [],
    scenarioIds: input.scenarioIds ?? [],
    businessOutcomeIds: input.businessOutcomeIds ?? [],
    evidence: input.evidence ?? [],
    updatedAt: asOf,
    createdAt: asOf,
  };
  initiatives.set(id, record);
  return record;
}

export function updateStrategicInitiative(input: {
  id: string;
  status?: StrategicInitiativeStatus;
  progressPct?: number;
  recommendationIds?: string[];
  executiveDecisionIds?: string[];
  businessOutcomeIds?: string[];
  evidence?: string[];
}): StrategicInitiativeLink | null {
  const existing = initiatives.get(input.id);
  if (!existing) return null;
  const next: StrategicInitiativeLink = {
    ...existing,
    status: input.status ?? existing.status,
    progressPct: input.progressPct ?? existing.progressPct,
    recommendationIds:
      input.recommendationIds ?? existing.recommendationIds,
    executiveDecisionIds:
      input.executiveDecisionIds ?? existing.executiveDecisionIds,
    businessOutcomeIds:
      input.businessOutcomeIds ?? existing.businessOutcomeIds,
    evidence: input.evidence
      ? [...existing.evidence, ...input.evidence].slice(-20)
      : existing.evidence,
    updatedAt: new Date().toISOString(),
  };
  initiatives.set(next.id, next);
  return next;
}

export function listDriftingInitiatives(
  tenantId: string,
): StrategicInitiativeLink[] {
  return listStrategicInitiatives(tenantId).filter(
    (i) =>
      i.status === "drifting" ||
      i.status === "blocked" ||
      (i.status === "active" && i.progressPct < 25),
  );
}
