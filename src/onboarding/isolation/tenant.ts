/**
 * Multi-tenant isolation for discovery — no cross-tenant learning.
 */

import type { DiscoveryItem } from "@/onboarding/types";
import type { KnowledgeGraph } from "@/knowledge-graph";

export type IsolationCheckResult = {
  ok: boolean;
  violations: string[];
};

export function assertDiscoveryTenantIsolation(input: {
  tenantId: string;
  discoveries: DiscoveryItem[];
}): IsolationCheckResult {
  const violations = input.discoveries
    .filter((d) => d.tenantId !== input.tenantId)
    .map((d) => `Discovery ${d.id} belongs to ${d.tenantId}`);
  return { ok: violations.length === 0, violations };
}

export function assertGraphTenantIsolation(input: {
  tenantId: string;
  graph: KnowledgeGraph;
}): IsolationCheckResult {
  const violations: string[] = [];
  for (const entity of input.graph.listEntities()) {
    const entityTenant = entity.properties?.tenantId;
    if (
      entityTenant != null &&
      String(entityTenant) !== input.tenantId
    ) {
      violations.push(`Entity ${entity.id} tenant mismatch`);
    }
  }
  return { ok: violations.length === 0, violations };
}

export function filterDiscoveriesForTenant(
  tenantId: string,
  discoveries: DiscoveryItem[],
): DiscoveryItem[] {
  return discoveries.filter((d) => d.tenantId === tenantId);
}

/** Recommendations never cross tenants. */
export function assertRecommendationIsolation(input: {
  tenantId: string;
  recommendationTenantIds: string[];
}): IsolationCheckResult {
  const violations = input.recommendationTenantIds
    .filter((id) => id !== input.tenantId)
    .map((id) => `Recommendation leaked from tenant ${id}`);
  return { ok: violations.length === 0, violations };
}
