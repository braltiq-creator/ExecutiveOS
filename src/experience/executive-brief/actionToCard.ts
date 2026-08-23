import type { SnapshotAction } from "@/lib/snapshot/types";
import type { ExperienceCardModel } from "@/experience/cards";

/** Map a Core recommendation into the five-question + trust executive card. */
export function actionToExperienceCard(
  action: SnapshotAction,
  tenantId?: string,
): ExperienceCardModel {
  const evidence = [
    ...(action.evidenceSummary ?? []),
    ...(action.strategyEvidence ?? []),
    ...(action.evidence ?? []),
  ]
    .filter((item, index, all) => all.indexOf(item) === index)
    .slice(0, 3)
    .join(" · ");

  const memory = action.memorySummary?.[0]
    ? action.memorySummary[0]
    : action.previousSituations?.[0]
      ? [
          action.previousSituations[0],
          action.lessonsLearned?.[0],
          typeof action.similarityConfidence === "number"
            ? `${action.similarityConfidence}% similar`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : undefined;

  const supportParts = [
    action.scenarioName ? `Scenario: ${action.scenarioName}` : null,
    action.businessQuestion ? `Answers: ${action.businessQuestion}` : null,
    evidence ? `Evidence: ${evidence}` : null,
    memory ? `Memory: ${memory}` : null,
    action.adaptiveExplanation
      ? `Adaptive: ${action.adaptiveExplanation}`
      : null,
  ].filter(Boolean);

  return {
    id: action.id,
    title: action.title,
    href: action.href,
    why: action.why,
    support:
      supportParts.length > 0
        ? supportParts.join(" · ")
        : action.expectedOutcome,
    action: action.expectedImpact ?? action.expectedOutcome,
    expectedImpact: action.expectedImpact ?? action.expectedOutcome,
    ignoreRisk: action.potentialRisk,
    strategicOutcome: action.supportsOutcome
      ? typeof action.estimatedContribution === "number"
        ? `${action.supportsOutcome} (~${action.estimatedContribution}% contribution)`
        : action.supportsOutcome
      : undefined,
    confidence: action.confidence ?? action.strategyConfidence,
    badge: action.adaptivePresentationHint
      ? "Adapted"
      : action.confidenceBand
        ? `${action.confidenceBand} confidence`
        : action.scenarioName
          ? "Recommendation"
          : "Action",
    badgeTone:
      action.confidenceBand === "low"
        ? "attention"
        : action.potentialRisk
          ? "attention"
          : "accent",
    trustAction: action.explanationId ? action : undefined,
    tenantId,
  };
}
