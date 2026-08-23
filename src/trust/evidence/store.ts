import type { EvidenceSource } from "@/trust/framework/types";

const evidenceByExplanation = new Map<string, EvidenceSource[]>();

export function resetTrustEvidence(): void {
  evidenceByExplanation.clear();
}

export function setExplanationEvidence(
  explanationId: string,
  sources: EvidenceSource[],
): void {
  evidenceByExplanation.set(explanationId, sources);
}

export function listExplanationEvidence(
  explanationId: string,
): EvidenceSource[] {
  return [...(evidenceByExplanation.get(explanationId) ?? [])];
}
