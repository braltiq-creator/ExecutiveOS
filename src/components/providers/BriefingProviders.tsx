"use client";

import type { ReactNode } from "react";
import { DecisionProvider } from "@/components/providers/DecisionProvider";
import { ExecutiveBriefingProvider } from "@/components/providers/ExecutiveBriefingProvider";
import { IntelligenceProvider } from "@/components/providers/IntelligenceProvider";
import { IntentProvider } from "@/components/providers/IntentProvider";
import { MorningNarrativeProvider } from "@/components/providers/MorningNarrativeProvider";
import { OutcomeProvider } from "@/components/providers/OutcomeProvider";

/**
 * Required order (ADR-003 + Intent Engine):
 * Outcome → Intent → Decision → Intelligence → ExecutiveBriefing → MorningNarrative
 */
export function BriefingProviders({ children }: { children: ReactNode }) {
  return (
    <OutcomeProvider>
      <IntentProvider>
        <DecisionProvider>
          <IntelligenceProvider>
            <ExecutiveBriefingProvider>
              <MorningNarrativeProvider>{children}</MorningNarrativeProvider>
            </ExecutiveBriefingProvider>
          </IntelligenceProvider>
        </DecisionProvider>
      </IntentProvider>
    </OutcomeProvider>
  );
}
