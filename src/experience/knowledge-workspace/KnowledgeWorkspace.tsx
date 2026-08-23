"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDecisionsOptional } from "@/components/providers/DecisionProvider";
import { useExperienceData } from "@/experience/executive-brief/useExperienceData";
import { useEntryFocus } from "@/experience/exs";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { listLoopImpacts } from "@/experience/executive-loop";
import {
  buildIntelligenceScore,
  IntelligenceDiagnostics,
} from "@/experience/intelligence-engine";
import {
  buildOutcomesEngineView,
  OutcomeContextStrip,
} from "@/experience/outcomes-engine";
import {
  buildExecutiveCouncilView,
  CouncilBriefStrip,
} from "@/experience/executive-council";
import {
  buildKnowledgeWorkspaceView,
  knowledgeEntryLabel,
} from "@/experience/knowledge-workspace/derive";
import { KnowledgeHeader } from "@/experience/knowledge-workspace/KnowledgeHeader";
import {
  ConfidencePanel,
  EvidenceStack,
  ExecutiveAnswer,
  ExecutiveQuestion,
  KnowledgeRelationships,
  KnowledgeTimeline,
  RelatedLinks,
  SourceExplorer,
} from "@/experience/knowledge-workspace/KnowledgeSections";

function KnowledgeWorkspaceInner() {
  const { snapshot, strategicOutcomes, mode } = useExperienceData();

  if (!snapshot) {
    return (
      <div
        className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 pb-16"
        data-knowledge-workspace="loading"
        aria-label="Knowledge Workspace"
      >
        <p className="exs-body text-[length:0.85rem]">
          {mode === "loading"
            ? "Preparing executive context…"
            : "Executive Snapshot unavailable. Re-open from Snapshot Studio."}
        </p>
      </div>
    );
  }

  return (
    <KnowledgeWorkspaceReady
      snapshot={snapshot}
      strategicOutcomes={strategicOutcomes}
    />
  );
}

function KnowledgeWorkspaceReady({
  snapshot,
  strategicOutcomes,
}: {
  snapshot: NonNullable<ReturnType<typeof useExperienceData>["snapshot"]>;
  strategicOutcomes: ReturnType<typeof useExperienceData>["strategicOutcomes"];
}) {
  const searchParams = useSearchParams();
  const decisionsCtx = useDecisionsOptional();
  const entryFrom = searchParams.get("from");
  const topic = searchParams.get("topic");
  const outcomeId = searchParams.get("outcome");

  const view = useMemo(
    () =>
      buildKnowledgeWorkspaceView({
        snapshot,
        decisions: decisionsCtx?.decisions ?? [],
        strategicOutcomes,
        loopImpacts: listLoopImpacts(),
        entryFrom,
        topic,
      }),
    [snapshot, decisionsCtx?.decisions, strategicOutcomes, entryFrom, topic],
  );

  const intelligenceScore = useMemo(
    () =>
      buildIntelligenceScore({
        snapshot,
        decisions: decisionsCtx?.decisions ?? [],
        strategicOutcomes,
        loopImpacts: listLoopImpacts(),
      }),
    [snapshot, decisionsCtx?.decisions, strategicOutcomes],
  );

  const outcomesView = useMemo(
    () =>
      buildOutcomesEngineView({
        strategicOutcomes,
        snapshot,
        decisions: decisionsCtx?.decisions ?? [],
        loopImpacts: listLoopImpacts(),
        outcomeId,
        workspace: "knowledge",
      }),
    [strategicOutcomes, snapshot, decisionsCtx?.decisions, outcomeId],
  );

  const council = useMemo(
    () =>
      buildExecutiveCouncilView({
        snapshot,
        strategicOutcomes,
        decisions: decisionsCtx?.decisions ?? [],
        outcomeId,
        loopImpacts: listLoopImpacts(),
      }),
    [snapshot, strategicOutcomes, decisionsCtx?.decisions, outcomeId],
  );

  const entryActive = useEntryFocus(view.focusSection);
  const showDiagnostics = view.entry === "intelligence";

  return (
    <div
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 pb-16"
      data-knowledge-workspace="true"
      data-exs="1.0"
      data-outcomes="1.0"
      data-council="1.0"
      aria-label="Knowledge Workspace"
    >
      <KnowledgeHeader entryLabel={knowledgeEntryLabel(view.entry)} />

      {outcomesView.focus ? (
        <OutcomeContextStrip context={outcomesView.focus} />
      ) : null}

      <CouncilBriefStrip
        brief={council.brief}
        decisionTitle={council.decisionTitle}
        outcomeName={council.outcomeName}
      />

      <ExecutiveQuestion
        question={view.question}
        focused={entryActive && view.focusSection === "executive-question"}
      />

      <ExecutiveAnswer
        answer={view.answer}
        focused={entryActive && view.focusSection === "executive-answer"}
      />

      {showDiagnostics ? (
        <IntelligenceDiagnostics
          score={intelligenceScore}
          focused={
            entryActive && view.focusSection === "intelligence-diagnostics"
          }
        />
      ) : null}

      <ConfidencePanel
        confidence={view.confidence}
        focused={entryActive && view.focusSection === "confidence"}
      />

      <EvidenceStack
        items={view.evidence}
        focused={entryActive && view.focusSection === "evidence-stack"}
      />

      <KnowledgeRelationships items={view.relationships} />

      <RelatedLinks
        id="related-strategy"
        label="Related Strategy"
        icon={EXECUTIVE_ICONS.strategy}
        items={view.relatedStrategy}
        openLabel="Open Strategy →"
        focused={entryActive && view.focusSection === "related-strategy"}
      />

      <RelatedLinks
        id="related-decisions"
        label="Related Decisions"
        icon={EXECUTIVE_ICONS.decisions}
        items={view.relatedDecisions}
        openLabel="Open Decisions →"
      />

      <RelatedLinks
        id="related-activity"
        label="Related Activity"
        icon={EXECUTIVE_ICONS.activity}
        items={view.relatedActivity}
        openLabel="Open →"
        focused={entryActive && view.focusSection === "related-activity"}
      />

      <SourceExplorer items={view.sources} />
      <KnowledgeTimeline items={view.timeline} />
    </div>
  );
}

/**
 * Knowledge Workspace — third Executive Workspace.
 * Organisational evidence engine. EXS inherited from Today / Strategy / Decision.
 */
export function KnowledgeWorkspace() {
  return (
    <Suspense fallback={<KnowledgeFallback />}>
      <KnowledgeWorkspaceInner />
    </Suspense>
  );
}

function KnowledgeFallback() {
  return (
    <div
      className="mx-auto w-full max-w-[1200px] space-y-4 pb-16"
      aria-hidden="true"
    >
      <div className="ex-skeleton h-24 w-full" />
      <div className="ex-skeleton h-40 w-full" />
      <div className="ex-skeleton h-32 w-full" />
    </div>
  );
}
