/**
 * Significant executive decision history.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type {
  MemoryDecisionRecord,
  SignificantDecisionKind,
} from "@/memory/framework/types";

const decisions = new Map<string, MemoryDecisionRecord>();

export function resetMemoryDecisions(): void {
  decisions.clear();
}

export function listMemoryDecisions(
  tenantId: string,
): MemoryDecisionRecord[] {
  return [...decisions.values()]
    .filter((d) => d.tenantId === tenantId)
    .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));
}

export function getMemoryDecision(
  id: string,
): MemoryDecisionRecord | undefined {
  return decisions.get(id);
}

export function recordMemoryDecision(input: {
  tenantId: string;
  kind: SignificantDecisionKind;
  title: string;
  profileId: IntelligenceProfileId;
  summary: string;
  decidedBy: string;
  scenarioId?: string | null;
  recommendationId?: string | null;
  outcomeId?: string | null;
  episodeId?: string | null;
  businessEvidence?: string[];
  decidedAt?: string;
}): MemoryDecisionRecord {
  const record: MemoryDecisionRecord = {
    id: `mdec-${input.tenantId}-${decisions.size + 1}`,
    tenantId: input.tenantId,
    kind: input.kind,
    title: input.title,
    profileId: input.profileId,
    scenarioId: input.scenarioId ?? null,
    recommendationId: input.recommendationId ?? null,
    outcomeId: input.outcomeId ?? null,
    episodeId: input.episodeId ?? null,
    businessEvidence: input.businessEvidence ?? [],
    decidedAt: input.decidedAt ?? new Date().toISOString(),
    decidedBy: input.decidedBy,
    summary: input.summary,
  };
  decisions.set(record.id, record);
  return record;
}
