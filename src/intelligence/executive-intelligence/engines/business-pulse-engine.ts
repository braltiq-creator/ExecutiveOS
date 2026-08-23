import { assessConfidence } from "@/intelligence/executive-intelligence/engines/confidence-engine";
import { buildReasoningGraph } from "@/intelligence/executive-intelligence/engines/reasoning-graph";
import {
  ensureSentence,
  isOpenDecision,
  isUrgentDecision,
} from "@/intelligence/executive-intelligence/lib/helpers";
import type {
  BusinessState,
  ContributingFactor,
  EnterpriseSignals,
  PulseResult,
} from "@/intelligence/executive-intelligence/types";

const STATE_LABELS: Record<BusinessState, string> = {
  healthy: "Healthy",
  stable: "Stable",
  attention_required: "Attention Required",
  critical: "Critical",
};

/**
 * Business Pulse Engine — interprets business reality.
 * Never averages scores. Weighs momentum, backlog, risk, workload, volatility, confidence.
 */
export function deriveBusinessPulse(signals: EnterpriseSignals): PulseResult {
  const openDecisions = signals.decisions.filter((d) => isOpenDecision(d.status));
  const urgent = openDecisions.filter((d) =>
    isUrgentDecision(d.status, d.deadline),
  );
  const declining = signals.outcomes.filter((o) => o.yesterdayMovement < 0);
  const improving = signals.outcomes.filter((o) => o.yesterdayMovement > 0);
  const offTrack = signals.outcomes.filter((o) => o.status === "off_track");
  const atRisk = signals.outcomes.filter(
    (o) => o.status === "at_risk" || o.status === "off_track",
  );
  const meetings = signals.outcomes.reduce(
    (count, outcome) => count + outcome.meetings.length,
    0,
  );
  const volatility = declining.length + urgent.length + offTrack.length;
  const momentumBalance = improving.length - declining.length;

  const factors: ContributingFactor[] = [
    {
      id: "outcome-momentum",
      label: "Outcome momentum",
      influence:
        momentumBalance > 0
          ? "raises"
          : momentumBalance < 0
            ? "lowers"
            : "stabilises",
      weight: Math.abs(momentumBalance) * 12 + declining.length * 8,
      evidence: `${improving.length} improving / ${declining.length} declining overnight.`,
      relatedIds: [...improving, ...declining].map((o) => o.id),
    },
    {
      id: "decision-backlog",
      label: "Decision backlog",
      influence: urgent.length > 0 ? "lowers" : "stabilises",
      weight: urgent.length * 22 + openDecisions.length * 4,
      evidence: `${urgent.length} urgent of ${openDecisions.length} open Decisions.`,
      relatedIds: urgent.map((d) => d.id),
    },
    {
      id: "strategic-risk",
      label: "Strategic risk",
      influence: atRisk.length > 0 ? "lowers" : "stabilises",
      weight: atRisk.length * 16 + offTrack.length * 10,
      evidence: `${atRisk.length} Outcomes at risk or off track.`,
      relatedIds: atRisk.map((o) => o.id),
    },
    {
      id: "executive-workload",
      label: "Executive workload",
      influence: meetings >= 3 || openDecisions.length >= 3 ? "lowers" : "stabilises",
      weight: meetings * 6 + openDecisions.length * 5,
      evidence: `${meetings} meetings and ${openDecisions.length} open Decisions compete for attention.`,
    },
    {
      id: "business-volatility",
      label: "Business volatility",
      influence: volatility >= 3 ? "lowers" : "stabilises",
      weight: volatility * 10,
      evidence: `Volatility index ${volatility} from overnight movement and judgement debt.`,
    },
  ];

  const pressure =
    urgent.length * 28 +
    offTrack.length * 22 +
    declining.length * 14 +
    atRisk.length * 8 +
    (meetings >= 4 ? 12 : 0) -
    (momentumBalance > 0 ? 10 : 0) -
    (signals.overallScore >= 75 ? 8 : 0);

  let state: BusinessState = "stable";
  if (pressure >= 55 || urgent.length >= 2 || offTrack.length >= 2) {
    state = "critical";
  } else if (pressure >= 28 || urgent.length >= 1 || declining.length >= 2) {
    state = "attention_required";
  } else if (
    momentumBalance > 0 &&
    signals.overallScore >= 70 &&
    urgent.length === 0
  ) {
    state = "healthy";
  } else if (momentumBalance > 0 && declining.length === 0) {
    state = "healthy";
  }

  // Presentation alias: healthy → improving language for UI continuity
  const presentationState = state;

  const confidence = assessConfidence({
    label: "Business Pulse",
    dataCompleteness: clampCompleteness(signals),
    freshnessHours: 6,
    sourceAgreement: Math.round(
      signals.outcomes.reduce((s, o) => s + o.confidence, 0) /
        Math.max(1, signals.outcomes.length),
    ),
    historicalReliability: 72,
    predictionCertainty: 64,
    aiReasoningConfidence: 70,
  });

  const narrative = buildPulseNarrative(signals, presentationState);
  const reasoning = ensureSentence(
    `Pulse is ${STATE_LABELS[presentationState]} because pressure=${Math.round(pressure)} from decision backlog, outcome momentum, strategic risk, workload, and volatility — not from averaging health scores.`,
  );

  const graph = buildReasoningGraph({
    id: "pulse",
    question: "What is the business state right now?",
    whatChanged: [
      ...declining.map(
        (o) => `${o.name} moved ${o.yesterdayMovementLabel.toLowerCase()}.`,
      ),
      ...urgent.map((d) => `${d.question.slice(0, 48)}… requires judgement.`),
    ].slice(0, 4),
    evidence: factors.map((factor) => ({
      id: factor.id,
      kind: "judgement" as const,
      label: factor.label,
      detail: factor.evidence,
      system: "Business Pulse Engine",
    })),
    systems: ["Outcome Engine", "Decision Engine", "Calendar", "Overnight Signal Bus"],
    summary: narrative,
  });

  return {
    state: presentationState,
    label: STATE_LABELS[presentationState],
    confidence,
    reasoning,
    contributingFactors: factors,
    narrative,
    reasoningGraph: graph,
  };
}

function clampCompleteness(signals: EnterpriseSignals): number {
  return Math.min(
    96,
    48 + signals.outcomes.length * 10 + signals.decisions.length * 6,
  );
}

function buildPulseNarrative(
  signals: EnterpriseSignals,
  state: BusinessState,
): string {
  const helix = signals.decisions.find((d) => d.id === "decision-residency");

  if (signals.executiveName === "Alex") {
    if (helix?.status === "approved") {
      return "Helix judgement is recorded — the business is shifting from decision pressure to execution risk.";
    }
    if (helix?.status === "decided") {
      return "The harder Helix path is set — conversion and board disclosure now absorb leadership attention.";
    }
    if (helix?.status === "deferred") {
      return `Helix is deferred to ${helix.deadline} — ARR drift continues until that review.`;
    }
    if (state === "critical" || state === "attention_required") {
      return "Helix residency remains open while enterprise ARR and meeting load both moved against you overnight.";
    }
    if (state === "healthy") {
      return "Overnight movement favoured Focus Outcomes — leadership attention can stay selective.";
    }
    return "No overnight cascade — the portfolio is holding without demanding a morning reset.";
  }

  if (state === "critical") {
    return "Multiple Outcomes and Decisions moved overnight into judgement territory.";
  }
  if (state === "attention_required") {
    return "A Focus Decision and related Outcome movement require deliberate attention today.";
  }
  if (state === "healthy") {
    return "Portfolio momentum improved overnight without introducing new judgement debt.";
  }
  return "Overnight change stayed within normal operating bounds.";
}
