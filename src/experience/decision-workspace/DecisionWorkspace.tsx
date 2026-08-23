"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDecisions } from "@/components/providers/DecisionProvider";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import { useExperienceData } from "@/experience/executive-brief/useExperienceData";
import { useEntryFocus } from "@/experience/exs";
import {
  buildDecisionWorkspaceView,
  decisionEntryLabel,
} from "@/experience/decision-workspace/derive";
import { DecisionHeader } from "@/experience/decision-workspace/DecisionHeader";
import { DecisionPortfolio } from "@/experience/decision-workspace/DecisionPortfolio";
import { HighestImpact } from "@/experience/decision-workspace/HighestImpact";
import { ImpactSimulator } from "@/experience/decision-workspace/ImpactSimulator";
import {
  DecisionTimeline,
  Dependencies,
  RelatedKnowledge,
  RelatedStrategy,
  Stakeholders,
  SupportingEvidence,
} from "@/experience/decision-workspace/DecisionSections";
import {
  buildOutcomesEngineView,
  OutcomeContextStrip,
  OutcomeImpactPanel,
} from "@/experience/outcomes-engine";
import { listLoopImpacts } from "@/experience/executive-loop";
import {
  buildExecutiveCouncilView,
  CouncilConsensusPanel,
  CouncilDiscussionPanel,
  CouncilLearningPanel,
  CouncilOpinionPanel,
} from "@/experience/executive-council";
import {
  buildExecutiveRhythmView,
  MeetingPackPanel,
} from "@/experience/executive-rhythm";
import { ExecutiveDecisionPaperView } from "@/experience/decision-readiness";
import { buildManufacturingDecisionPaper } from "@/executive-snapshot-studio/intelligence/manufacturing-decision-frame";
import type { ActiveExecutiveSnapshotContext } from "@/executive-snapshot-studio/launch";

/**
 * Decision Workspace — second Executive Workspace.
 * Judgement that improves strategic outcomes. EXS inherited from Today/Strategy.
 */
export function DecisionWorkspace() {
  const searchParams = useSearchParams();
  const { decisions } = useDecisions();
  const { portfolio } = useOutcomes();
  const { snapshot, strategicOutcomes, mode, activeSnapshot } =
    useExperienceData();

  const entryFrom = searchParams.get("from");
  const selectParam = searchParams.get("select");
  const outcomeParam = searchParams.get("outcome");
  const [selectedId, setSelectedId] = useState<string | null>(selectParam);

  useEffect(() => {
    setSelectedId(selectParam);
  }, [selectParam]);

  if (!snapshot) {
    return (
      <div
        className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 pb-16 pt-8"
        data-decision-workspace="loading"
        aria-label="Decision Workspace"
      >
        <p className="exds-editorial-label">Decision Workspace</p>
        <p className="eos-type-body text-[var(--eos-color-text-secondary)]">
          {mode === "loading"
            ? "Preparing executive context…"
            : "Executive Snapshot unavailable. Re-open from Snapshot Studio."}
        </p>
      </div>
    );
  }

  return (
    <DecisionWorkspaceReady
      snapshot={snapshot}
      strategicOutcomes={strategicOutcomes}
      decisions={decisions}
      portfolioOutcomes={portfolio.outcomes}
      entryFrom={entryFrom}
      outcomeParam={outcomeParam}
      selectedId={selectedId}
      onSelect={setSelectedId}
      activeSnapshot={activeSnapshot}
    />
  );
}

function DecisionWorkspaceReady({
  snapshot,
  strategicOutcomes,
  decisions,
  portfolioOutcomes,
  entryFrom,
  outcomeParam,
  selectedId,
  onSelect,
  activeSnapshot,
}: {
  snapshot: NonNullable<ReturnType<typeof useExperienceData>["snapshot"]>;
  strategicOutcomes: ReturnType<typeof useExperienceData>["strategicOutcomes"];
  decisions: ReturnType<typeof useDecisions>["decisions"];
  portfolioOutcomes: ReturnType<typeof useOutcomes>["portfolio"]["outcomes"];
  entryFrom: string | null;
  outcomeParam: string | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  activeSnapshot: ActiveExecutiveSnapshotContext | null;
}) {
  const view = useMemo(
    () =>
      buildDecisionWorkspaceView({
        decisions,
        snapshot,
        outcomes: portfolioOutcomes,
        strategicOutcomes,
        entryFrom,
        selectId: selectedId,
      }),
    [
      decisions,
      snapshot,
      portfolioOutcomes,
      strategicOutcomes,
      entryFrom,
      selectedId,
    ],
  );

  const manufacturingPaper = useMemo(() => {
    if (!activeSnapshot?.manufacturingAnalysis) return null;
    return buildManufacturingDecisionPaper(
      activeSnapshot.manufacturingAnalysis,
      activeSnapshot.manufacturingBrief,
    );
  }, [activeSnapshot]);

  const liveManufacturingDecision = useMemo(() => {
    if (!manufacturingPaper?.decisionId) return null;
    return (
      decisions.find((d) => d.id === manufacturingPaper.decisionId) ?? null
    );
  }, [decisions, manufacturingPaper?.decisionId]);

  const isManufacturing = Boolean(activeSnapshot?.manufacturingAnalysis);

  const outcomesView = useMemo(
    () =>
      buildOutcomesEngineView({
        strategicOutcomes,
        snapshot,
        decisions,
        loopImpacts: listLoopImpacts(),
        outcomeId: outcomeParam,
        workspace: "decision",
      }),
    [strategicOutcomes, snapshot, decisions, outcomeParam],
  );

  const council = useMemo(
    () =>
      buildExecutiveCouncilView({
        snapshot,
        strategicOutcomes,
        decisions,
        selectedDecisionId: view.selectedId,
        outcomeId: outcomeParam,
        loopImpacts: listLoopImpacts(),
      }),
    [
      snapshot,
      strategicOutcomes,
      decisions,
      view.selectedId,
      outcomeParam,
    ],
  );

  const rhythm = useMemo(
    () =>
      buildExecutiveRhythmView({
        snapshot,
        strategicOutcomes,
        decisions,
        observations: council.agency.observations,
        loopImpacts: listLoopImpacts(),
        outcomeId: outcomeParam,
      }),
    [
      snapshot,
      strategicOutcomes,
      decisions,
      council.agency.observations,
      outcomeParam,
    ],
  );

  const entryActive = useEntryFocus(view.focusSection);

  return (
    <div
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 pb-16"
      data-decision-workspace="true"
      data-exs="1.0"
      data-outcomes="1.0"
      data-council="1.0"
      data-decision-readiness={isManufacturing ? "phase-60" : undefined}
      data-experience-module={
        isManufacturing ? "manufacturing_forecasting" : undefined
      }
      aria-label="Decision Workspace"
    >
      <DecisionHeader
        entryLabel={decisionEntryLabel(view.entry)}
        decisionCount={view.portfolio.length}
      />

      {manufacturingPaper ? (
        <ExecutiveDecisionPaperView
          paper={manufacturingPaper}
          interactive
          liveDecision={liveManufacturingDecision}
          actor="Executive"
        />
      ) : null}

      {outcomesView.focus && !isManufacturing ? (
        <OutcomeContextStrip context={outcomesView.focus} />
      ) : null}

      <DecisionPortfolio
        cards={view.portfolio}
        selectedId={view.selectedId}
        focused={entryActive && view.focusSection === "decision-portfolio"}
        onSelect={onSelect}
      />

      <HighestImpact
        card={view.highestImpact}
        focused={entryActive && view.focusSection === "highest-impact"}
        onFocus={onSelect}
      />

      {!isManufacturing ? (
        <ImpactSimulator
          simulator={view.simulator}
          focused={entryActive && view.focusSection === "impact-simulator"}
        />
      ) : null}

      {!isManufacturing ? (
        <MeetingPackPanel pack={rhythm.pack} learning={rhythm.learning} />
      ) : null}

      {!isManufacturing ? (
        <>
          <CouncilOpinionPanel view={council} />
          <CouncilDiscussionPanel
            observations={council.agency.observations}
            collaborations={council.agency.collaborations}
            consensus={council.agency.agencyConsensus}
            learning={council.agency.discussionLearning}
          />
          <CouncilConsensusPanel consensus={council.consensus} />
          {council.learning ? (
            <CouncilLearningPanel learning={council.learning} />
          ) : null}
        </>
      ) : (
        <section
          className="rounded-[var(--eos-radius-md)] border px-5 py-4"
          style={{ borderColor: "var(--exds-electric-border)" }}
          data-council-integrity="not-established"
          aria-label="Council"
        >
          <p className="exds-editorial-label">Council</p>
          <p className="mt-2 text-[length:0.95rem] text-[var(--eos-color-text-secondary)]">
            Council position not yet established.
          </p>
          <p className="eos-type-caption mt-1 text-[var(--eos-color-text-muted)]">
            CEO · CFO · COO · CRO · CSO — seat-level positions require evidence.
          </p>
        </section>
      )}

      {outcomesView.impact && !isManufacturing ? (
        <OutcomeImpactPanel impact={outcomesView.impact} />
      ) : null}

      <SupportingEvidence items={view.evidence} />
      <Stakeholders items={view.stakeholders} />
      <Dependencies items={view.dependencies} />

      <RelatedStrategy
        items={view.relatedStrategy}
        focused={entryActive && view.focusSection === "related-strategy"}
      />

      <RelatedKnowledge items={view.knowledge} />
      <DecisionTimeline items={view.timeline} />
    </div>
  );
}
