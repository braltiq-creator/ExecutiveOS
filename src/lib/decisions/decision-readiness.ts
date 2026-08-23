/**
 * Phase 60 — Executive Decision Readiness types.
 * Shared Decision Engine layer — not a manufacturing fork.
 *
 * Evidence → Judgement → Decision framing.
 * ExecutiveOS does not bind the decision.
 */

import type { DecisionAlternative, DecisionTradeOff } from "./engine-types";

/** Whether a material judgement is ready to become an executive decision. */
export type DecisionReadinessClass =
  | "DECISION_READY"
  | "DECISION_REQUIRES_EVIDENCE"
  | "DECISION_REQUIRES_EXECUTIVE_JUDGEMENT"
  | "NOT_DECISION_READY";

export type EvidencePresence =
  | "KNOWN"
  | "DERIVED"
  | "MISSING"
  | "REQUIRES_EXECUTIVE_JUDGEMENT";

export type DecisionEvidenceItem = {
  id: string;
  label: string;
  value: string;
  role:
    | "PRIMARY_SUPPORT"
    | "COUNTER_SIGNAL"
    | "OPERATIONAL_IMPLICATION"
    | "CONTEXT";
  presence: EvidencePresence;
  detail?: string;
};

export type DecisionOptionFrame = DecisionAlternative & {
  /** Explicit: option ≠ recommendation */
  isRecommendation: false;
  tradeOffs: Array<{
    polarity: "upside" | "downside";
    text: string;
    evidenceId?: string;
  }>;
};

export type MissingEvidenceItem = {
  id: string;
  label: string;
  presence: "MISSING" | "REQUIRES_EXECUTIVE_JUDGEMENT";
  whyItWouldHelp: string;
  /** Only listed when absent from the active dataset / coverage. */
  source: "dataset_absent" | "coverage_insufficient" | "not_in_contract";
};

export type ConfidenceSeparation = {
  datasetConfidence: number | null;
  datasetLabel: string;
  judgementConfidence: number | null;
  judgementLabel: string;
  decisionReadiness: DecisionReadinessClass;
  /** Null when not established — never fabricate a percentage. */
  decisionConfidence: number | null;
  decisionConfidenceLabel: string;
};

/**
 * Executive decision paper — presentation model over Decision Engine objects.
 */
export type ExecutiveDecisionPaper = {
  module: "manufacturing_forecasting" | "commercial" | "generic";
  readiness: DecisionReadinessClass;
  readinessExplanation: string;
  /** Portfolio Decision id when linked. */
  decisionId: string | null;
  leadJudgement: string;
  decisionQuestion: string;
  whyNow: string;
  primaryEvidence: DecisionEvidenceItem[];
  counterSignals: DecisionEvidenceItem[];
  operationalImplications: DecisionEvidenceItem[];
  options: DecisionOptionFrame[];
  /** Flattened DecisionTradeOff[] for Decision Engine compatibility. */
  tradeOffs: DecisionTradeOff[];
  missingEvidence: MissingEvidenceItem[];
  executiveJudgementRequired: string;
  confidence: ConfidenceSeparation;
  costOfDelay: string;
  executiveValueStatus: string;
  councilStatus: string;
  selectionRequired: boolean;
  selectionMessage: string;
  href: string;
};

export function readinessLabel(c: DecisionReadinessClass): string {
  switch (c) {
    case "DECISION_READY":
      return "Decision ready";
    case "DECISION_REQUIRES_EVIDENCE":
      return "Requires evidence";
    case "DECISION_REQUIRES_EXECUTIVE_JUDGEMENT":
      return "Requires executive judgement";
    case "NOT_DECISION_READY":
      return "Not decision ready";
  }
}

/**
 * Derive a decision question from an implication / judgement sentence.
 * Presentation transform only — does not invent business content.
 */
export function deriveDecisionQuestion(input: {
  implication?: string | null;
  leadJudgement?: string | null;
  leadModel?: string | null;
}): string {
  const implication = input.implication?.trim();
  if (implication) {
    const whether = implication.match(/^Whether to\s+(.+)$/i);
    if (whether) {
      let rest = whether[1]!.trim().replace(/\.$/, "");
      // "protect X by Y or accepting Z" → "Should X … or should management accept Z?"
      rest = rest.replace(/\bor accepting\b/i, "or should management accept");
      if (!/^should\b/i.test(rest)) {
        rest = `Should ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`;
      }
      if (!rest.endsWith("?")) rest = `${rest}?`;
      return rest.slice(0, 320);
    }
    if (/\?$/.test(implication)) return implication.slice(0, 320);
  }

  const model = input.leadModel ?? "strategic demand";
  if (input.leadJudgement && /above plan/i.test(input.leadJudgement)) {
    return `Should capacity be reallocated to protect ${model} demand, or should management accept potential deferral elsewhere?`.slice(
      0,
      320,
    );
  }
  if (input.leadJudgement && /softening/i.test(input.leadJudgement)) {
    return `Should capacity or inventory posture be adjusted in response to ${model} softening, or should management hold the current plan?`.slice(
      0,
      320,
    );
  }
  return "What executive decision does this manufacturing forecast judgement require?".slice(
    0,
    320,
  );
}
