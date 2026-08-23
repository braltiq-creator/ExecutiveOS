/**
 * Executive Rhythm — operating cadence awareness and meeting preparation.
 * Presentation-only. No Core / provider / routing changes.
 */

import type { Decision } from "@/lib/decisions/engine-types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import type { LoopImpactRecord } from "@/experience/executive-loop/types";
import type { CouncilObservation } from "@/experience/executive-council/types";
import { EXECUTIVE_COUNCIL } from "@/experience/executive-council/members";
import {
  EXECUTIVE_RHYTHMS,
  getRhythm,
  type RhythmDefinition,
  type RhythmId,
} from "@/experience/executive-rhythm/definitions";
import type {
  ExecutiveRhythmView,
  MeetingPack,
  RhythmAwareness,
  RhythmFocus,
  RhythmLearning,
} from "@/experience/executive-rhythm/types";
import { resolveFocusOutcome } from "@/experience/outcomes-engine/derive";

function briefText(text: string, maxWords = 16): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const clause = cleaned.split(/(?<=[.!?])\s+|;\s+|—\s+/)[0] || cleaned;
  const words = clause.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return clause.replace(/[.!?]+$/, "");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

/** Deterministic cadence from organisational date — presentation calendar. */
export function resolveCurrentRhythm(asOf: string): RhythmDefinition {
  const d = new Date(asOf);
  if (Number.isNaN(d.getTime())) return getRhythm("daily_brief");

  const month = d.getUTCMonth(); // 0-11
  const date = d.getUTCDate();
  const dow = d.getUTCDay(); // 0 Sun … 6 Sat
  const quarterMonth = month % 3; // 0 = first month of quarter

  // Late-quarter board window
  if (quarterMonth === 2 && date >= 20) {
    return getRhythm("quarterly_board");
  }
  // Mid-quarter strategy window
  if (quarterMonth === 1 && date >= 10 && date <= 20) {
    return getRhythm("quarterly_strategy");
  }
  // Month-start financial
  if (date <= 5) {
    return getRhythm("monthly_financial");
  }
  // Mid-month business review
  if (date >= 12 && date <= 18) {
    return getRhythm("monthly_business");
  }
  // November/December planning & budget flavour
  if (month === 10 || month === 11) {
    if (date >= 1 && date <= 10) return getRhythm("budget_cycle");
    if (date >= 11 && date <= 20) return getRhythm("annual_planning");
  }

  switch (dow) {
    case 1:
      return getRhythm("weekly_elt");
    case 2:
      return getRhythm("weekly_sales");
    case 3:
      return getRhythm("weekly_ops");
    case 4:
      return getRhythm("forecast_review");
    case 5:
      return getRhythm("risk_review");
    default:
      return getRhythm("daily_brief");
  }
}

function councilFocusFor(rhythm: RhythmDefinition): RhythmFocus[] {
  const focusByRole: Record<string, Partial<Record<RhythmId, string>>> = {
    ceo: {
      weekly_elt: "Set discussion order and close open judgements",
      monthly_business: "Own the executive narrative",
      quarterly_board: "Focus on strategic narrative",
      quarterly_strategy: "Protect portfolio coherence",
      daily_brief: "Protect attention for highest-value judgement",
    },
    cfo: {
      weekly_elt: "Price cost of delay on each decision",
      monthly_financial: "Establish financial confidence",
      quarterly_board: "Financial confidence for the board",
      budget_cycle: "Capital allocation discipline",
      forecast_review: "Lock forecast assumptions",
    },
    coo: {
      weekly_elt: "Name execution owners before approval",
      weekly_ops: "Protect delivery reliability",
      quarterly_board: "Execution confidence",
      risk_review: "Own operational exposure",
      monthly_business: "Convert actions into operable plans",
    },
    cro: {
      weekly_elt: "Surface commercial urgency",
      weekly_sales: "Protect growth trajectory",
      quarterly_board: "Growth trajectory for the board",
      monthly_business: "Explain commercial performance",
      forecast_review: "Defend pipeline credibility",
    },
    cso: {
      weekly_elt: "Keep every item linked to an outcome",
      monthly_business: "Explain outcome movement",
      quarterly_board: "Long-term outcomes",
      quarterly_strategy: "Recalibrate outcome priorities",
      annual_planning: "Design next year's outcome set",
    },
  };

  return rhythm.participants.map((roleId) => {
    const member = EXECUTIVE_COUNCIL.find((m) => m.id === roleId)!;
    const focus =
      focusByRole[roleId]?.[rhythm.id] ||
      `Prepare ${member.monitoringDomains[0] || member.role} for ${rhythm.name}`;
    return {
      roleId,
      shortTitle: member.shortTitle,
      focus,
    };
  });
}

function upcomingLabel(rhythm: RhythmDefinition, asOf: string): string {
  const d = new Date(asOf);
  if (Number.isNaN(d.getTime())) return "Upcoming";
  if (rhythm.cadence === "daily") return "Today";
  if (rhythm.cadence === "weekly") {
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      timeZone: "UTC",
    });
  }
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function buildRhythmAwareness(input: {
  asOf: string;
  rhythm: RhythmDefinition;
  decisionCount: number;
  riskCount: number;
}): RhythmAwareness {
  const { rhythm } = input;
  const decisionWord =
    input.decisionCount === 1
      ? "one decision"
      : `${input.decisionCount} decisions`;
  const riskWord =
    input.riskCount === 1 ? "one strategic risk" : `${input.riskCount} strategic risks`;

  return {
    asOf: input.asOf,
    currentRhythmId: rhythm.id,
    currentRhythmName: rhythm.name,
    cadence: rhythm.cadence,
    upcomingLabel: upcomingLabel(rhythm, input.asOf),
    preparationWindow: `${rhythm.prepMinutes} minutes preparation`,
    decisionDeadline: upcomingLabel(rhythm, input.asOf),
    prepMinutes: rhythm.prepMinutes,
    meetingMinutes: rhythm.meetingMinutes,
    headline: `Today is the ${rhythm.name}.`,
    detail: `The Council has prepared ${decisionWord} and ${riskWord}.`,
    decisionCount: input.decisionCount,
    riskCount: input.riskCount,
    packHref: `/decisions?from=priority#meeting-pack`,
  };
}

export function buildMeetingPack(input: {
  rhythm: RhythmDefinition;
  snapshot: ExecutiveSnapshot;
  strategicOutcomes: StrategicOutcome[];
  decisions?: Decision[];
  observations?: CouncilObservation[];
  outcomeId?: string | null;
}): MeetingPack {
  const decisions = input.decisions ?? [];
  const observations = input.observations ?? [];
  const outcome = resolveFocusOutcome({
    outcomes: input.strategicOutcomes,
    snapshot: input.snapshot,
    outcomeId: input.outcomeId,
    decisions,
  });

  const keyDecisions = [
    ...decisions.slice(0, 3).map((d) => ({
      title: briefText(d.question, 12),
      href: `/decisions/${d.id}`,
    })),
    ...input.snapshot.priorityDecisions.slice(0, 2).map((d) => ({
      title: briefText(d.title, 12),
      href: d.href,
    })),
  ].slice(0, 4);

  const risks = [
    ...input.snapshot.recommendedActions
      .filter((a) => a.potentialRisk)
      .slice(0, 2)
      .map((a) => briefText(a.potentialRisk || a.title, 12)),
    ...input.strategicOutcomes
      .filter(
        (o) =>
          o.currentHealth === "at_risk" || o.currentHealth === "off_track",
      )
      .slice(0, 2)
      .map((o) => briefText(`${o.name} ${o.currentHealth.replace(/_/g, " ")}`, 12)),
  ].slice(0, 4);

  const opportunities = input.snapshot.recommendedActions
    .filter((a) => !a.potentialRisk)
    .slice(0, 3)
    .map((a) => briefText(a.title, 12));

  const sequence = [
    "Confirm purpose and desired outcomes",
    ...keyDecisions.slice(0, 2).map((d) => `Decide: ${d.title}`),
    ...risks.slice(0, 1).map((r) => `Contain risk: ${r}`),
    "Agree owners and follow-up cadence",
  ].slice(0, 5);

  return {
    rhythmId: input.rhythm.id,
    rhythmName: input.rhythm.name,
    purpose: input.rhythm.purpose,
    executiveSummary: briefText(
      `${input.rhythm.name}: ${input.rhythm.purpose} Focus outcome ${outcome?.name || "Organisation Health"}. ${input.snapshot.pulse.why}`,
      36,
    ),
    councilObservations: observations
      .slice(0, 4)
      .map((o) => `${o.raisedBy}: ${o.headline}`),
    keyDecisions,
    strategicOutcomes: (
      input.strategicOutcomes.length
        ? input.strategicOutcomes
        : []
    )
      .slice(0, 4)
      .map((o) => `${o.name} · ${o.currentHealth.replace(/_/g, " ")}`),
    risks:
      risks.length > 0 ? risks : ["No elevated strategic risk in pack"],
    opportunities:
      opportunities.length > 0
        ? opportunities
        : ["Hold commercial posture"],
    supportingEvidence: [
      ...observations.slice(0, 2).map((o) => o.businessImpact),
      ...input.snapshot.sinceYesterday
        .slice(0, 2)
        .map((u) => briefText(u.sentence, 12)),
      ...(outcome?.evidence.slice(0, 2) || []),
    ].slice(0, 5),
    discussionSequence: sequence,
    estimatedDurationMinutes: input.rhythm.meetingMinutes,
    prepMinutes: input.rhythm.prepMinutes,
    councilFocus: councilFocusFor(input.rhythm),
  };
}

export function buildRhythmLearning(input: {
  rhythm: RhythmDefinition;
  loopImpacts?: LoopImpactRecord[];
  pack: MeetingPack;
}): RhythmLearning {
  const latest = input.loopImpacts?.[0];
  const prepQuality =
    input.pack.councilObservations.length >= 2
      ? "Strong — Council observations ready"
      : "Adequate — deepen observation coverage";
  const decisionQuality =
    input.pack.keyDecisions.length > 0
      ? "Decisions framed for judgement"
      : "Needs clearer decision asks";
  const meetingOutcomes = latest
    ? `Last loop closed: Health ${latest.healthBefore}→${latest.healthAfter}`
    : "Awaiting meeting outcomes";
  const actionCompletion = latest
    ? "Prior rhythm actions progressing via Operating Loop"
    : "Track action completion after this rhythm";
  const outcomeImprovement = latest
    ? `+${latest.actualHealthDelta} Organisation Health vs +${latest.predictedHealthDelta} predicted`
    : "Measure outcome improvement after decisions land";

  return {
    rhythmName: input.rhythm.name,
    preparationQuality: prepQuality,
    decisionQuality,
    meetingOutcomes,
    actionCompletion,
    outcomeImprovement,
    learning: briefText(
      latest
        ? `Improve next ${input.rhythm.name} by carrying forward Council challenges that proved correct.`
        : `Use this ${input.rhythm.name} pack to tighten discussion order and owner clarity.`,
      24,
    ),
  };
}

export function buildExecutiveRhythmView(input: {
  snapshot: ExecutiveSnapshot;
  strategicOutcomes: StrategicOutcome[];
  decisions?: Decision[];
  observations?: CouncilObservation[];
  loopImpacts?: LoopImpactRecord[];
  outcomeId?: string | null;
  /** Optional override for tests / deep-links. */
  rhythmId?: RhythmId | null;
}): ExecutiveRhythmView {
  const rhythm = input.rhythmId
    ? getRhythm(input.rhythmId)
    : resolveCurrentRhythm(input.snapshot.asOf);

  const decisions = input.decisions ?? [];
  const decisionCount = Math.max(
    decisions.length,
    input.snapshot.priorityDecisions.length,
    1,
  );
  const riskCount = Math.max(
    input.snapshot.outcomes.filter(
      (o) => o.status === "at_risk" || o.status === "off_track",
    ).length +
      input.snapshot.recommendedActions.filter((a) => a.potentialRisk).length,
    input.strategicOutcomes.filter(
      (o) =>
        o.currentHealth === "at_risk" || o.currentHealth === "off_track",
    ).length,
    1,
  );

  const pack = buildMeetingPack({
    rhythm,
    snapshot: input.snapshot,
    strategicOutcomes: input.strategicOutcomes,
    decisions,
    observations: input.observations,
    outcomeId: input.outcomeId,
  });

  const awareness = buildRhythmAwareness({
    asOf: input.snapshot.asOf,
    rhythm,
    decisionCount: Math.min(decisionCount, pack.keyDecisions.length || decisionCount),
    riskCount: Math.min(riskCount, pack.risks.length || riskCount),
  });

  // Prefer counts that match pack content for Command Centre copy
  awareness.decisionCount = pack.keyDecisions.length || awareness.decisionCount;
  awareness.riskCount = pack.risks.filter((r) => !r.startsWith("No elevated")).length || awareness.riskCount;
  awareness.detail = `The Council has prepared ${
    awareness.decisionCount === 1
      ? "one decision"
      : `${awareness.decisionCount} decisions`
  } and ${
    awareness.riskCount === 1
      ? "one strategic risk"
      : `${awareness.riskCount} strategic risks`
  }.`;

  const learning = buildRhythmLearning({
    rhythm,
    loopImpacts: input.loopImpacts,
    pack,
  });

  return {
    awareness,
    pack,
    learning,
    catalog: EXECUTIVE_RHYTHMS.map((r) => ({
      id: r.id,
      name: r.name,
      cadence: r.cadence,
    })),
  };
}
