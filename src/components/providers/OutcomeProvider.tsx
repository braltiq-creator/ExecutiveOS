"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  deriveBriefingFromPortfolio,
  deriveIntelligenceFromPortfolio,
} from "@/lib/outcomes";
import type { Outcome, OutcomePortfolio } from "@/lib/outcomes/types";
import type {
  ExecutiveBriefingData,
  IntelligenceBundle,
} from "@/lib/briefing/executive-briefing-types";
import { usePortfolioStore } from "@/store/portfolio-store";

type OutcomeContextValue = {
  portfolio: OutcomePortfolio;
  outcomes: Outcome[];
  getOutcomeById: (id: string) => Outcome | undefined;
  /** Derived — not a second store */
  intelligence: IntelligenceBundle;
  /** Derived — not a second store */
  briefing: ExecutiveBriefingData;
};

const OutcomeContext = createContext<OutcomeContextValue | null>(null);

/**
 * Outcome SoT for the UI tree — reads the central portfolio store.
 * Pass `portfolio` only in tests / Storybook to override.
 */
export function OutcomeProvider({
  children,
  portfolio: portfolioOverride,
}: {
  children: ReactNode;
  portfolio?: OutcomePortfolio;
}) {
  const storePortfolio = usePortfolioStore((state) => state.portfolio);
  const portfolio = portfolioOverride ?? storePortfolio;

  const value = useMemo<OutcomeContextValue>(() => {
    const intelligence = deriveIntelligenceFromPortfolio(portfolio);
    const briefing = deriveBriefingFromPortfolio(portfolio);
    return {
      portfolio,
      outcomes: portfolio.outcomes,
      getOutcomeById: (id: string) =>
        portfolio.outcomes.find((outcome) => outcome.id === id),
      intelligence,
      briefing,
    };
  }, [portfolio]);

  return (
    <OutcomeContext.Provider value={value}>{children}</OutcomeContext.Provider>
  );
}

export function useOutcomes(): OutcomeContextValue {
  const context = useContext(OutcomeContext);
  if (!context) {
    throw new Error("useOutcomes must be used within OutcomeProvider");
  }
  return context;
}

export function useOutcomesOptional(): OutcomeContextValue | null {
  return useContext(OutcomeContext);
}

export function useOutcome(outcomeId: string): Outcome {
  const { getOutcomeById } = useOutcomes();
  const outcome = getOutcomeById(outcomeId);
  if (!outcome) {
    throw new Error(`Unknown outcome: ${outcomeId}`);
  }
  return outcome;
}
