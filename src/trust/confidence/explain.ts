import type { SnapshotAction } from "@/lib/snapshot/types";
import type {
  ConfidenceBand,
  ConfidenceExplanation,
  EvidenceSource,
} from "@/trust/framework/types";
import { getTrustGovernance } from "@/trust/governance";

function bandFor(score: number): ConfidenceBand {
  const high = getTrustGovernance().minConfidenceForHighBand;
  if (score >= high) return "high";
  if (score >= 50) return "moderate";
  return "low";
}

export function explainConfidence(input: {
  action: SnapshotAction;
  evidence: EvidenceSource[];
}): ConfidenceExplanation {
  const { action, evidence } = input;
  const providers = new Set(evidence.map((e) => e.provider));
  const avgEvidence =
    evidence.reduce((sum, e) => sum + e.confidence, 0) /
    Math.max(evidence.length, 1);

  const base =
    action.strategyConfidence ??
    action.confidence ??
    action.similarityConfidence ??
    Math.round(avgEvidence);

  let score = base;
  const reasonsFor: string[] = [];
  const reasonsAgainst: string[] = [];

  if (providers.size >= 2) {
    score += 6;
    reasonsFor.push("Multiple providers agree on the signal");
  }
  if ((action.previousSituations?.length ?? 0) > 0) {
    score += 5;
    reasonsFor.push("Similar situations previously observed in organisational memory");
  }
  if (evidence.length >= 3) {
    score += 4;
    reasonsFor.push("Strong evidence quality across several sources");
  }
  if (action.supportsOutcome) {
    score += 3;
    reasonsFor.push("Clear strategic outcome alignment");
  }
  if (action.scenarioId) {
    score += 2;
    reasonsFor.push("Mapped to an executive scenario pack");
  }

  if (evidence.length < 2) {
    score -= 8;
    reasonsAgainst.push("Limited historical evidence");
  }
  if (
    evidence.some((e) => e.provider === "system") &&
    evidence.length === 1
  ) {
    score -= 6;
    reasonsAgainst.push("Awaiting richer provider linkage and executive validation");
  }
  if ((action.similarityConfidence ?? 100) < 45) {
    score -= 4;
    reasonsAgainst.push("Weak similarity to prior organisational episodes");
  }
  if (!action.supportsOutcome) {
    reasonsAgainst.push("Strategic outcome linkage is incomplete");
  }

  score = Math.max(15, Math.min(96, Math.round(score)));
  const band = bandFor(score);

  const headline =
    band === "high"
      ? "High confidence — evidence and alignment reinforce this recommendation"
      : band === "moderate"
        ? "Moderate confidence — directionally sound, with room to strengthen evidence"
        : "Lower confidence — treat as a hypothesis until evidence matures";

  if (reasonsFor.length === 0) {
    reasonsFor.push("Derived from Core recommendation rationale");
  }

  return {
    score,
    band,
    headline,
    reasonsFor: reasonsFor.slice(0, 4),
    reasonsAgainst: reasonsAgainst.slice(0, 4),
  };
}
