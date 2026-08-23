/**
 * Judgement factors — what every executive evaluates before choosing posture.
 */

import type { JudgementFactorId } from "@/judgement-framework/types";
import { JUDGEMENT_FACTOR_LABELS } from "@/judgement-framework/types";

export type FactorDefinition = {
  id: JudgementFactorId;
  label: string;
  question: string;
  /** What a high 0–100 value means for intensity */
  highMeans: string;
  /** What a low value means */
  lowMeans: string;
};

export const FACTOR_DEFINITIONS: Record<JudgementFactorId, FactorDefinition> = {
  business_impact: {
    id: "business_impact",
    label: JUDGEMENT_FACTOR_LABELS.business_impact,
    question: "How large is the effect on enterprise results if this is mishandled?",
    highMeans: "Material P&L, franchise, or enterprise consequence",
    lowMeans: "Local or absorbable effect",
  },
  urgency: {
    id: "urgency",
    label: JUDGEMENT_FACTOR_LABELS.urgency,
    question: "How soon must posture change to protect options?",
    highMeans: "Hours to days; delay destroys options",
    lowMeans: "Weeks+; deliberate pace still safe",
  },
  confidence: {
    id: "confidence",
    label: JUDGEMENT_FACTOR_LABELS.confidence,
    question: "How sure is the executive in the current interpretation?",
    highMeans: "Interpretation is stable enough to recommend",
    lowMeans: "Interpretation is provisional — investigate or observe",
  },
  evidence_quality: {
    id: "evidence_quality",
    label: JUDGEMENT_FACTOR_LABELS.evidence_quality,
    question: "How strong and triangulated is the evidence?",
    highMeans: "Multiple sources, timely, decision-grade",
    lowMeans: "Anecdote, lagging, or single-threaded",
  },
  outcome_alignment: {
    id: "outcome_alignment",
    label: JUDGEMENT_FACTOR_LABELS.outcome_alignment,
    question: "How tightly does this bind to committed outcomes?",
    highMeans: "Directly threatens or advances named outcomes",
    lowMeans: "Peripheral to outcome stack",
  },
  strategic_importance: {
    id: "strategic_importance",
    label: JUDGEMENT_FACTOR_LABELS.strategic_importance,
    question: "Does this shape long-term position or capability?",
    highMeans: "Strategy, moat, or future optionality at stake",
    lowMeans: "Tactical / operational only",
  },
  risk: {
    id: "risk",
    label: JUDGEMENT_FACTOR_LABELS.risk,
    question: "How severe is downside if ignored or mishandled?",
    highMeans: "Severe downside — safety, liquidity, compliance, franchise",
    lowMeans: "Limited downside",
  },
  opportunity: {
    id: "opportunity",
    label: JUDGEMENT_FACTOR_LABELS.opportunity,
    question: "How valuable is upside if pursued promptly?",
    highMeans: "Material asymmetric upside",
    lowMeans: "Little incremental upside",
  },
  cost_of_delay: {
    id: "cost_of_delay",
    label: JUDGEMENT_FACTOR_LABELS.cost_of_delay,
    question: "What is lost by waiting another cycle?",
    highMeans: "Waiting is expensive or irreversible",
    lowMeans: "Waiting is cheap; information may improve",
  },
  reversibility: {
    id: "reversibility",
    label: JUDGEMENT_FACTOR_LABELS.reversibility,
    question: "Can the choice be undone cheaply?",
    highMeans: "Highly reversible — safer to move",
    lowMeans: "One-way door — demand more evidence / challenge",
  },
  decision_complexity: {
    id: "decision_complexity",
    label: JUDGEMENT_FACTOR_LABELS.decision_complexity,
    question: "How many coupled variables and trade-offs exist?",
    highMeans: "High complexity — prefer Investigate / Challenge before Recommend",
    lowMeans: "Simple, well-bounded choice",
  },
  stakeholder_impact: {
    id: "stakeholder_impact",
    label: JUDGEMENT_FACTOR_LABELS.stakeholder_impact,
    question: "How exposed are board, customers, people, regulators, partners?",
    highMeans: "Broad or sensitive stakeholder exposure",
    lowMeans: "Narrow internal exposure",
  },
};

/**
 * Intensity contribution: high risk/impact/urgency raise action intensity.
 * High confidence + evidence enable Recommend rather than Investigate.
 * High complexity / low reversibility pull toward Investigate/Challenge.
 */
export function factorIntensityContribution(
  id: JudgementFactorId,
  value: number,
): number {
  const v = clamp(value);
  switch (id) {
    case "business_impact":
    case "urgency":
    case "outcome_alignment":
    case "strategic_importance":
    case "risk":
    case "opportunity":
    case "cost_of_delay":
    case "stakeholder_impact":
      return v;
    case "decision_complexity":
      // Complexity raises need for investigation, not blind escalation
      return v * 0.65;
    case "reversibility":
      // Low reversibility (low value) increases caution intensity via (100-v)
      return 100 - v;
    case "confidence":
    case "evidence_quality":
      // High confidence reduces "unknown-driven" intensity; handled in state selection
      return (100 - v) * 0.5;
    default:
      return v;
  }
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
