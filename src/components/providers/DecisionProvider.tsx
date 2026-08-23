"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import {
  deriveDecisionQueue,
  getDecisionById,
  getDecisionsForOutcome,
  toPriorityDecisions,
} from "@/lib/decisions";
import type {
  Decision,
  DecisionQueueItem,
} from "@/lib/decisions/engine-types";
import type { PriorityDecision } from "@/lib/briefing/executive-briefing-types";

type DecisionContextValue = {
  decisions: Decision[];
  queue: DecisionQueueItem[];
  /** Briefing-facing projection — derived, not a second store */
  priorityDecisions: PriorityDecision[];
  getDecisionById: (id: string) => Decision | undefined;
  getDecisionsForOutcome: (outcomeId: string) => Decision[];
  openCount: number;
  dueTodayCount: number;
};

const DecisionContext = createContext<DecisionContextValue | null>(null);

/**
 * Decision Intelligence Engine — consumes OutcomeProvider only.
 */
export function DecisionProvider({ children }: { children: ReactNode }) {
  const { portfolio } = useOutcomes();

  const value = useMemo<DecisionContextValue>(() => {
    const queue = deriveDecisionQueue(portfolio);
    const priorityDecisions = toPriorityDecisions(queue);
    return {
      decisions: portfolio.decisions,
      queue,
      priorityDecisions,
      getDecisionById: (id: string) => getDecisionById(portfolio, id),
      getDecisionsForOutcome: (outcomeId: string) =>
        getDecisionsForOutcome(portfolio, outcomeId),
      openCount: queue.filter(
        (item) => item.status !== "decided" && item.status !== "approved",
      ).length,
      dueTodayCount: queue.filter(
        (item) =>
          item.status === "due_today" ||
          item.deadline.toLowerCase().includes("today"),
      ).length,
    };
  }, [portfolio]);

  return (
    <DecisionContext.Provider value={value}>{children}</DecisionContext.Provider>
  );
}

export function useDecisions(): DecisionContextValue {
  const context = useContext(DecisionContext);
  if (!context) {
    throw new Error("useDecisions must be used within DecisionProvider");
  }
  return context;
}

export function useDecisionsOptional(): DecisionContextValue | null {
  return useContext(DecisionContext);
}

export function useDecision(decisionId: string): Decision {
  const { getDecisionById } = useDecisions();
  const decision = getDecisionById(decisionId);
  if (!decision) {
    throw new Error(`Unknown decision: ${decisionId}`);
  }
  return decision;
}
