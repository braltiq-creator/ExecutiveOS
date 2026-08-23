/**
 * Strategy governance — tenant isolation for strategic outcomes.
 */

export function assertStrategyPayload(payload: Record<string, unknown>): void {
  const forbidden = [
    "opportunities",
    "jobs",
    "emails",
    "customerNames",
    "crossTenantStrategy",
  ];
  for (const key of forbidden) {
    if (key in payload) {
      throw new Error(
        `Tenant isolation violation: Strategy Framework must not expose "${key}"`,
      );
    }
  }
}

export type StrategyGovernancePolicy = {
  tenantId: string;
  requireOutcomeLinkage: boolean;
  maxActiveOutcomes: number;
  explanation: string;
};

export function getStrategyGovernance(
  tenantId: string,
): StrategyGovernancePolicy {
  return {
    tenantId,
    requireOutcomeLinkage: true,
    maxActiveOutcomes: 7,
    explanation:
      "Recommendations should link to strategic outcomes; strategy is tenant-private.",
  };
}
