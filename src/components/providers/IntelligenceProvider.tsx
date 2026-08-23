"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useDecisions } from "@/components/providers/DecisionProvider";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import type { IntelligenceBundle } from "@/lib/briefing/executive-briefing-types";

type IntelligenceContextValue = {
  intelligence: IntelligenceBundle;
};

const IntelligenceContext = createContext<IntelligenceContextValue | null>(
  null,
);

/**
 * Consumes OutcomeProvider + Decision Engine.
 * Priority decisions are sourced from DecisionProvider — not re-derived in parallel.
 */
export function IntelligenceProvider({ children }: { children: ReactNode }) {
  const { intelligence: base } = useOutcomes();
  const { priorityDecisions } = useDecisions();

  const value = useMemo(
    () => ({
      intelligence: {
        ...base,
        priorityDecisions,
      },
    }),
    [base, priorityDecisions],
  );

  return (
    <IntelligenceContext.Provider value={value}>
      {children}
    </IntelligenceContext.Provider>
  );
}

export function useIntelligence(): IntelligenceContextValue {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error(
      "useIntelligence must be used within IntelligenceProvider",
    );
  }
  return context;
}
