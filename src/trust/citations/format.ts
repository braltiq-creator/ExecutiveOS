import type { Citation, EvidenceSource } from "@/trust/framework/types";

export function citationsFromEvidence(sources: EvidenceSource[]): Citation[] {
  return sources.map((source) => ({
    id: source.id,
    label: source.label,
    provider: source.provider,
    timestamp: source.timestamp,
  }));
}

export function formatCitationLine(citation: Citation): string {
  const when = new Date(citation.timestamp).toLocaleString();
  return `${citation.label} · ${citation.provider} · ${when}`;
}
