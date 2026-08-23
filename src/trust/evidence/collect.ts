import type { SnapshotAction } from "@/lib/snapshot/types";
import type { EvidenceSource } from "@/trust/framework/types";

let evidenceSeq = 0;

function nextId(prefix: string): string {
  evidenceSeq += 1;
  return `${prefix}-${evidenceSeq}`;
}

/**
 * Collect evidence references from already-attached presentation fields.
 * Never invents Core findings — only organises what Today already carries.
 */
export function collectEvidenceForAction(
  action: SnapshotAction,
  asOf: string,
): EvidenceSource[] {
  const sources: EvidenceSource[] = [];

  for (const item of action.evidence ?? []) {
    sources.push({
      id: nextId("ev-scenario"),
      label: item,
      provider: action.scenarioId ? "scenario_pack" : "system",
      timestamp: asOf,
      confidence: action.confidence ?? 55,
      businessEvent: action.businessQuestion,
      detail: action.scenarioName,
    });
  }

  for (const item of action.strategyEvidence ?? []) {
    sources.push({
      id: nextId("ev-strategy"),
      label: item,
      provider: "strategy",
      timestamp: asOf,
      confidence: action.strategyConfidence ?? 60,
      detail: action.supportsOutcome,
    });
  }

  for (const situation of action.previousSituations ?? []) {
    sources.push({
      id: nextId("ev-memory"),
      label: situation,
      provider: "organisational_memory",
      timestamp: asOf,
      confidence: action.similarityConfidence ?? 50,
      memoryEpisodeIds: [],
    });
  }

  if (action.supportsOutcome) {
    sources.push({
      id: nextId("ev-outcome"),
      label: `Strategic outcome: ${action.supportsOutcome}`,
      provider: "outcome_history",
      timestamp: asOf,
      confidence: action.strategyConfidence ?? 58,
      outcomeHistoryIds: action.supportsOutcomeId
        ? [action.supportsOutcomeId]
        : [],
    });
  }

  if (sources.length === 0) {
    sources.push({
      id: nextId("ev-baseline"),
      label: action.why,
      provider: "system",
      timestamp: asOf,
      confidence: action.confidence ?? 45,
      businessEvent: "Presentation synthesis from Core recommendation",
      detail:
        "Baseline evidence from Core recommendation rationale — awaiting richer provider linkage.",
    });
  }

  return sources;
}
