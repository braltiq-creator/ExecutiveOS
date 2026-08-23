import { assessConfidence } from "@/intelligence/executive-intelligence/engines/confidence-engine";
import { buildReasoningGraph } from "@/intelligence/executive-intelligence/engines/reasoning-graph";
import {
  ensureSentence,
  isOpenDecision,
  isUrgentDecision,
  shortLine,
} from "@/intelligence/executive-intelligence/lib/helpers";
import type {
  DecisionPriority,
  EnterpriseDecisionSignal,
  EnterpriseSignals,
  IntelligentDecision,
} from "@/intelligence/executive-intelligence/types";

/**
 * Decision Intelligence Engine — sort by executive importance, never purely by date.
 */
export function deriveDecisionIntelligence(
  signals: EnterpriseSignals,
): IntelligentDecision[] {
  const interpreted = signals.decisions.map((decision) =>
    interpretDecision(decision, signals),
  );

  return interpreted
    .sort((left, right) => right.executiveImportance - left.executiveImportance)
    .map((decision, index) => ({
      ...decision,
      recommendedOrder: index + 1,
    }));
}

function interpretDecision(
  decision: EnterpriseDecisionSignal,
  signals: EnterpriseSignals,
): IntelligentDecision {
  const urgent = isUrgentDecision(decision.status, decision.deadline);
  const open = isOpenDecision(decision.status);
  const linkedOutcomes = signals.outcomes.filter((outcome) =>
    decision.outcomeIds.includes(outcome.id),
  );
  const linkedRisk = linkedOutcomes.filter(
    (outcome) =>
      outcome.status === "at_risk" || outcome.status === "off_track",
  ).length;
  const linkedDecline = linkedOutcomes.filter(
    (outcome) => outcome.yesterdayMovement < 0,
  ).length;

  const urgency = clampImportance(
    (urgent ? 40 : 0) +
      (decision.status === "under_review" ? 18 : 0) +
      (decision.deadline.toLowerCase().includes("tomorrow") ? 12 : 0) +
      linkedDecline * 10,
  );

  const businessImpactScore = clampImportance(
    scoreImpactText(decision.businessImpact) +
      scoreImpactText(decision.costOfDelay) +
      linkedRisk * 14 +
      linkedOutcomes.length * 6,
  );

  const dependencyPenalty = decision.outcomeIds.length > 2 ? 4 : 0;
  const executiveImportance = clampImportance(
    urgency * 0.45 +
      businessImpactScore * 0.4 +
      (open ? 12 : 0) +
      decision.stakeholderCount * 2 -
      dependencyPenalty -
      (decision.status === "approved" || decision.status === "decided" ? 80 : 0),
  );

  const priority = priorityFrom(decision, executiveImportance, urgent, open);
  const estimatedEffortMinutes = estimateEffort(decision);
  const confidence = assessConfidence({
    label: "Decision",
    dataCompleteness: Math.min(95, 55 + decision.evidenceCount * 8),
    freshnessHours: 8,
    sourceAgreement: decision.confidence,
    historicalReliability: Math.max(50, decision.confidence - 5),
    predictionCertainty: Math.max(40, decision.confidence - 12),
    aiReasoningConfidence: Math.max(45, decision.confidence - 8),
  });

  const businessNarrative = ensureSentence(
    open
      ? `${shortLine(decision.why || decision.whatChanged, 18)} Impact: ${shortLine(decision.businessImpact, 10)}`
      : `Judgement on this Decision is recorded — attention shifts to execution.`,
  );

  const graph = buildReasoningGraph({
    id: decision.id,
    question: decision.question,
    whatChanged: [decision.whatChanged].filter(Boolean),
    evidence: [
      {
        id: `${decision.id}-impact`,
        kind: "decision",
        label: "Business impact",
        detail: decision.businessImpact,
        system: "Decision Engine",
      },
      {
        id: `${decision.id}-delay`,
        kind: "risk",
        label: "Cost of delay",
        detail: decision.costOfDelay,
        system: "Decision Engine",
      },
      ...linkedOutcomes.map((outcome) => ({
        id: outcome.id,
        kind: "outcome" as const,
        label: outcome.name,
        detail: `Health ${outcome.healthScore}, ${outcome.status}`,
        system: "Outcome Engine",
      })),
    ],
    systems: decision.systems,
    summary: businessNarrative,
  });

  return {
    id: decision.id,
    question: decision.question,
    priority,
    urgency,
    businessImpactScore,
    executiveImportance,
    dependencies: decision.outcomeIds,
    recommendedOrder: 0,
    estimatedEffortMinutes,
    confidence,
    businessNarrative,
    owner: decision.owner,
    deadline: decision.deadline,
    status: decision.status,
    outcomeIds: decision.outcomeIds,
    reasoning: ensureSentence(
      `Importance ${executiveImportance} from urgency ${urgency}, impact ${businessImpactScore}, and ${linkedOutcomes.length} linked Outcomes — not deadline sort.`,
    ),
    reasoningGraph: graph,
    strategicAlignment: {
      level: "medium",
      label: "Medium Alignment",
      intentScore: 50,
      attentionPriority: executiveImportance,
      matchedPriorities: [],
      reasoning: "Intent pending application.",
    },
  };
}

function priorityFrom(
  decision: EnterpriseDecisionSignal,
  importance: number,
  urgent: boolean,
  open: boolean,
): DecisionPriority {
  if (!open) return "resolved";
  if (urgent || importance >= 70) return "immediate";
  if (importance >= 50 || decision.status === "under_review") return "today";
  if (importance >= 30) return "this_week";
  return "watch";
}

function estimateEffort(decision: EnterpriseDecisionSignal): number {
  let minutes = 8;
  if (decision.status === "due_today") minutes += 4;
  if (decision.stakeholderCount >= 4) minutes += 3;
  if (decision.evidenceCount >= 3) minutes += 2;
  return Math.min(20, minutes);
}

function scoreImpactText(text: string): number {
  const lower = text.toLowerCase();
  let score = 20;
  if (lower.includes("strategic") || lower.includes("board")) score += 16;
  if (lower.includes("$") || lower.includes("arr") || lower.includes("revenue"))
    score += 14;
  if (lower.includes("risk") || lower.includes("delay")) score += 10;
  if (lower.includes("unlock") || lower.includes("block")) score += 8;
  return score;
}

function clampImportance(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
