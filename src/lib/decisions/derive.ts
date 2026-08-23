import type {
  Decision,
  DecisionQueueItem,
  EngineDecisionStatus,
} from "@/lib/decisions/engine-types";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type { PriorityDecision } from "@/lib/briefing/executive-briefing-types";

function statusRank(status: EngineDecisionStatus): number {
  switch (status) {
    case "due_today":
      return 0;
    case "under_review":
      return 1;
    case "pending":
      return 2;
    case "deferred":
      return 3;
    case "approved":
    case "decided":
      return 4;
  }
}

function byDeadlineUrgency(deadline: string): number {
  const value = deadline.toLowerCase();
  if (value.includes("today")) return 0;
  if (value.includes("tue") || value.includes("tomorrow")) return 1;
  if (value.includes("wed")) return 2;
  if (value.includes("thu")) return 3;
  if (value.includes("fri")) return 4;
  return 5;
}

export function assertDecisionsLinked(decisions: Decision[]): void {
  for (const decision of decisions) {
    if (!decision.outcomeIds.length) {
      throw new Error(
        `Decision ${decision.id} has no outcome links — standalone decisions are not allowed.`,
      );
    }
  }
}

export function deriveDecisionQueue(
  portfolio: OutcomePortfolio,
): DecisionQueueItem[] {
  assertDecisionsLinked(portfolio.decisions);
  const nameById = new Map(
    portfolio.outcomes.map((outcome) => [outcome.id, outcome.name]),
  );

  const queue = portfolio.decisions.map((decision) => {
    const outcomeNames = decision.outcomeIds.map(
      (id) => nameById.get(id) ?? id,
    );
    return {
      ...decision,
      outcomeNames,
      primaryOutcomeId: decision.outcomeIds[0],
    };
  });

  queue.sort((left, right) => {
    const statusDiff = statusRank(left.status) - statusRank(right.status);
    if (statusDiff !== 0) return statusDiff;
    return (
      byDeadlineUrgency(left.deadline) - byDeadlineUrgency(right.deadline)
    );
  });

  return queue;
}

export function getDecisionsForOutcome(
  portfolio: OutcomePortfolio,
  outcomeId: string,
): Decision[] {
  return portfolio.decisions.filter((decision) =>
    decision.outcomeIds.includes(outcomeId),
  );
}

export function getDecisionById(
  portfolio: OutcomePortfolio,
  decisionId: string,
): Decision | undefined {
  return portfolio.decisions.find((decision) => decision.id === decisionId);
}

/** Map Decision Engine → briefing priority decision cards. */
export function toPriorityDecisions(
  queue: DecisionQueueItem[],
): PriorityDecision[] {
  return queue
    .filter(
      (decision) =>
        decision.status !== "decided" &&
        decision.status !== "approved" &&
        decision.status !== "deferred",
    )
    .map((decision) => ({
      id: decision.id,
      question: decision.question,
      status:
        decision.status === "deferred"
          ? ("pending" as const)
          : decision.status === "due_today" ||
              decision.status === "under_review" ||
              decision.status === "pending"
            ? decision.status
            : ("pending" as const),
      whatChanged: decision.whatChanged,
      why: decision.why,
      outcomeId: decision.primaryOutcomeId,
      whatShouldHappenNext: decision.whatShouldHappenNext,
      recommendation: {
        businessImpact: decision.businessImpact,
        expectedOutcomeImpact: decision.expectedOutcomeImpact,
        confidence: decision.confidence,
        owner: decision.owner,
        deadline: decision.deadline,
      },
    }));
}
