"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import type { ExecutiveBriefingData } from "@/lib/briefing/executive-briefing-types";

export type BriefingLayoutMode =
  | "desktop"
  | "laptop"
  | "tablet"
  | "mobile"
  | "board";

type ExecutiveBriefingContextValue = {
  briefing: ExecutiveBriefingData;
  layoutMode: BriefingLayoutMode;
  boardMode: boolean;
  setBoardMode: (enabled: boolean) => void;
  setLayoutMode: (mode: BriefingLayoutMode) => void;
};

const ExecutiveBriefingContext =
  createContext<ExecutiveBriefingContextValue | null>(null);

/**
 * Consumes OutcomeProvider-derived briefing — no duplicated summary store.
 */
export function ExecutiveBriefingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { briefing } = useOutcomes();
  const [boardMode, setBoardModeState] = useState(
    briefing.layoutHint === "board",
  );
  const [layoutMode, setLayoutMode] = useState<BriefingLayoutMode>("desktop");

  const setBoardMode = useCallback((enabled: boolean) => {
    setBoardModeState(enabled);
    if (enabled) {
      setLayoutMode("board");
      return;
    }
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 640) setLayoutMode("mobile");
      else if (width < 1024) setLayoutMode("tablet");
      else if (width < 1280) setLayoutMode("laptop");
      else setLayoutMode("desktop");
    } else {
      setLayoutMode("desktop");
    }
  }, []);

  const value = useMemo<ExecutiveBriefingContextValue>(
    () => ({
      briefing,
      layoutMode: boardMode ? "board" : layoutMode,
      boardMode,
      setBoardMode,
      setLayoutMode,
    }),
    [boardMode, briefing, layoutMode, setBoardMode],
  );

  return (
    <ExecutiveBriefingContext.Provider value={value}>
      {children}
    </ExecutiveBriefingContext.Provider>
  );
}

export function useExecutiveBriefing(): ExecutiveBriefingContextValue {
  const context = useContext(ExecutiveBriefingContext);
  if (!context) {
    throw new Error(
      "useExecutiveBriefing must be used within ExecutiveBriefingProvider",
    );
  }
  return context;
}
