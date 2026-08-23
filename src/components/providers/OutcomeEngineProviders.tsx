"use client";

import type { ReactNode } from "react";
import { DecisionProvider } from "@/components/providers/DecisionProvider";
import { IntentProvider } from "@/components/providers/IntentProvider";
import { OutcomeProvider } from "@/components/providers/OutcomeProvider";

/** Outcome Engine root — Outcome store + Intent + Decision consumers. */
export function OutcomeEngineProviders({ children }: { children: ReactNode }) {
  return (
    <OutcomeProvider>
      <IntentProvider>
        <DecisionProvider>{children}</DecisionProvider>
      </IntentProvider>
    </OutcomeProvider>
  );
}
