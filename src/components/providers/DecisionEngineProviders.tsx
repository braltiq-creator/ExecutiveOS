"use client";

import type { ReactNode } from "react";
import { DecisionProvider } from "@/components/providers/DecisionProvider";
import { IntentProvider } from "@/components/providers/IntentProvider";
import { OutcomeProvider } from "@/components/providers/OutcomeProvider";

/** Decision Engine pages — Outcome store + Intent + derived Decision Engine. */
export function DecisionEngineProviders({ children }: { children: ReactNode }) {
  return (
    <OutcomeProvider>
      <IntentProvider>
        <DecisionProvider>{children}</DecisionProvider>
      </IntentProvider>
    </OutcomeProvider>
  );
}
