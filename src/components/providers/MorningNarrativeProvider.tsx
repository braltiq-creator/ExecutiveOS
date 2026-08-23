"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import {
  deriveMorningNarrative,
  type MorningNarrative,
} from "@/lib/briefing/morning-narrative";

const MorningNarrativeContext = createContext<MorningNarrative | null>(null);

export function MorningNarrativeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { portfolio } = useOutcomes();
  const narrative = useMemo(
    () => deriveMorningNarrative(portfolio),
    [portfolio],
  );

  return (
    <MorningNarrativeContext.Provider value={narrative}>
      {children}
    </MorningNarrativeContext.Provider>
  );
}

export function useMorningNarrative(): MorningNarrative {
  const context = useContext(MorningNarrativeContext);
  if (!context) {
    throw new Error(
      "useMorningNarrative must be used within MorningNarrativeProvider",
    );
  }
  return context;
}
