"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { StrategyDashboard } from "@/strategy/framework/types";
import { useExperienceData } from "@/experience/executive-brief/useExperienceData";
import { useDecisionsOptional } from "@/components/providers/DecisionProvider";
import { listLoopImpacts } from "@/experience/executive-loop";
import { buildStrategyWorkspaceModel } from "@/experience/strategy-workspace/derive";
import { useEntryFocus } from "@/experience/strategy-workspace/useEntryFocus";
import {
  StrategyHeader,
  entryArrivalLabel,
} from "@/experience/strategy-workspace/StrategyHeader";
import { OrgHealthSummary } from "@/experience/strategy-workspace/OrgHealthSummary";
import { OutcomePortfolio } from "@/experience/strategy-workspace/OutcomePortfolio";
import { BusinessDrivers } from "@/experience/strategy-workspace/BusinessDrivers";
import { KeyRisks } from "@/experience/strategy-workspace/KeyRisks";
import { Opportunities } from "@/experience/strategy-workspace/Opportunities";
import { RecommendedDecisions } from "@/experience/strategy-workspace/RecommendedDecisions";
import { RelatedKnowledge } from "@/experience/strategy-workspace/RelatedKnowledge";
import {
  buildOutcomesEngineView,
  OutcomeContextStrip,
  OutcomeHealthPanel,
  OutcomeRelationships,
  OutcomeTimeline,
} from "@/experience/outcomes-engine";
import {
  buildExecutiveCouncilView,
  CouncilBriefStrip,
} from "@/experience/executive-council";

type Props = {
  dashboard: StrategyDashboard;
};

/**
 * Strategy Workspace — first Executive Workspace.
 * Explains Organisation Health as a derived indicator of Outcome progress.
 */
export function StrategyWorkspace({ dashboard }: Props) {
  const { snapshot, mode } = useExperienceData();

  if (!snapshot) {
    return (
      <div
        className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 pb-16"
        data-strategy-workspace="loading"
        aria-label="Strategy Workspace"
      >
        <p className="exs-body text-[length:0.85rem]">
          {mode === "loading"
            ? "Preparing executive context…"
            : "Executive Snapshot unavailable. Re-open from Snapshot Studio."}
        </p>
      </div>
    );
  }

  return <StrategyWorkspaceReady dashboard={dashboard} snapshot={snapshot} />;
}

function StrategyWorkspaceReady({
  dashboard,
  snapshot,
}: {
  dashboard: StrategyDashboard;
  snapshot: NonNullable<ReturnType<typeof useExperienceData>["snapshot"]>;
}) {
  const searchParams = useSearchParams();
  const decisionsCtx = useDecisionsOptional();
  const entryFrom = searchParams.get("from");
  const outcomeId = searchParams.get("outcome");

  const model = useMemo(
    () =>
      buildStrategyWorkspaceModel({
        dashboard,
        snapshot,
        entryFrom,
      }),
    [dashboard, snapshot, entryFrom],
  );

  const outcomesView = useMemo(
    () =>
      buildOutcomesEngineView({
        strategicOutcomes: dashboard.outcomes,
        snapshot,
        decisions: decisionsCtx?.decisions ?? [],
        loopImpacts: listLoopImpacts(),
        outcomeId,
        workspace: "strategy",
      }),
    [dashboard.outcomes, snapshot, decisionsCtx?.decisions, outcomeId],
  );

  const council = useMemo(
    () =>
      buildExecutiveCouncilView({
        snapshot,
        strategicOutcomes: dashboard.outcomes,
        decisions: decisionsCtx?.decisions ?? [],
        outcomeId,
        loopImpacts: listLoopImpacts(),
      }),
    [snapshot, dashboard.outcomes, decisionsCtx?.decisions, outcomeId],
  );

  const entryActive = useEntryFocus(model.focusSection);

  return (
    <div
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 pb-16"
      data-strategy-workspace="true"
      data-exs="1.0"
      data-outcomes="1.0"
      data-council="1.0"
      aria-label="Strategy Workspace"
    >
      <StrategyHeader
        health={model.orgHealth}
        entryLabel={entryArrivalLabel(model.entry)}
      />

      {outcomesView.focus ? (
        <OutcomeContextStrip context={outcomesView.focus} />
      ) : null}

      <CouncilBriefStrip
        brief={council.brief}
        decisionTitle={council.decisionTitle}
        outcomeName={council.outcomeName}
      />

      <OrgHealthSummary
        health={model.orgHealth}
        focused={entryActive && model.focusSection === "organisation-health"}
      />

      <OutcomePortfolio
        outcomes={model.outcomes}
        focused={entryActive && model.focusSection === "outcome-portfolio"}
      />

      {outcomesView.health ? (
        <OutcomeHealthPanel health={outcomesView.health} />
      ) : null}

      <OutcomeRelationships items={outcomesView.relationships} />

      <BusinessDrivers
        drivers={model.drivers}
        focused={entryActive && model.focusSection === "business-drivers"}
        highlightDriverId={entryActive ? model.highlightDriverId : null}
      />

      <KeyRisks risks={model.risks} />
      <Opportunities opportunities={model.opportunities} />

      <RecommendedDecisions
        decisions={model.decisions}
        focused={
          entryActive && model.focusSection === "recommended-decisions"
        }
      />

      <RelatedKnowledge items={model.knowledge} />
      <OutcomeTimeline events={outcomesView.timeline} />
    </div>
  );
}
