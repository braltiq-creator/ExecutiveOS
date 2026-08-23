"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import {
  alignDecisionToIntent,
  buildIntentContext,
  getActiveIntent,
  resolveIntentOutcomeSets,
  resolveOutcomeAlignment,
} from "@/lib/intent/derive";
import type {
  DecisionIntentAlignment,
  ExecutiveIntent,
  IntentContext,
  IntentOutcomeRef,
  OutcomeIntentAlignment,
} from "@/lib/intent/engine-types";
import type { Decision } from "@/lib/decisions/engine-types";

type IntentContextValue = {
  /** Active Intent — from OutcomePortfolio (SoT) */
  intent: ExecutiveIntent;
  /** Superseded Intent records */
  intentHistory: ExecutiveIntent[];
  /** Briefing / strip projection */
  context: IntentContext;
  focusOutcomes: IntentOutcomeRef[];
  watchingOutcomes: IntentOutcomeRef[];
  supportingOutcomes: IntentOutcomeRef[];
  nonFocusOutcomes: IntentOutcomeRef[];
  reviewCadence: string;
  reviewDate: string;
  getOutcomeAlignment: (outcomeId: string) => OutcomeIntentAlignment;
  alignDecision: (decision: Decision) => DecisionIntentAlignment;
  alignDecisionById: (decisionId: string) => DecisionIntentAlignment | null;
};

const IntentReactContext = createContext<IntentContextValue | null>(null);

/**
 * Executive Intent Engine — derives focus context from OutcomeProvider.
 * Does not own outcome, decision, or action business state.
 */
export function IntentProvider({ children }: { children: ReactNode }) {
  const { portfolio } = useOutcomes();

  const value = useMemo<IntentContextValue>(() => {
    const intent = getActiveIntent(portfolio);
    const sets = resolveIntentOutcomeSets(portfolio);
    const context = buildIntentContext(portfolio);

    return {
      intent,
      intentHistory: portfolio.intentHistory,
      context,
      focusOutcomes: sets.focusOutcomes,
      watchingOutcomes: sets.watchingOutcomes,
      supportingOutcomes: sets.supportingOutcomes,
      nonFocusOutcomes: sets.nonFocusOutcomes,
      reviewCadence: intent.reviewCadence,
      reviewDate: intent.reviewDate,
      getOutcomeAlignment: (outcomeId: string) =>
        resolveOutcomeAlignment(intent, outcomeId),
      alignDecision: (decision: Decision) =>
        alignDecisionToIntent(portfolio, decision),
      alignDecisionById: (decisionId: string) => {
        const decision = portfolio.decisions.find(
          (item) => item.id === decisionId,
        );
        if (!decision) return null;
        return alignDecisionToIntent(portfolio, decision);
      },
    };
  }, [portfolio]);

  return (
    <IntentReactContext.Provider value={value}>
      {children}
    </IntentReactContext.Provider>
  );
}

export function useIntent(): IntentContextValue {
  const context = useContext(IntentReactContext);
  if (!context) {
    throw new Error("useIntent must be used within IntentProvider");
  }
  return context;
}

export function useIntentOptional(): IntentContextValue | null {
  return useContext(IntentReactContext);
}
