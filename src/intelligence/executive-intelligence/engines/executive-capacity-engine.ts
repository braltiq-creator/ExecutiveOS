import { assessConfidence } from "@/intelligence/executive-intelligence/engines/confidence-engine";
import {
  ensureSentence,
  isOpenDecision,
  isUrgentDecision,
} from "@/intelligence/executive-intelligence/lib/helpers";
import type {
  AttentionBudgetLevel,
  CapacityLevel,
  CapacityResult,
  EnterpriseSignals,
  LeadershipLoadLevel,
} from "@/intelligence/executive-intelligence/types";

/**
 * Executive Capacity Engine — leadership attention economics.
 */
export function deriveExecutiveCapacity(
  signals: EnterpriseSignals,
): CapacityResult {
  const open = signals.decisions.filter((d) => isOpenDecision(d.status));
  const urgent = open.filter((d) => isUrgentDecision(d.status, d.deadline));
  const meetings = signals.outcomes.reduce(
    (count, outcome) => count + outcome.meetings.length,
    0,
  );
  const outstandingApprovals = urgent.length;
  const strategicInitiatives = signals.outcomes.filter(
    (o) => o.status === "at_risk" || o.status === "off_track",
  ).length;
  const delegatedWork = signals.outcomes.reduce(
    (count, outcome) =>
      count +
      outcome.pendingActions.filter((a) => a.status === "pending").length,
    0,
  );
  const contextSwitching = Math.min(
    10,
    meetings + open.length + strategicInitiatives,
  );

  const decisionLoadScore = open.length * 12 + urgent.length * 18;
  const leadershipLoad: LeadershipLoadLevel =
    decisionLoadScore >= 48 || open.length >= 4
      ? "heavy"
      : decisionLoadScore >= 24 || open.length >= 2
        ? "moderate"
        : "light";

  const loadPressure =
    meetings * 14 +
    decisionLoadScore +
    strategicInitiatives * 8 +
    contextSwitching * 3 +
    Math.max(0, delegatedWork - 2) * 4;

  const capacity: CapacityLevel =
    loadPressure >= 90
      ? "overdrawn"
      : loadPressure >= 48
        ? "constrained"
        : "available";

  const attentionBudget: AttentionBudgetLevel =
    urgent.length >= 1 && strategicInitiatives >= 2
      ? "contested"
      : urgent.length >= 1 || strategicInitiatives >= 2
        ? "split"
        : "focused";

  const attentionUnitsRemaining = Math.max(
    0,
    100 - Math.round(loadPressure * 0.7),
  );

  const reasoning = ensureSentence(buildCapacitySummary(capacity, attentionBudget, leadershipLoad));

  return {
    capacity,
    attentionBudget,
    leadershipLoad,
    attentionUnitsRemaining,
    meetingLoad: meetings,
    decisionLoad: open.length,
    outstandingApprovals,
    strategicInitiatives,
    contextSwitching,
    reasoning,
    contributingFactors: [
      {
        id: "meetings",
        label: "Meeting load",
        influence: meetings >= 3 ? "lowers" : "stabilises",
        weight: meetings * 10,
        evidence: `${meetings} executive meetings on the board.`,
      },
      {
        id: "decisions",
        label: "Decision load",
        influence: leadershipLoad === "heavy" ? "lowers" : "stabilises",
        weight: decisionLoadScore,
        evidence: `${open.length} open Decisions (${urgent.length} urgent).`,
      },
      {
        id: "approvals",
        label: "Outstanding approvals",
        influence: outstandingApprovals > 0 ? "lowers" : "stabilises",
        weight: outstandingApprovals * 16,
        evidence: `${outstandingApprovals} approvals still bind the executive.`,
      },
      {
        id: "initiatives",
        label: "Strategic initiatives",
        influence: strategicInitiatives >= 2 ? "lowers" : "stabilises",
        weight: strategicInitiatives * 12,
        evidence: `${strategicInitiatives} Outcomes require active leadership.`,
      },
      {
        id: "context-switching",
        label: "Context switching",
        influence: contextSwitching >= 6 ? "lowers" : "stabilises",
        weight: contextSwitching * 5,
        evidence: `Context-switch index ${contextSwitching}.`,
      },
    ],
    confidence: assessConfidence({
      label: "Executive Capacity",
      dataCompleteness: 78,
      freshnessHours: 6,
      sourceAgreement: 74,
      historicalReliability: 70,
      predictionCertainty: 60,
      aiReasoningConfidence: 68,
    }),
  };
}

function buildCapacitySummary(
  capacity: CapacityLevel,
  attentionBudget: AttentionBudgetLevel,
  leadershipLoad: LeadershipLoadLevel,
): string {
  if (capacity === "overdrawn") {
    return "Executive capacity is overdrawn — calendar and Decision load are competing for the same attention.";
  }
  if (capacity === "constrained" && attentionBudget === "contested") {
    return "Executive capacity is constrained by overlapping strategic priorities.";
  }
  if (capacity === "constrained") {
    return "Executive capacity is constrained — protect Focus time before the calendar fills the gaps.";
  }
  if (leadershipLoad === "heavy") {
    return "Decision load is heavy — clear the urgent call before secondary judgements accumulate.";
  }
  return "Executive capacity is available — attention can stay selective without losing momentum.";
}
