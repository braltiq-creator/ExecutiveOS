/**
 * Memory governance — retention, access scope, anonymised portfolio telemetry.
 */

import { listEpisodes } from "@/memory/episodes";
import { listMemoryPatterns, detectMemoryPatterns } from "@/memory/patterns";
import { measureMemoryGrowth } from "@/memory/insights";
import { anonymiseMemoryTelemetry } from "@/memory/framework/isolation";
import type { AnonymisedMemoryTelemetry } from "@/memory/framework/types";

export type MemoryGovernancePolicy = {
  tenantId: string;
  retentionDays: number;
  allowExecutiveExport: boolean;
  allowCrossWorkspaceShare: boolean;
  explanation: string;
};

const policies = new Map<string, MemoryGovernancePolicy>();

export function resetMemoryGovernance(): void {
  policies.clear();
}

export function getMemoryGovernance(
  tenantId: string,
): MemoryGovernancePolicy {
  return (
    policies.get(tenantId) ?? {
      tenantId,
      retentionDays: 1825,
      allowExecutiveExport: true,
      allowCrossWorkspaceShare: false,
      explanation:
        "Default governance: memory is tenant-private; cross-customer sharing is forbidden.",
    }
  );
}

export function setMemoryGovernance(
  policy: MemoryGovernancePolicy,
): MemoryGovernancePolicy {
  policies.set(policy.tenantId, {
    ...policy,
    allowCrossWorkspaceShare: false, // never allow cross-tenant
  });
  return getMemoryGovernance(policy.tenantId);
}

export function buildAnonymisedMemoryPortfolio(input: {
  tenantIds: string[];
  asOf?: string;
}): AnonymisedMemoryTelemetry {
  const asOf = input.asOf ?? new Date().toISOString();
  const episodeCounts: number[] = [];
  const recallQualities: number[] = [];
  const patternCounts: number[] = [];

  for (const tenantId of input.tenantIds) {
    detectMemoryPatterns(tenantId);
    episodeCounts.push(listEpisodes(tenantId).length);
    patternCounts.push(listMemoryPatterns(tenantId).length);
    recallQualities.push(measureMemoryGrowth(tenantId, asOf).recallQuality);
  }

  return anonymiseMemoryTelemetry({
    asOf,
    episodeCounts,
    recallQualities,
    patternCounts,
  });
}
