import type {
  ExecutiveBriefingData,
  IntelligenceBundle,
} from "@/lib/briefing/executive-briefing-types";
import { deriveLeadJudgement } from "@/lib/briefing/lead-judgement";
import {
  deriveDecisionQueue,
  toPriorityDecisions,
} from "@/lib/decisions/derive";
import type { Outcome, OutcomePortfolio } from "@/lib/outcomes/types";

function byDeadlineUrgency(deadline: string): number {
  const value = deadline.toLowerCase();
  if (value.includes("today")) return 0;
  if (value.includes("tue") || value.includes("tomorrow")) return 1;
  if (value.includes("wed")) return 2;
  if (value.includes("thu")) return 3;
  if (value.includes("fri")) return 4;
  return 5;
}

/** Flatten outcome-owned signals; decisions come from Decision Engine. */
export function deriveIntelligenceFromPortfolio(
  portfolio: OutcomePortfolio,
): IntelligenceBundle {
  const overnightChanges = portfolio.outcomes.flatMap((outcome) =>
    outcome.overnightSignals.map((signal) => ({
      ...signal,
      outcomeId: outcome.id,
    })),
  );

  const decisionQueue = deriveDecisionQueue(portfolio);
  const priorityDecisions = toPriorityDecisions(decisionQueue);

  const topInsights = portfolio.outcomes.flatMap((outcome) =>
    outcome.contributingInsights.map((insight) => ({
      ...insight,
      outcomeId: outcome.id,
    })),
  );

  const recommendedActions = portfolio.outcomes.flatMap((outcome) =>
    outcome.pendingActions.map((action) => ({
      id: action.id,
      actionLabel: action.actionLabel,
      whatChanged: action.whatChanged,
      why: action.why,
      outcomeId: outcome.id,
      whatShouldHappenNext: action.whatShouldHappenNext,
      recommendation: action.recommendation,
    })),
  );

  const calendarContext = portfolio.outcomes.flatMap((outcome) =>
    outcome.calendarContext.map((item) => ({
      ...item,
      outcomeId: outcome.id,
    })),
  );

  overnightChanges.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
  recommendedActions.sort(
    (a, b) =>
      byDeadlineUrgency(a.recommendation.deadline) -
      byDeadlineUrgency(b.recommendation.deadline),
  );
  calendarContext.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  return {
    overnightChanges,
    priorityDecisions,
    topInsights,
    recommendedActions,
    calendarContext,
  };
}

/** Rank Outcomes for Briefing lead — worst health / status first. */
export function pickLeadOutcome(portfolio: OutcomePortfolio): Outcome {
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

/** Build Executive Briefing summary — decisionsDueToday from Decision Engine. */
export function deriveBriefingFromPortfolio(
  portfolio: OutcomePortfolio,
): ExecutiveBriefingData {
  const lead = pickLeadOutcome(portfolio);
  const intelligence = deriveIntelligenceFromPortfolio(portfolio);
  const decisionQueue = deriveDecisionQueue(portfolio);
  const decisionsDueToday = decisionQueue.filter(
    (item) =>
      item.status === "due_today" ||
      item.deadline.toLowerCase().includes("today"),
  ).length;

  const secondary = portfolio.outcomes.find(
    (outcome) =>
      outcome.id !== lead.id &&
      (outcome.status === "off_track" || outcome.status === "at_risk"),
  );

  const headline = secondary
    ? `${lead.name.split(" ").slice(0, 3).join(" ")}… and ${secondary.name.split(" ").slice(0, 3).join(" ")}… both require judgment before midday.`
    : `${lead.name} requires judgment before midday.`;

  const leadSignal =
    lead.overnightSignals[0] ?? lead.recommendations[0] ?? null;

  const leadDecision = decisionQueue.find((decision) =>
    decision.outcomeIds.includes(lead.id),
  );

  return {
    layoutHint: "standard",
    leadJudgement: deriveLeadJudgement(portfolio),
    summary: {
      greeting: `Good morning, ${portfolio.executiveName}`,
      asOf: portfolio.refreshedAt,
      headline:
        lead.id === "outcome-enterprise-arr"
          ? "Helix expansion and calendar load both require judgment before midday."
          : headline,
      whatChanged:
        leadSignal && "whatChanged" in leadSignal
          ? `${lead.yesterdayMovementLabel}. ${leadSignal.whatChanged}`
          : lead.yesterdayMovementLabel,
      why: lead.expectedTrajectory.summary,
      outcomeId: lead.id,
      whatShouldHappenNext:
        leadDecision?.whatShouldHappenNext ??
        lead.pendingActions[0]?.whatShouldHappenNext ??
        lead.recommendations[0]?.whatShouldHappenNext ??
        "Review outcome detail and clear the highest-confidence pending action.",
      recommendation: leadDecision
        ? {
            businessImpact: leadDecision.businessImpact,
            expectedOutcomeImpact: leadDecision.expectedOutcomeImpact,
            confidence: leadDecision.confidence,
            owner: leadDecision.owner,
            deadline: leadDecision.deadline,
          }
        : (lead.pendingActions[0]?.recommendation ??
          lead.recommendations[0]?.recommendation ?? {
            businessImpact: lead.businessImpact,
            expectedOutcomeImpact: lead.expectedTrajectory.summary,
            confidence: lead.confidence,
            owner: lead.owner,
            deadline: "Today",
          }),
      attentionCount: intelligence.overnightChanges.length,
      decisionsDueToday,
    },
  };
}
