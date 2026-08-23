import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type {
  InitiativeSimulationScore,
  StrategicInitiative,
} from "@/initiatives/models/types";
import { planStrategicInitiatives } from "@/initiatives/planner/plan";

export type InitiativeSimulationResult = {
  scenarioId: string;
  initiatives: StrategicInitiative[];
  scores: InitiativeSimulationScore;
  perInitiative: Array<{
    initiativeId: string;
    title: string;
    strategicEffectiveness: number;
    outcomeAchievement: number;
    executiveCoordination: number;
    decisionQuality: number;
    alignment: number;
    interventionEffectiveness: number;
    businessImpact: number;
  }>;
};

/**
 * Reality Lab — evaluate strategic initiative quality for a scenario.
 */
export function simulateInitiativesForScenario(input: {
  scenarioId: string;
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  initiatives?: StrategicInitiative[];
}): InitiativeSimulationResult {
  const initiatives =
    input.initiatives ??
    planStrategicInitiatives({
      snapshot: input.snapshot,
      twin: input.twin,
    });

  const perInitiative = initiatives.map((initiative) =>
    scoreInitiative(initiative, input.snapshot),
  );

  const avg = (
    key: keyof (typeof perInitiative)[number],
  ): number =>
    perInitiative.length === 0
      ? 0
      : Math.round(
          perInitiative.reduce((s, row) => s + (row[key] as number), 0) /
            perInitiative.length,
        );

  const scores: InitiativeSimulationScore = {
    strategicEffectiveness: avg("strategicEffectiveness"),
    outcomeAchievement: avg("outcomeAchievement"),
    executiveCoordination: avg("executiveCoordination"),
    decisionQuality: avg("decisionQuality"),
    alignment: avg("alignment"),
    interventionEffectiveness: avg("interventionEffectiveness"),
    businessImpact: avg("businessImpact"),
    overall: 0,
    notes: [],
  };
  scores.overall = Math.round(
    scores.strategicEffectiveness * 0.2 +
      scores.outcomeAchievement * 0.15 +
      scores.executiveCoordination * 0.15 +
      scores.decisionQuality * 0.15 +
      scores.alignment * 0.15 +
      scores.interventionEffectiveness * 0.1 +
      scores.businessImpact * 0.1,
  );

  if (scores.overall >= 60) {
    scores.notes.push(
      "Strategic initiatives meet Reality Lab bar for executive coordination.",
    );
  } else {
    scores.notes.push(
      "Initiative set needs stronger outcome links or council coordination.",
    );
  }
  if (initiatives.every((i) => i.operationalSystems.some((s) => s.system !== "none"))) {
    scores.notes.push(
      "Execution systems are referenced without owning tasks in ExecutiveOS.",
    );
  }

  return { scenarioId: input.scenarioId, initiatives, scores, perInitiative };
}

function scoreInitiative(
  initiative: StrategicInitiative,
  snapshot: IntelligentExecutiveSnapshot,
): InitiativeSimulationResult["perInitiative"][number] {
  const hasOutcomes = initiative.relatedOutcomeIds.length > 0;
  const hasDecisions = initiative.relatedDecisionIds.length > 0;
  const hasFutures = initiative.relatedFutureIds.length > 0;
  const hasDisagreement = initiative.coordination.disagreements.length > 0;
  const councilSize = initiative.coordination.perspectives.length;
  const hasGovernance =
    initiative.governance.executiveCheckpoints.length > 0 &&
    initiative.governance.councilReviewTriggers.length > 0;
  const outcomeLinked = initiative.successMeasures.some(
    (m) => m.linkedOutcomeIds.length > 0,
  );
  const notTaskList =
    !/task|ticket|sprint backlog/i.test(initiative.businessObjective) &&
    initiative.explanation.whatExecutiveOSOwns.includes("Strategic intent");

  const strategicEffectiveness = clamp(
    40 +
      (hasFutures ? 12 : 0) +
      (hasGovernance ? 12 : 0) +
      (notTaskList ? 15 : 0) +
      initiative.completionCriteria.length * 4,
    0,
    100,
  );

  const outcomeAchievement = clamp(
    35 +
      (hasOutcomes ? 20 : 0) +
      (outcomeLinked ? 15 : 0) +
      (initiative.progress === "on_track" || initiative.progress === "mobilising"
        ? 10
        : 0),
    0,
    100,
  );

  const executiveCoordination = clamp(
    30 +
      councilSize * 5 +
      (hasDisagreement ? 12 : 0) +
      (initiative.supportingCouncilMembers.length >= 2 ? 10 : 0),
    0,
    100,
  );

  const decisionQuality = clamp(
    35 +
      (hasDecisions ? 25 : 8) +
      initiative.dependencies.filter((d) => d.kind === "decision_point").length *
        10 +
      (snapshot.judgementBriefs?.length ? 8 : 0),
    0,
    100,
  );

  const alignment = clamp(
    40 +
      (initiative.strategicAlignment.length > 20 ? 15 : 0) +
      (hasFutures ? 10 : 0) +
      initiative.businessDrivers.length * 4,
    0,
    100,
  );

  const interventionEffectiveness = clamp(
    40 +
      initiative.leadingIndicators.length * 8 +
      (initiative.attentionRequired ? 6 : 0) +
      (initiative.governance.decisionMilestones.length > 0 ? 10 : 0),
    0,
    100,
  );

  const businessImpact = clamp(
    40 +
      (initiative.priority === "critical" ? 15 : initiative.priority === "high" ? 10 : 4) +
      (hasOutcomes ? 12 : 0) +
      initiative.successMeasures.length * 5,
    0,
    100,
  );

  return {
    initiativeId: initiative.id,
    title: initiative.title,
    strategicEffectiveness,
    outcomeAchievement,
    executiveCoordination,
    decisionQuality,
    alignment,
    interventionEffectiveness,
    businessImpact,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
