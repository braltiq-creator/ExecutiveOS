"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";

/**
 * Quiet acknowledgement after returning from a recorded Decision.
 * Not a toast — one line, then the Briefing already shows consequences.
 */
export function DecisionLoopAck() {
  const consequence = usePortfolioStore((state) => state.lastConsequence);
  const clearConsequence = usePortfolioStore((state) => state.clearConsequence);

  useEffect(() => {
    if (!consequence) return;
    const timer = window.setTimeout(() => clearConsequence(), 12_000);
    return () => window.clearTimeout(timer);
  }, [consequence, clearConsequence]);

  if (!consequence) return null;

  return (
    <p
      role="status"
      className="eos-reveal -mt-1 border-b border-border/50 pb-3 text-[13px] leading-5 text-secondary"
    >
      <span className="text-foreground">{consequence.statusLabel}</span>
      {" — "}
      {consequence.briefingImplication}
    </p>
  );
}
