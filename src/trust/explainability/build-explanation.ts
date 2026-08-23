import type { SnapshotAction } from "@/lib/snapshot/types";
import type {
  AlternativeInterpretation,
  Assumption,
  Explanation,
} from "@/trust/framework/types";
import { collectEvidenceForAction } from "@/trust/evidence/collect";
import { setExplanationEvidence } from "@/trust/evidence/store";
import { explainConfidence } from "@/trust/confidence/explain";
import { buildReasoningPath } from "@/trust/reasoning/build-path";
import { upsertExplanation } from "@/trust/explainability/store";

let explanationSeq = 0;

function nextExplanationId(): string {
  explanationSeq += 1;
  return `expl-${explanationSeq}-${Date.now().toString(36)}`;
}

function buildAssumptions(action: SnapshotAction): Assumption[] {
  const assumptions: Assumption[] = [
    {
      id: "asm-current-signals",
      statement:
        "Current operational and commercial signals remain directionally accurate overnight",
      criticality: "material",
    },
  ];
  if (action.supportsOutcome) {
    assumptions.push({
      id: "asm-outcome-stable",
      statement: `Progress on “${action.supportsOutcome}” remains a near-term executive priority`,
      criticality: "material",
    });
  }
  if (action.scenarioName) {
    assumptions.push({
      id: "asm-scenario-fit",
      statement: `The situation still fits the “${action.scenarioName}” scenario framing`,
      criticality: "supporting",
    });
  }
  return assumptions;
}

function buildAlternatives(action: SnapshotAction): AlternativeInterpretation[] {
  return [
    {
      id: "alt-noise",
      interpretation:
        "What else might explain this? Transient noise or a one-off operational spike rather than a structural issue.",
      evidenceThatWouldChangeConclusion: [
        "Stabilisation of the same metrics across the next two review cycles",
        "Provider confirmation that the signal was a sync anomaly",
      ],
      informationThatWouldIncreaseConfidence: [
        "Independent corroboration from a second provider",
        "Executive confirmation of customer or delivery impact",
      ],
    },
    {
      id: "alt-capacity",
      interpretation: action.potentialRisk
        ? `An alternative reading is that risk (“${action.potentialRisk}”) is already being managed offline.`
        : "Capacity or ownership changes already underway could reduce the urgency of this recommendation.",
      evidenceThatWouldChangeConclusion: [
        "Documented mitigation plan with an accountable owner",
        "Updated outcome health showing material recovery",
      ],
      informationThatWouldIncreaseConfidence: [
        "Calendar or CRM evidence that the mitigation has started",
        "Memory of a prior successful recovery playbook in use",
      ],
    },
  ];
}

export function buildExplanationForAction(input: {
  tenantId: string;
  action: SnapshotAction;
  asOf?: string;
}): Explanation {
  const asOf = input.asOf ?? new Date().toISOString();
  const evidence = collectEvidenceForAction(input.action, asOf);
  const confidence = explainConfidence({
    action: input.action,
    evidence,
  });
  const expectedOutcome =
    input.action.expectedImpact ?? input.action.expectedOutcome;
  const reasoningPath = buildReasoningPath({
    action: input.action,
    evidence,
    expectedOutcome,
  });

  const whyWeBelieveThis = [
    confidence.headline,
    evidence[0] ? `Primary evidence: ${evidence[0].label}` : null,
    input.action.supportsOutcome
      ? `Aligned to ${input.action.supportsOutcome}`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const existingId = input.action.explanationId;
  const explanation: Explanation = {
    id: existingId ?? nextExplanationId(),
    tenantId: input.tenantId,
    recommendationId: input.action.id,
    recommendation: input.action.title,
    executiveQuestion:
      input.action.businessQuestion ??
      `What should leadership do about: ${input.action.title}?`,
    strategicOutcome: input.action.supportsOutcome ?? null,
    strategicOutcomeId: input.action.supportsOutcomeId ?? null,
    scenario: input.action.scenarioName ?? null,
    scenarioId: input.action.scenarioId ?? null,
    evidenceSources: evidence,
    reasoningPath,
    confidence,
    assumptions: buildAssumptions(input.action),
    relatedMemoryEpisodes: input.action.previousSituations ?? [],
    alternativeInterpretations: buildAlternatives(input.action),
    recommendedAction: expectedOutcome,
    expectedOutcome,
    whyItMatters: input.action.why,
    whyWeBelieveThis,
    expectedBusinessImpact: expectedOutcome,
    createdAt: asOf,
    updatedAt: asOf,
  };

  setExplanationEvidence(explanation.id, evidence);
  return upsertExplanation(explanation);
}
