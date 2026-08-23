"use client";

import { useMemo } from "react";
import { AdvisorRecommendation } from "@/components/decisions/workspace/AdvisorRecommendation";
import { DecisionActions } from "@/components/decisions/workspace/DecisionActions";
import { DecisionHeader } from "@/components/decisions/workspace/DecisionHeader";
import { ExecutiveContext } from "@/components/decisions/workspace/ExecutiveContext";
import { MaterialEvidence } from "@/components/decisions/workspace/MaterialEvidence";
import { OutcomeImpact } from "@/components/decisions/workspace/OutcomeImpact";
import { StrategicRisks } from "@/components/decisions/workspace/StrategicRisks";
import { useDecision } from "@/components/providers/DecisionProvider";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import { deriveDecisionWorkspace } from "@/lib/decisions/workspace";
import { ExecutiveDivider } from "@/design-system";

/**
 * Executive Decision Workspace — Design System 1.0.
 */
export function DecisionWorkspace({ decisionId }: { decisionId: string }) {
  const decision = useDecision(decisionId);
  const { portfolio } = useOutcomes();

  const model = useMemo(() => {
    const outcomesById = new Map(
      portfolio.outcomes.map((outcome) => [outcome.id, outcome]),
    );
    return deriveDecisionWorkspace(decision, outcomesById);
  }, [decision, portfolio.outcomes]);

  return (
    <div className="mx-auto max-w-3xl pb-[var(--eos-space-3xl)]">
      <article>
        <DecisionHeader model={model} />
        <ExecutiveContext model={model} />
        <ExecutiveDivider soft />
        <OutcomeImpact model={model} />
        <ExecutiveDivider soft />
        <MaterialEvidence model={model} />
        <ExecutiveDivider soft />
        <StrategicRisks model={model} />
        <ExecutiveDivider soft />
        <AdvisorRecommendation model={model} />
        <ExecutiveDivider soft />
        <DecisionActions
          decisionId={decisionId}
          decisionTitle={model.title}
        />
      </article>
    </div>
  );
}
