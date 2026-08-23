import { deriveDecisionQueue } from "@/lib/decisions/derive";
import type {
  AttentionBand,
  AttentionTallyItem,
  ExecutiveReadiness,
  LeadJudgementModel,
} from "@/lib/briefing/lead-judgement-types";
import {
  ATTENTION_BAND_LABELS,
  READINESS_LABELS,
} from "@/lib/briefing/lead-judgement-types";
import type { Outcome, OutcomePortfolio } from "@/lib/outcomes/types";

function pickLeadOutcome(portfolio: OutcomePortfolio): Outcome {
  const ranked = [...portfolio.outcomes].sort((left, right) => {
    const statusRank = {
      off_track: 0,
      at_risk: 1,
      watching: 2,
      on_track: 3,
    } as const;
    const statusDiff = statusRank[left.status] - statusRank[right.status];
    if (statusDiff !== 0) return statusDiff;
    return left.healthScore - right.healthScore;
  });
  return ranked[0] ?? portfolio.outcomes[0];
}

function countPhrase(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Institutional Chief of Staff summary for the Northline mock morning.
 * Hand-authored — not generated filler.
 */
function northlineExecutiveSummary(): string {
  return [
    "Enterprise conversion risk has increased after two delayed procurement decisions.",
    "Leadership meeting load remains high and is affecting strategic work.",
    "No major customer escalations overnight.",
    "Your attention should focus on Helix, Board Preparation, and protecting focus time for FY27 planning.",
  ].join(" ");
}

function northlinePostHelixSummary(): string {
  return [
    "Helix residency is recorded — the preferred path is set and commercial motion can resume.",
    "Enterprise ARR health has started to recover; Board risk language can now be finished from the written posture.",
    "Your attention shifts to locking the security workshop and protecting focus time for FY27 planning.",
    "No major customer escalations overnight.",
  ].join(" ");
}

function helixResidencyStatus(portfolio: OutcomePortfolio): string | null {
  return (
    portfolio.decisions.find((decision) => decision.id === "decision-residency")
      ?.status ?? null
  );
}

function deriveAttentionBand(input: {
  decisionsDueToday: number;
  criticalSignals: number;
  atRiskOutcomes: number;
}): AttentionBand {
  if (input.criticalSignals > 0 || input.decisionsDueToday >= 2) {
    return "critical";
  }
  if (input.decisionsDueToday >= 1 || input.atRiskOutcomes >= 1) {
    return "strategic";
  }
  return "routine";
}

function deriveReadiness(input: {
  attentionBand: AttentionBand;
  decisionsDueToday: number;
  atRiskOutcomes: number;
}): { readiness: ExecutiveReadiness; why: string } {
  if (
    input.attentionBand === "critical" ||
    input.decisionsDueToday >= 2
  ) {
    return {
      readiness: "high_attention",
      why: "More than one consequential call sits on today’s path. Clear Helix before the calendar compounds the cost of delay.",
    };
  }
  if (input.decisionsDueToday === 1 || input.atRiskOutcomes >= 2) {
    return {
      readiness: "watch_closely",
      why: "The portfolio is workable, but one Decision and related Outcome movement need a deliberate morning pass.",
    };
  }
  if (input.atRiskOutcomes === 1) {
    return {
      readiness: "stable",
      why: "No cascade overnight. One Outcome needs watching; the rest can hold without you.",
    };
  }
  return {
    readiness: "ready",
    why: "Nothing overnight changed the mandate. A short scan is enough to confirm focus.",
  };
}

function estimateReviewMinutes(input: {
  decisionsDueToday: number;
  attentionBand: AttentionBand;
  tallyCount: number;
}): number {
  let minutes = 5;
  minutes += input.decisionsDueToday * 3;
  if (input.attentionBand === "critical") minutes += 4;
  if (input.attentionBand === "strategic") minutes += 2;
  minutes += Math.max(0, input.tallyCount - 2);
  return Math.min(18, Math.max(5, minutes));
}

/**
 * Derive Lead Judgement from the Outcome portfolio (SoT).
 * Prefer crafted CoS language for the canonical mock; fall back safely.
 */
export function deriveLeadJudgement(
  portfolio: OutcomePortfolio,
): LeadJudgementModel {
  const lead = pickLeadOutcome(portfolio);
  const decisionQueue = deriveDecisionQueue(portfolio);
  const decisionsDueToday = decisionQueue.filter(
    (item) =>
      item.status === "due_today" ||
      item.deadline.toLowerCase().includes("today"),
  ).length;

  const atRiskOutcomes = portfolio.outcomes.filter(
    (outcome) =>
      outcome.status === "at_risk" || outcome.status === "off_track",
  ).length;

  const criticalSignals = portfolio.outcomes.reduce(
    (count, outcome) =>
      count +
      outcome.overnightSignals.filter((signal) => signal.severity === "critical")
        .length,
    0,
  );

  const strategicOpportunities = Math.min(
    2,
    portfolio.outcomes.filter(
      (outcome) =>
        outcome.status === "at_risk" ||
        outcome.id === "outcome-board" ||
        outcome.id === "outcome-efficiency",
    ).length,
  );

  const operationalRisks = portfolio.outcomes.reduce(
    (count, outcome) =>
      count +
      outcome.overnightSignals.filter(
        (signal) =>
          signal.severity === "critical" &&
          signal.whatChanged.toLowerCase().includes("escalat"),
      ).length,
    0,
  );

  const attentionTally: AttentionTallyItem[] = [];

  if (decisionsDueToday > 0) {
    attentionTally.push({
      id: "tally-decisions",
      kind: "urgent_decision",
      label: countPhrase(
        decisionsDueToday,
        "urgent decision",
        "urgent decisions",
      ),
    });
  }

  if (strategicOpportunities > 0) {
    attentionTally.push({
      id: "tally-strategic",
      kind: "strategic_opportunity",
      label: countPhrase(
        strategicOpportunities,
        "strategic opportunity",
        "strategic opportunities",
      ),
    });
  }

  if (operationalRisks === 0) {
    attentionTally.push({
      id: "tally-ops-clear",
      kind: "clear",
      label: "No critical operational risks",
    });
  } else {
    attentionTally.push({
      id: "tally-ops",
      kind: "operational_risk",
      label: countPhrase(
        operationalRisks,
        "critical operational risk",
        "critical operational risks",
      ),
    });
  }

  const attentionBand = deriveAttentionBand({
    decisionsDueToday,
    criticalSignals,
    atRiskOutcomes,
  });

  const { readiness, why: readinessWhy } = deriveReadiness({
    attentionBand,
    decisionsDueToday,
    atRiskOutcomes,
  });

  const reviewMinutes = estimateReviewMinutes({
    decisionsDueToday,
    attentionBand,
    tallyCount: attentionTally.length,
  });

  const isNorthlineMorning =
    lead.id === "outcome-enterprise-arr" ||
    portfolio.executiveName === "Alex";

  const helixStatus = helixResidencyStatus(portfolio);
  const helixResolved =
    helixStatus === "approved" || helixStatus === "decided";
  const helixApproved = helixStatus === "approved";
  const helixRejected = helixStatus === "decided";

  const framingLine =
    helixApproved
      ? "Today moves from Helix judgement to execution."
      : helixRejected
        ? "Today absorbs the harder Helix path you chose."
      : attentionTally.length >= 3
      ? "Today requires judgement in three areas."
      : attentionTally.length === 2
        ? "Today requires judgement in two areas."
        : "Today requires a focused pass.";

  const focusAreas =
    helixApproved && isNorthlineMorning
      ? ["Helix workshop", "Board Preparation", "FY27 Planning"]
      : isNorthlineMorning
        ? ["Helix", "Board Preparation", "FY27 Planning"]
        : [
            lead.name,
            ...portfolio.outcomes
              .filter((outcome) => outcome.id !== lead.id)
              .slice(0, 2)
              .map((outcome) => outcome.name.split(" ").slice(0, 2).join(" ")),
          ];

  const whatRequiresAttention =
    helixApproved && isNorthlineMorning
      ? "Converting the Helix Decision into a locked workshop and finished board language"
      : helixRejected && isNorthlineMorning
        ? "Rebuilding the Helix commercial timeline after rejecting the preferred path"
        : isNorthlineMorning
          ? "Helix residency and the cost of delay on enterprise ARR"
          : lead.name;

  const whyItMatters =
    helixApproved && isNorthlineMorning
      ? "The Decision is written; ARR recovery now depends on workshop lock and board language catching up."
      : helixRejected && isNorthlineMorning
        ? "Full regional deploy is now the path — forecast and board disclosure must match that reality."
        : isNorthlineMorning
          ? "Without a written posture today, Helix’s procurement window slips and board risk language stays incomplete."
          : lead.expectedTrajectory.summary;

  const canWait = isNorthlineMorning
    ? helixResolved
      ? "Retention experiments and non-Focus pipeline noise can wait while workshop lock and board language finish."
      : "Retention experiments, non-Focus pipeline noise, and routine meeting prep can wait until Helix and board language are settled."
    : "Non-Focus Outcomes and routine calendar prep can wait until the lead call is clear.";

  const attentionBandWhy =
    attentionBand === "critical"
      ? "Urgency is real and explained — a Decision due today sits on a moving Outcome."
      : attentionBand === "strategic"
        ? "The day is about consequential judgement, not firefighting. Protect focus for the few calls that bind Outcomes."
        : "The morning is light. Confirm Intent, scan health, and leave capacity for deep work.";

  return {
    greeting: `Good morning, ${portfolio.executiveName}`,
    framingLine,
    attentionTally,
    canWait,
    executiveSummary:
      helixApproved && isNorthlineMorning
        ? northlinePostHelixSummary()
        : helixRejected && isNorthlineMorning
          ? [
              "You rejected the preferred Helix residency path.",
              lead.expectedTrajectory.summary,
              "Board disclosure and commercial timeline must be rebuilt for full regional deploy.",
              `Focus on ${focusAreas.join(", ")}.`,
            ].join(" ")
          : isNorthlineMorning
            ? northlineExecutiveSummary()
            : [
                `${lead.yesterdayMovementLabel}.`,
                lead.expectedTrajectory.summary,
                canWait,
                `Focus on ${focusAreas.join(", ")}.`,
              ].join(" "),
    focusAreas,
    attentionBand,
    attentionBandLabel: ATTENTION_BAND_LABELS[attentionBand],
    attentionBandWhy,
    readiness,
    readinessLabel: READINESS_LABELS[readiness],
    readinessWhy,
    reviewMinutes,
    asOf: portfolio.refreshedAt,
    primaryOutcomeId: lead.id,
    whatRequiresAttention,
    whyItMatters,
  };
}

/** Re-export type for convenience. */
export type { LeadJudgementModel };
