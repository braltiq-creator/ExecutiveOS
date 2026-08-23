import type { FuturesBrief, PossibleFuturesView, FutureView } from "@/futures/models/types";
import { FUTURE_CASE_LABELS } from "@/futures/scenarios/cases";
import { getTimeHorizon } from "@/futures/timelines";
import { INTERVENTION_KIND_LABELS, SPOTLIGHT_LABELS } from "@/futures/labels";

/**
 * Map FuturesBrief → Today presentation model.
 */
export function toPossibleFuturesView(brief: FuturesBrief): PossibleFuturesView {
  const byId = new Map(brief.futures.map((f) => [f.id, f]));

  const spotlights = (
    Object.entries(brief.spotlights) as Array<
      [keyof typeof brief.spotlights, string]
    >
  ).map(([id, futureId]) => {
    const future = byId.get(futureId);
    return {
      id,
      label: SPOTLIGHT_LABELS[id],
      futureId,
      title: future?.title ?? "Future forming",
      oneLiner: future
        ? `${FUTURE_CASE_LABELS[future.caseKind]} · ${future.probability}% plausibility · ${future.confidence}% confidence`
        : "Awaiting evidence",
    };
  });

  const futures: FutureView[] = brief.futures.map((future) => {
    const review = brief.councilReviews.find((r) => r.futureId === future.id);
    return {
      id: future.id,
      title: future.title,
      description: future.description,
      caseKind: future.caseKind,
      caseLabel: FUTURE_CASE_LABELS[future.caseKind],
      probability: future.probability,
      confidence: future.confidence,
      timeHorizonLabel: getTimeHorizon(future.timeHorizon).label,
      whyItExists: future.explanation.whyItExists,
      keyAssumptions: future.keyAssumptions,
      supportingEvidence: future.explanation.evidenceThatSupports,
      weakeningEvidence: future.explanation.evidenceThatWeakens,
      interventions: future.recommendedInterventions.map((item) => ({
        kind: item.kind,
        kindLabel: INTERVENTION_KIND_LABELS[item.kind],
        title: item.title,
        rationale: item.rationale,
      })),
      signals: future.leadingIndicators.map((signal) => ({
        label: signal.label,
        monitor: signal.monitor,
        threshold: signal.threshold,
        escalationTrigger: signal.escalationTrigger,
      })),
      alternativeOutcomes: future.alternativeOutcomes,
      influenceLevers: future.explanation.influenceLevers,
      council:
        review?.perspectives.map((p) => ({
          agent: p.title,
          shortTitle: p.shortTitle,
          agreement: p.agreement,
          summary: p.summary,
          stance: p.stance,
        })) ?? [],
      disagreements: review?.disagreements ?? [],
    };
  });

  return {
    framing: brief.framing,
    spotlights,
    futures,
    closingNote: brief.closingNote,
  };
}
