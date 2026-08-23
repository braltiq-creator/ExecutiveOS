import type { SnapshotAction } from "@/lib/snapshot/types";
import type { EvidenceSource, ReasoningStep } from "@/trust/framework/types";

/** Build the interactive decision-path steps for an explanation. */
export function buildReasoningPath(input: {
  action: SnapshotAction;
  evidence: EvidenceSource[];
  expectedOutcome: string;
}): ReasoningStep[] {
  const { action, evidence, expectedOutcome } = input;
  const events = evidence
    .map((e) => e.businessEvent ?? e.label)
    .filter(Boolean)
    .slice(0, 3);

  return [
    {
      id: "question",
      label: "Question",
      summary:
        action.businessQuestion ??
        `What should leadership do about: ${action.title}?`,
    },
    {
      id: "evidence",
      label: "Evidence collected",
      summary:
        evidence.length > 0
          ? `${evidence.length} source(s) referenced`
          : "Baseline rationale from Core",
      detail: evidence
        .slice(0, 3)
        .map((e) => e.label)
        .join(" · "),
      evidenceIds: evidence.map((e) => e.id),
    },
    {
      id: "business_events",
      label: "Business events",
      summary:
        events.length > 0
          ? events.join(" · ")
          : action.why,
    },
    {
      id: "scenario",
      label: "Scenario evaluation",
      summary: action.scenarioName
        ? `Evaluated against ${action.scenarioName}`
        : "No scenario pack attached — general executive judgement",
      detail: action.scenarioId ?? undefined,
    },
    {
      id: "strategic_outcome",
      label: "Strategic outcome alignment",
      summary: action.supportsOutcome
        ? `Supports ${action.supportsOutcome}`
        : "Awaiting explicit strategic outcome linkage",
      detail: action.expectedImpact,
    },
    {
      id: "council",
      label: "Council reasoning",
      summary:
        "Council perspectives available in supporting context when enabled for this workspace",
    },
    {
      id: "recommendation",
      label: "Recommendation",
      summary: action.title,
      detail: action.why,
    },
    {
      id: "expected_outcome",
      label: "Expected business outcome",
      summary: expectedOutcome,
    },
  ];
}
