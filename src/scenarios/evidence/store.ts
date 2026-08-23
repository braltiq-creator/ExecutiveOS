/**
 * Scenario evidence store — operational metadata, not cross-tenant business data.
 */

import type { ScenarioEvidenceRecord, ScenarioEvidenceSource } from "@/scenarios/framework/types";

const evidence = new Map<string, ScenarioEvidenceRecord>();

export function resetScenarioEvidence(): void {
  evidence.clear();
}

export function recordScenarioEvidence(input: {
  tenantId: string;
  scenarioId: string;
  label: string;
  source: ScenarioEvidenceSource;
  quality: number;
  asOf?: string;
}): ScenarioEvidenceRecord {
  const record: ScenarioEvidenceRecord = {
    id: `sev-${input.tenantId}-${evidence.size + 1}`,
    tenantId: input.tenantId,
    scenarioId: input.scenarioId,
    label: input.label,
    source: input.source,
    quality: Math.max(0, Math.min(100, Math.round(input.quality))),
    recordedAt: input.asOf ?? new Date().toISOString(),
  };
  evidence.set(record.id, record);
  return record;
}

export function listEvidenceForScenario(
  tenantId: string,
  scenarioId: string,
): ScenarioEvidenceRecord[] {
  return [...evidence.values()].filter(
    (e) => e.tenantId === tenantId && e.scenarioId === scenarioId,
  );
}

export function listEvidenceForTenant(
  tenantId: string,
): ScenarioEvidenceRecord[] {
  return [...evidence.values()].filter((e) => e.tenantId === tenantId);
}
