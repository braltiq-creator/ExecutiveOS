/**
 * Executive Agency — proactive monitoring, observation, collaboration.
 * Presentation-only. Council acts without waiting to be asked.
 */

import type { Decision } from "@/lib/decisions/engine-types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import type { LoopImpactRecord } from "@/experience/executive-loop/types";
import {
  EXECUTIVE_COUNCIL,
  type CouncilMemberDefinition,
  type CouncilRoleId,
} from "@/experience/executive-council/members";
import type {
  AgencyConsensus,
  CollaborationStance,
  CouncilCollaboration,
  CouncilDiscussionLearning,
  CouncilObservation,
  ExecutiveAgencyView,
  ObservationUrgency,
} from "@/experience/executive-council/types";
import type { CouncilConsensus } from "@/experience/executive-council/types";
import { resolveFocusOutcome } from "@/experience/outcomes-engine/derive";

function briefText(text: string, maxWords = 16): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const clause = cleaned.split(/(?<=[.!?])\s+|;\s+|—\s+/)[0] || cleaned;
  const words = clause.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return clause.replace(/[.!?]+$/, "");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function urgencyLabel(u: ObservationUrgency): string {
  if (u === "today") return "Today";
  if (u === "this_week") return "This week";
  return "Watch";
}

function stanceLabel(s: CollaborationStance): string {
  switch (s) {
    case "agree":
      return "Agree";
    case "disagree":
      return "Disagree";
    case "support":
      return "Support";
    case "challenge":
      return "Challenge";
    case "extend":
      return "Extend";
    case "refine":
      return "Refine";
  }
}

function decisionHref(decision: Decision | null, snapshot: ExecutiveSnapshot): string {
  if (decision) return `/decisions/${decision.id}`;
  const pd = snapshot.priorityDecisions[0];
  return pd?.href || "/decisions?from=priority";
}

function discussionHref(observationId: string): string {
  return `/decisions?from=priority&obs=${encodeURIComponent(observationId)}#council-discussion`;
}

/** Produce at most one meaningful observation per executive when signals warrant it. */
function observeForMember(input: {
  member: CouncilMemberDefinition;
  snapshot: ExecutiveSnapshot;
  outcome: StrategicOutcome | null;
  decision: Decision | null;
}): CouncilObservation | null {
  const { member, snapshot, outcome, decision } = input;
  const domain = member.monitoringDomains[0] || member.role;
  const outcomeName = outcome?.name || "Organisation Health";
  const outcomeId = outcome?.id ?? null;
  const decisionTitle =
    decision?.question ||
    snapshot.priorityDecisions[0]?.title ||
    "Priority judgement";
  const href = decisionHref(decision, snapshot);
  const baseConf = decision?.confidence ?? snapshot.pulse.confidence;

  const mk = (
    partial: Omit<
      CouncilObservation,
      | "id"
      | "roleId"
      | "raisedBy"
      | "linkedOutcome"
      | "linkedOutcomeId"
      | "linkedDecision"
      | "linkedDecisionHref"
      | "discussionHref"
      | "urgencyLabel"
    > & { urgency: ObservationUrgency },
  ): CouncilObservation => ({
    id: `obs-${member.id}`,
    roleId: member.id,
    raisedBy: member.shortTitle,
    linkedOutcome: outcomeName,
    linkedOutcomeId: outcomeId,
    linkedDecision: briefText(decisionTitle, 10),
    linkedDecisionHref: href,
    discussionHref: discussionHref(`obs-${member.id}`),
    urgencyLabel: urgencyLabel(partial.urgency),
    ...partial,
  });

  switch (member.lens) {
    case "enterprise": {
      if (
        snapshot.pulse.level !== "attention" &&
        snapshot.pulse.level !== "critical" &&
        snapshot.executiveState.capacity === "available"
      ) {
        return null;
      }
      return mk({
        headline: briefText(
          `Enterprise attention required on ${outcomeName}`,
          12,
        ),
        reasoning: briefText(
          `Monitoring ${domain}: organisational performance and capacity (${snapshot.executiveState.capacity}) show drift that needs CEO sequencing.`,
          22,
        ),
        businessImpact: briefText(
          decision?.businessImpact ||
            snapshot.priorityDecisions[0]?.businessImpact ||
            "Organisation Health trajectory at stake",
          12,
        ),
        confidence: clamp(baseConf + 2),
        urgency:
          snapshot.pulse.level === "critical" ? "today" : "this_week",
        recommendedNextStep: briefText(
          "Open Council discussion and decide sequencing today",
          12,
        ),
        rankScore: clamp(88 + (snapshot.pulse.level === "critical" ? 8 : 0)),
      });
    }
    case "capital": {
      const delay = decision?.costOfDelay || "Cost of delay is material";
      if (baseConf >= 80 && snapshot.pulse.level === "improving") return null;
      return mk({
        headline: briefText(`Capital case needs sharper economics`, 10),
        reasoning: briefText(
          `Monitoring forecasts and capital allocation: ${delay}. Value at stake must be priced before binding.`,
          22,
        ),
        businessImpact: briefText(
          snapshot.recommendedActions[0]?.expectedImpact || delay,
          12,
        ),
        confidence: clamp(baseConf - 4),
        urgency: "this_week",
        recommendedNextStep: briefText(
          "Challenge the value case in Council before approval",
          12,
        ),
        rankScore: clamp(76 + (baseConf < 65 ? 10 : 0)),
      });
    }
    case "operations": {
      if (snapshot.executiveState.capacity === "available") return null;
      return mk({
        headline: briefText(
          `Execution capacity is ${snapshot.executiveState.capacity}`,
          10,
        ),
        reasoning: briefText(
          `Monitoring delivery and capacity: operations cannot absorb another unbound commitment without slip risk.`,
          22,
        ),
        businessImpact: briefText(
          "Delivery reliability and leadership bandwidth",
          10,
        ),
        confidence: clamp(baseConf - 2),
        urgency:
          snapshot.executiveState.capacity === "overdrawn"
            ? "today"
            : "this_week",
        recommendedNextStep: briefText(
          "Name an execution owner before any approval",
          10,
        ),
        rankScore: clamp(
          80 +
            (snapshot.executiveState.capacity === "overdrawn" ? 12 : 4),
        ),
      });
    }
    case "revenue": {
      const risk = snapshot.recommendedActions.find((a) => a.potentialRisk);
      const atRisk =
        outcome?.currentHealth === "at_risk" ||
        outcome?.currentHealth === "off_track";
      if (!atRisk && !risk && snapshot.pulse.level === "improving") return null;
      return mk({
        headline: briefText(
          atRisk
            ? `Commercial pressure on ${outcomeName}`
            : risk?.potentialRisk || "Revenue momentum needs protection",
          12,
        ),
        reasoning: briefText(
          `Monitoring pipeline and growth: customer expansion signals require a commercial call linked to ${outcomeName}.`,
          22,
        ),
        businessImpact: briefText(
          risk?.expectedImpact ||
            decision?.expectedOutcomeImpact ||
            "Quarterly revenue trajectory",
          12,
        ),
        confidence: clamp(baseConf + 3),
        urgency: atRisk || risk ? "today" : "this_week",
        recommendedNextStep: briefText(
          "Bring the commercial decision to Council judgement",
          10,
        ),
        rankScore: clamp(84 + (atRisk ? 8 : 0)),
      });
    }
    case "strategy": {
      if (
        !outcome ||
        (outcome.currentHealth !== "at_risk" &&
          outcome.currentHealth !== "off_track" &&
          outcome.currentHealth !== "watching")
      ) {
        return null;
      }
      return mk({
        headline: briefText(
          `Strategic drift on ${outcomeName}`,
          10,
        ),
        reasoning: briefText(
          `Monitoring strategic outcomes and transformation: ${outcomeName} is ${outcome.currentHealth.replace(/_/g, " ")} — local optimisation risks diluting the portfolio.`,
          24,
        ),
        businessImpact: briefText(outcome.description || outcomeName, 12),
        confidence: clamp(outcome.confidence),
        urgency:
          outcome.currentHealth === "off_track" ? "today" : "this_week",
        recommendedNextStep: briefText(
          "Align the pending decision explicitly to this outcome",
          12,
        ),
        rankScore: clamp(
          82 + (outcome.currentHealth === "off_track" ? 10 : 4),
        ),
      });
    }
  }
}

const RESPONSE_MATRIX: Array<{
  from: CouncilRoleId;
  to: CouncilRoleId;
  stance: CollaborationStance;
  note: (obs: CouncilObservation) => string;
}> = [
  {
    from: "cfo",
    to: "cro",
    stance: "challenge",
    note: (o) =>
      briefText(
        `Challenge: price the commercial upside before we commit — impact "${o.businessImpact}" still soft.`,
        18,
      ),
  },
  {
    from: "coo",
    to: "ceo",
    stance: "refine",
    note: (o) =>
      briefText(
        `Refine: sequence after capacity is named — ${o.recommendedNextStep}`,
        16,
      ),
  },
  {
    from: "cso",
    to: "cro",
    stance: "extend",
    note: (o) =>
      briefText(
        `Extend: keep ${o.linkedOutcome} as the success test, not a local pipeline metric.`,
        16,
      ),
  },
  {
    from: "ceo",
    to: "cfo",
    stance: "support",
    note: () =>
      briefText(
        "Support: capital discipline stands — we will not approve without a clear value case.",
        16,
      ),
  },
  {
    from: "cro",
    to: "cso",
    stance: "agree",
    note: (o) =>
      briefText(
        `Agree: commercial urgency and ${o.linkedOutcome} are the same fight this week.`,
        16,
      ),
  },
  {
    from: "coo",
    to: "cfo",
    stance: "disagree",
    note: () =>
      briefText(
        "Disagree on timing only: deferring further burns operational window, not just capital.",
        16,
      ),
  },
];

export function buildCouncilObservations(input: {
  snapshot: ExecutiveSnapshot;
  strategicOutcomes: StrategicOutcome[];
  decisions?: Decision[];
  selectedDecisionId?: string | null;
  outcomeId?: string | null;
}): CouncilObservation[] {
  const decisions = input.decisions ?? [];
  const decision =
    decisions.find((d) => d.id === input.selectedDecisionId) ??
    decisions[0] ??
    null;
  const outcome = resolveFocusOutcome({
    outcomes: input.strategicOutcomes,
    snapshot: input.snapshot,
    outcomeId: input.outcomeId,
    decisions,
  });

  return EXECUTIVE_COUNCIL.map((member) =>
    observeForMember({
      member,
      snapshot: input.snapshot,
      outcome,
      decision,
    }),
  )
    .filter((o): o is CouncilObservation => Boolean(o))
    .sort((a, b) => b.rankScore - a.rankScore);
}

export function buildCouncilCollaborations(
  observations: CouncilObservation[],
): CouncilCollaboration[] {
  if (observations.length === 0) return [];
  const byRole = new Map(observations.map((o) => [o.roleId, o]));
  const items: CouncilCollaboration[] = [];

  for (const rule of RESPONSE_MATRIX) {
    const targetObs = byRole.get(rule.to) ?? observations[0]!;
    items.push({
      id: `collab-${rule.from}-${rule.to}-${targetObs.id}`,
      fromRoleId: rule.from,
      fromShortTitle: rule.from.toUpperCase(),
      toRoleId: rule.to,
      toShortTitle: rule.to.toUpperCase(),
      stance: rule.stance,
      stanceLabel: stanceLabel(rule.stance),
      note: rule.note(targetObs),
      observationId: targetObs.id,
    });
  }

  // Fix short titles to proper case from council
  return items.map((c) => ({
    ...c,
    fromShortTitle:
      EXECUTIVE_COUNCIL.find((m) => m.id === c.fromRoleId)?.shortTitle ||
      c.fromShortTitle,
    toShortTitle:
      EXECUTIVE_COUNCIL.find((m) => m.id === c.toRoleId)?.shortTitle ||
      c.toShortTitle,
  })).slice(0, 6);
}

export function buildAgencyConsensus(input: {
  observations: CouncilObservation[];
  collaborations: CouncilCollaboration[];
  councilConsensus: CouncilConsensus;
}): AgencyConsensus {
  const { observations, collaborations, councilConsensus } = input;
  const challenges = collaborations.filter(
    (c) => c.stance === "challenge" || c.stance === "disagree",
  );
  const supports = collaborations.filter(
    (c) =>
      c.stance === "agree" ||
      c.stance === "support" ||
      c.stance === "extend" ||
      c.stance === "refine",
  );

  return {
    consensus: briefText(councilConsensus.recommendation, 20),
    agreementAreas:
      supports.length > 0
        ? supports.slice(0, 3).map((c) => briefText(`${c.fromShortTitle}: ${c.note}`, 14))
        : councilConsensus.consensusAreas,
    disagreementAreas:
      challenges.length > 0
        ? challenges.slice(0, 3).map((c) => briefText(`${c.fromShortTitle}: ${c.note}`, 14))
        : councilConsensus.disagreementAreas,
    tradeOffs: councilConsensus.tradeOffs,
    remainingUncertainty: briefText(
      observations[0]
        ? `Highest open question: ${observations[0].reasoning}`
        : "Uncertainty concentrates on timing and capacity ownership",
      20,
    ),
    recommendedJudgement: councilConsensus.recommendedDecision,
    confidence: councilConsensus.confidence,
  };
}

export function buildDiscussionLearning(input: {
  observations: CouncilObservation[];
  collaborations: CouncilCollaboration[];
  agencyConsensus: AgencyConsensus;
  loopImpact?: LoopImpactRecord | null;
}): CouncilDiscussionLearning | null {
  const { observations, collaborations, agencyConsensus, loopImpact } = input;
  if (!loopImpact && observations.length === 0) return null;

  const adj = loopImpact
    ? loopImpact.confidenceAfter - loopImpact.confidenceBefore
    : 0;

  return {
    initialObservations: observations
      .slice(0, 4)
      .map((o) => `${o.raisedBy}: ${o.headline}`),
    discussion: collaborations
      .slice(0, 5)
      .map((c) => `${c.fromShortTitle} → ${c.toShortTitle} (${c.stanceLabel}): ${c.note}`),
    finalRecommendation: agencyConsensus.recommendedJudgement,
    decisionTaken: loopImpact
      ? `${loopImpact.decisionTitle} approved`
      : "Pending executive judgement",
    predictedOutcome: loopImpact
      ? `Organisation Health +${loopImpact.predictedHealthDelta}`
      : "Awaiting decision",
    actualOutcome: loopImpact
      ? `Organisation Health +${loopImpact.actualHealthDelta}`
      : "Not yet measured",
    learning: briefText(
      loopImpact
        ? adj >= 0
          ? "Proactive Council monitoring held — reinforce the executives who raised early."
          : "Outcome lagged — sharpen CFO/COO challenges earlier in the next discussion."
        : "Discussion retained for audit; close the loop after judgement.",
      24,
    ),
    confidenceAdjustment: loopImpact
      ? adj === 0
        ? "Unchanged"
        : adj > 0
          ? `+${adj} pts`
          : `${adj} pts`
      : "Pending",
  };
}

export function buildExecutiveAgencyView(input: {
  snapshot: ExecutiveSnapshot;
  strategicOutcomes: StrategicOutcome[];
  decisions?: Decision[];
  selectedDecisionId?: string | null;
  outcomeId?: string | null;
  loopImpacts?: LoopImpactRecord[];
  councilConsensus: CouncilConsensus;
}): ExecutiveAgencyView {
  const observations = buildCouncilObservations(input);
  const collaborations = buildCouncilCollaborations(observations);
  const agencyConsensus = buildAgencyConsensus({
    observations,
    collaborations,
    councilConsensus: input.councilConsensus,
  });
  const discussionLearning = buildDiscussionLearning({
    observations,
    collaborations,
    agencyConsensus,
    loopImpact: input.loopImpacts?.[0] ?? null,
  });

  return {
    observations,
    briefingObservations: observations.slice(0, 3),
    collaborations,
    agencyConsensus,
    discussionLearning,
  };
}
