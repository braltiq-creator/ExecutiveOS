/**
 * Operating Loop validation — every event must flow through the executive loop
 * without manual intervention.
 *
 * Command Centre → Strategy → Decision → Knowledge → Council → Outcome → Learning → Brief
 */

import {
  buildActivityFeed,
  buildExecutivePulse,
  buildMissionKpis,
  missionHeaderModel,
} from "@/experience/mission-control/derive";
import { buildStrategyWorkspaceModel } from "@/experience/strategy-workspace/derive";
import { buildDecisionWorkspaceView } from "@/experience/decision-workspace/derive";
import { buildKnowledgeWorkspaceView } from "@/experience/knowledge-workspace/derive";
import { buildExecutiveCouncilView } from "@/experience/executive-council/derive";
import { buildOutcomesEngineView } from "@/experience/outcomes-engine/derive";
import { buildExecutiveIntelligenceView } from "@/experience/intelligence-engine/derive";
import { buildExecutiveRhythmView } from "@/experience/executive-rhythm/derive";
import type { ExperienceSurface } from "@/simulation/enterprise/experience-bridge";
import type {
  OperatingLoopStageId,
  OperatingLoopValidation,
  StageValidation,
} from "@/simulation/enterprise/types";

export const OPERATING_LOOP_FLOW: OperatingLoopStageId[] = [
  "command_centre",
  "strategy",
  "decision",
  "knowledge",
  "council",
  "outcome",
  "learning",
  "executive_brief",
];

const STAGE_LABELS: Record<OperatingLoopStageId, string> = {
  command_centre: "Command Centre",
  strategy: "Strategy",
  decision: "Decision",
  knowledge: "Knowledge",
  council: "Council",
  outcome: "Outcome",
  learning: "Learning",
  executive_brief: "Executive Brief",
};

function stage(
  id: OperatingLoopStageId,
  artefactCount: number,
  notes: string[],
): StageValidation {
  const pass = artefactCount > 0 && notes.every((n) => !n.startsWith("FAIL:"));
  return {
    stage: id,
    label: STAGE_LABELS[id],
    pass,
    artefactCount,
    notes,
  };
}

/**
 * Exercise every experience-layer stage against a scenario-stressed surface.
 */
export function validateOperatingLoop(
  surface: ExperienceSurface,
): OperatingLoopValidation {
  const { snapshot, decisions, outcomes, strategicOutcomes, dashboard } =
    surface;

  const valueTrend =
    snapshot.pulse.level === "improving"
      ? ("up" as const)
      : snapshot.pulse.level === "critical" ||
          snapshot.pulse.level === "attention"
        ? ("down" as const)
        : ("flat" as const);

  const kpis = buildMissionKpis({
    snapshot,
    strategicOutcomes,
    monthlyValue: 120_000,
    valueTrend,
    valueConfidence: snapshot.pulse.confidence,
  });
  const pulse = buildExecutivePulse({ snapshot, valueTrend });
  const header = missionHeaderModel(snapshot);
  const feed = buildActivityFeed(snapshot);
  const commandCentre = stage(
    "command_centre",
    kpis.length + feed.length,
    [
      pulse.headline ? `Pulse: ${pulse.headline}` : "FAIL: Missing pulse",
      header.name ? `Greeting ready for ${header.name}` : "FAIL: Missing greeting",
      kpis.length > 0 ? `${kpis.length} KPIs` : "FAIL: No KPIs",
    ],
  );

  const strategyModel = buildStrategyWorkspaceModel({
    dashboard,
    snapshot,
    entryFrom: "today",
  });
  const strategy = stage(
    "strategy",
    strategyModel.outcomes.length + strategyModel.decisions.length,
    [
      strategyModel.orgHealth
        ? "Org health derived"
        : "FAIL: Missing org health",
      strategyModel.outcomes.length > 0
        ? `${strategyModel.outcomes.length} strategy outcomes`
        : "FAIL: No strategy outcomes",
    ],
  );

  const decisionView = buildDecisionWorkspaceView({
    decisions,
    snapshot,
    outcomes,
    strategicOutcomes,
    entryFrom: "priority",
  });
  const decision = stage("decision", decisionView.portfolio.length, [
    decisionView.selectedId
      ? `Selected decision ${decisionView.selectedId}`
      : "FAIL: No selected decision",
    decisionView.portfolio.length > 0
      ? `${decisionView.portfolio.length} queue items`
      : "FAIL: Empty decision portfolio",
    decisionView.simulator
      ? "Impact simulator ready"
      : "FAIL: Missing decision simulator",
  ]);

  const knowledge = buildKnowledgeWorkspaceView({
    snapshot,
    decisions,
    strategicOutcomes,
    entryFrom: "intelligence",
  });
  const knowledgeStage = stage(
    "knowledge",
    knowledge.evidence.length + knowledge.relationships.length + 1,
    [
      knowledge.question ? "Question framed" : "FAIL: Missing knowledge question",
      knowledge.answer?.summary
        ? "Answer present"
        : "FAIL: Missing knowledge answer",
      knowledge.confidence
        ? `Confidence ${knowledge.confidence.score}`
        : "FAIL: Missing confidence",
    ],
  );

  const council = buildExecutiveCouncilView({
    snapshot,
    strategicOutcomes,
    decisions,
  });
  const councilStage = stage(
    "council",
    council.opinions.length + (council.agency?.observations.length ?? 0),
    [
      council.opinions.length === 5
        ? "All five Council members opined"
        : `FAIL: Expected 5 opinions, got ${council.opinions.length}`,
      council.consensus
        ? `Consensus: ${council.consensus.agreementLevel}`
        : "FAIL: Missing consensus",
      council.agency
        ? `Agency observations: ${council.agency.observations.length}`
        : "FAIL: Missing agency",
    ],
  );

  const outcomesView = buildOutcomesEngineView({
    strategicOutcomes,
    snapshot,
    decisions,
    workspace: "today",
  });
  const outcomeStage = stage(
    "outcome",
    outcomesView.portfolio.length + (outcomesView.focus ? 1 : 0),
    [
      outcomesView.portfolio.length > 0
        ? `${outcomesView.portfolio.length} outcome cards`
        : "FAIL: Empty outcome portfolio",
      outcomesView.focus
        ? `Focus: ${outcomesView.focus.name}`
        : "FAIL: No focus outcome",
      outcomesView.health ? "Health panel ready" : "FAIL: Missing health panel",
    ],
  );

  const rhythm = buildExecutiveRhythmView({
    snapshot,
    strategicOutcomes,
    decisions,
    observations: council.agency?.observations,
  });
  const intelligence = buildExecutiveIntelligenceView({
    snapshot,
    decisions,
    strategicOutcomes,
    feed,
  });

  const learningArtefacts =
    (council.learning ? 1 : 0) +
    (council.agency?.discussionLearning ? 1 : 0) +
    (rhythm.learning ? 1 : 0) +
    (rhythm.pack ? 1 : 0);

  const learning = stage("learning", learningArtefacts, [
    rhythm.learning
      ? "Rhythm learning present"
      : "FAIL: Missing rhythm learning",
    rhythm.awareness
      ? `Rhythm awareness: ${rhythm.awareness.headline}`
      : "FAIL: Missing rhythm awareness",
    rhythm.pack
      ? `Meeting pack decisions: ${rhythm.pack.keyDecisions.length}`
      : "FAIL: Missing meeting pack",
    council.learning
      ? "Council learning present"
      : "Council learning deferred (no loop impact yet)",
  ]);

  const brief = stage("executive_brief", intelligence.queue.length + 1, [
    intelligence.brief
      ? `Brief health ${intelligence.brief.healthStatus}`
      : "FAIL: Missing executive brief",
    intelligence.score
      ? `Intelligence score ${intelligence.score.overall}`
      : "FAIL: Missing intelligence score",
    intelligence.queue.length > 0
      ? `Judgement queue ${intelligence.queue.length}`
      : "FAIL: Empty judgement queue",
  ]);

  const stages = [
    commandCentre,
    strategy,
    decision,
    knowledgeStage,
    councilStage,
    outcomeStage,
    learning,
    brief,
  ];

  return {
    pass: stages.every((item) => item.pass),
    stages,
    flow: OPERATING_LOOP_FLOW,
  };
}
