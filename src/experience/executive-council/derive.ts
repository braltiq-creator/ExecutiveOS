/**
 * Executive Council — presentation synthesis of peer judgement.
 * Contextual to Outcome + Decision. No Core / provider / routing changes.
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
  CouncilBrief,
  CouncilConsensus,
  CouncilLearning,
  CouncilOpinion,
  CouncilPosition,
  ExecutiveCouncilView,
} from "@/experience/executive-council/types";
import { resolveFocusOutcome } from "@/experience/outcomes-engine/derive";
import { buildExecutiveAgencyView } from "@/experience/executive-council/agency";

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

function positionLabel(p: CouncilPosition): string {
  switch (p) {
    case "approve":
      return "Approve";
    case "approve_with_conditions":
      return "Approve with conditions";
    case "defer":
      return "Defer";
    case "reject":
      return "Reject";
    case "watch":
      return "Watch";
  }
}

function basePosition(
  member: CouncilMemberDefinition,
  decision: Decision | null,
  outcome: StrategicOutcome | null,
  snapshot: ExecutiveSnapshot,
): { position: CouncilPosition; confidenceAdj: number } {
  const conf = decision?.confidence ?? snapshot.pulse.confidence;
  const atRisk =
    outcome?.currentHealth === "at_risk" ||
    outcome?.currentHealth === "off_track";
  const hasRisk = Boolean(
    snapshot.recommendedActions.some((a) => a.potentialRisk),
  );

  switch (member.lens) {
    case "enterprise":
      if (conf >= 75 && atRisk) return { position: "approve", confidenceAdj: 4 };
      if (conf < 60) return { position: "defer", confidenceAdj: -6 };
      return {
        position: atRisk ? "approve_with_conditions" : "approve",
        confidenceAdj: 0,
      };
    case "capital":
      if (conf < 65) return { position: "defer", confidenceAdj: -8 };
      if (hasRisk)
        return { position: "approve_with_conditions", confidenceAdj: -4 };
      return { position: "approve", confidenceAdj: 2 };
    case "operations":
      if (snapshot.executiveState.capacity === "overdrawn")
        return { position: "defer", confidenceAdj: -10 };
      if (snapshot.executiveState.capacity === "constrained")
        return { position: "approve_with_conditions", confidenceAdj: -3 };
      return { position: "approve", confidenceAdj: 1 };
    case "revenue":
      if (atRisk) return { position: "approve", confidenceAdj: 6 };
      if (conf < 55) return { position: "watch", confidenceAdj: -5 };
      return { position: "approve", confidenceAdj: 3 };
    case "strategy":
      if (!outcome) return { position: "watch", confidenceAdj: -4 };
      if (atRisk)
        return { position: "approve_with_conditions", confidenceAdj: 2 };
      return { position: "approve", confidenceAdj: 1 };
  }
}

function opinionFor(
  member: CouncilMemberDefinition,
  decision: Decision | null,
  outcome: StrategicOutcome | null,
  snapshot: ExecutiveSnapshot,
): CouncilOpinion {
  const { position, confidenceAdj } = basePosition(
    member,
    decision,
    outcome,
    snapshot,
  );
  const decisionTitle =
    decision?.question ||
    snapshot.priorityDecisions[0]?.title ||
    snapshot.recommendedActions[0]?.title ||
    "Today's priority judgement";
  const outcomeName = outcome?.name || "Organisation Health";
  const baseConf = decision?.confidence ?? snapshot.pulse.confidence;
  const confidence = clamp(baseConf + confidenceAdj);

  const reasoningByLens: Record<CouncilMemberDefinition["lens"], string> = {
    enterprise: briefText(
      `As CEO I weigh ${decisionTitle} against enterprise coherence. It should improve ${outcomeName} without exhausting leadership capacity.`,
      28,
    ),
    capital: briefText(
      `As CFO I need clear value and bounded downside. ${decision?.costOfDelay || "Cost of delay"} must be priced before we commit capital attention.`,
      26,
    ),
    operations: briefText(
      `As COO I ask whether operations can absorb this. Capacity is ${snapshot.executiveState.capacity}; ownership after approval must be explicit.`,
      26,
    ),
    revenue: briefText(
      `As CRO I judge commercial urgency. ${outcomeName} and customer trust are the scoreboard — delay weakens competitive position.`,
      26,
    ),
    strategy: briefText(
      `As CSO I test outcome alignment. ${decisionTitle} should strengthen ${outcomeName} and reduce strategic drift, not optimise a local metric.`,
      26,
    ),
  };

  const impactByLens: Record<CouncilMemberDefinition["lens"], string> = {
    enterprise: briefText(
      decision?.expectedOutcomeImpact ||
        decision?.businessImpact ||
        `Moves Organisation Health via ${outcomeName}`,
      14,
    ),
    capital: briefText(
      decision?.costOfDelay ||
        snapshot.recommendedActions[0]?.expectedImpact ||
        "Protects or realises executive value",
      14,
    ),
    operations: briefText(
      `Execution load on ${snapshot.executiveState.capacity} capacity — sequence carefully`,
      14,
    ),
    revenue: briefText(
      outcome?.description ||
        snapshot.recommendedActions[0]?.expectedOutcome ||
        "Protects commercial trajectory",
      14,
    ),
    strategy: briefText(
      `Aligns portfolio progress on ${outcomeName}`,
      12,
    ),
  };

  const risksByLens: Record<CouncilMemberDefinition["lens"], string[]> = {
    enterprise: [
      briefText(member.typicalConcerns[0] || "Fragmented priorities", 8),
      briefText(decision?.costOfDelay || "Optionality loss", 8),
    ],
    capital: [
      "Optimistic value case",
      briefText(decision?.costOfDelay || "Unpriced delay", 8),
    ],
    operations: [
      briefText(`Capacity ${snapshot.executiveState.capacity}`, 6),
      "unowned handoff after approval",
    ],
    revenue: [
      briefText(snapshot.recommendedActions.find((a) => a.potentialRisk)?.potentialRisk || "Commercial momentum loss", 8),
      "Customer credibility risk",
    ],
    strategy: [
      "Local optimisation",
      briefText(`${outcomeName} dilution`, 6),
    ],
  };

  const actionByPosition: Record<CouncilPosition, string> = {
    approve: briefText(
      decision?.whatShouldHappenNext || "Approve preferred path today",
      12,
    ),
    approve_with_conditions: briefText(
      `Approve with ${member.shortTitle} conditions — ${member.questionsBeforeRecommend[0]}`,
      14,
    ),
    defer: briefText(
      `Defer until ${member.questionsBeforeRecommend[1] || "evidence improves"}`,
      12,
    ),
    reject: "Do not proceed — downside exceeds outcome value",
    watch: briefText(
      `Watch ${outcomeName}; reopen when signals harden`,
      10,
    ),
  };

  return {
    roleId: member.id,
    title: member.title,
    shortTitle: member.shortTitle,
    position,
    positionLabel: positionLabel(position),
    reasoning: reasoningByLens[member.lens],
    businessImpact: impactByLens[member.lens],
    confidence,
    keyRisks: risksByLens[member.lens],
    suggestedAction: actionByPosition[position],
  };
}

function buildConsensus(opinions: CouncilOpinion[]): CouncilConsensus {
  const approveLike = opinions.filter(
    (o) =>
      o.position === "approve" || o.position === "approve_with_conditions",
  );
  const deferLike = opinions.filter(
    (o) => o.position === "defer" || o.position === "watch",
  );
  const agreementPct = clamp((approveLike.length / opinions.length) * 100);
  const avgConf = clamp(
    opinions.reduce((s, o) => s + o.confidence, 0) / Math.max(1, opinions.length),
  );

  const majority = approveLike.length >= 3 ? "approve" : deferLike.length >= 3 ? "defer" : "mixed";

  const recommendation =
    majority === "approve"
      ? "Proceed — Council majority supports action with managed conditions."
      : majority === "defer"
        ? "Hold — Council majority wants clearer evidence or capacity before binding."
        : "Judgement required — Council is split; executive call still needed.";

  const consensusAreas = [
    ...new Set(
      opinions
        .filter((o) => o.position === "approve" || o.position === "approve_with_conditions")
        .map((o) => briefText(o.businessImpact, 8)),
    ),
  ].slice(0, 3);

  const disagreementAreas = opinions
    .filter((o) => o.position === "defer" || o.position === "watch" || o.position === "reject")
    .map((o) => `${o.shortTitle}: ${o.positionLabel}`)
    .slice(0, 3);

  const tradeOffs = [
    briefText(
      approveLike[0]
        ? `Speed vs ${deferLike[0]?.shortTitle || "certainty"}`
        : "Action vs optionality",
      10,
    ),
    briefText(
      `Outcome progress vs ${opinions.find((o) => o.roleId === "coo")?.keyRisks[0] || "capacity"}`,
      10,
    ),
  ];

  const recommendedDecision =
    majority === "approve"
      ? briefText(
          opinions.find((o) => o.roleId === "ceo")?.suggestedAction ||
            "Approve preferred path",
          14,
        )
      : briefText(
          opinions.find((o) => o.position === "defer")?.suggestedAction ||
            "Defer and reconvene with sharper evidence",
          14,
        );

  return {
    recommendation,
    agreementLevel:
      agreementPct >= 80
        ? "Strong agreement"
        : agreementPct >= 60
          ? "Majority agreement"
          : agreementPct >= 40
            ? "Split council"
            : "Material disagreement",
    agreementPct,
    confidence: avgConf,
    consensusAreas:
      consensusAreas.length > 0
        ? consensusAreas
        : ["Need clearer outcome linkage"],
    disagreementAreas:
      disagreementAreas.length > 0
        ? disagreementAreas
        : ["No material disagreement surfaced"],
    tradeOffs,
    recommendedDecision,
  };
}

export function buildCouncilLearning(
  loopImpact: LoopImpactRecord | null | undefined,
  consensus: CouncilConsensus,
): CouncilLearning | null {
  if (!loopImpact) return null;
  const adj = loopImpact.confidenceAfter - loopImpact.confidenceBefore;
  return {
    originalRecommendation: consensus.recommendedDecision,
    decisionTaken: `${loopImpact.decisionTitle} approved`,
    predictedOutcome: `Organisation Health +${loopImpact.predictedHealthDelta}`,
    actualOutcome: `Organisation Health +${loopImpact.actualHealthDelta}`,
    learning: briefText(
      adj >= 0
        ? "Council judgement held — reinforce the lenses that called this correctly."
        : "Outcome lagged prediction — tighten CFO/COO conditions on similar calls.",
      24,
    ),
    confidenceBefore: loopImpact.confidenceBefore,
    confidenceAfter: loopImpact.confidenceAfter,
    confidenceAdjustment:
      adj === 0 ? "Unchanged" : adj > 0 ? `+${adj} pts` : `${adj} pts`,
  };
}

export function buildExecutiveCouncilView(input: {
  snapshot: ExecutiveSnapshot;
  strategicOutcomes: StrategicOutcome[];
  decisions?: Decision[];
  selectedDecisionId?: string | null;
  outcomeId?: string | null;
  loopImpacts?: LoopImpactRecord[];
}): ExecutiveCouncilView {
  const decisions = input.decisions ?? [];
  const selected =
    decisions.find((d) => d.id === input.selectedDecisionId) ??
    decisions[0] ??
    null;
  const outcome = resolveFocusOutcome({
    outcomes: input.strategicOutcomes,
    snapshot: input.snapshot,
    outcomeId: input.outcomeId,
    decisions,
  });

  const opinions = EXECUTIVE_COUNCIL.map((m) =>
    opinionFor(m, selected, outcome, input.snapshot),
  );
  const consensus = buildConsensus(opinions);
  const learning = buildCouncilLearning(input.loopImpacts?.[0], consensus);

  const focusRole =
    opinions.find((o) => o.position === "defer" || o.position === "watch")
      ?.shortTitle ||
    opinions.find((o) => o.roleId === "ceo")?.shortTitle ||
    "CEO";

  const brief: CouncilBrief = {
    headline: briefText(consensus.recommendation, 14),
    agreementLabel: consensus.agreementLevel,
    confidence: consensus.confidence,
    focusRole,
  };

  const agency = buildExecutiveAgencyView({
    snapshot: input.snapshot,
    strategicOutcomes: input.strategicOutcomes,
    decisions,
    selectedDecisionId: input.selectedDecisionId,
    outcomeId: input.outcomeId,
    loopImpacts: input.loopImpacts,
    councilConsensus: consensus,
  });

  return {
    opinions,
    consensus,
    learning,
    brief,
    decisionTitle:
      selected?.question ||
      input.snapshot.priorityDecisions[0]?.title ||
      "Priority judgement",
    outcomeName: outcome?.name || "Organisation Health",
    agency,
  };
}

export function councilMemberIds(): CouncilRoleId[] {
  return EXECUTIVE_COUNCIL.map((m) => m.id);
}
