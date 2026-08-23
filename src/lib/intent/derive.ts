import type { Decision } from "@/lib/decisions/engine-types";
import type { Outcome, OutcomePortfolio } from "@/lib/outcomes/types";
import type {
  DecisionIntentAlignment,
  ExecutiveIntent,
  IntentContext,
  IntentOutcomeRef,
  OutcomeIntentAlignment,
} from "@/lib/intent/engine-types";

const ALIGNMENT_RANK: Record<OutcomeIntentAlignment, number> = {
  focused: 4,
  watching: 3,
  supporting: 2,
  non_focus: 1,
};

export function getActiveIntent(portfolio: OutcomePortfolio): ExecutiveIntent {
  const intent = portfolio.intent;
  if (!intent) {
    throw new Error("OutcomePortfolio.intent is required for Intent Engine");
  }
  return intent;
}

export function resolveOutcomeAlignment(
  intent: ExecutiveIntent,
  outcomeId: string,
): OutcomeIntentAlignment {
  if (intent.focusOutcomeIds.includes(outcomeId)) return "focused";
  if (intent.watchingOutcomeIds.includes(outcomeId)) return "watching";
  if (intent.nonFocusOutcomeIds.includes(outcomeId)) return "non_focus";
  return "supporting";
}

export function buildIntentContext(
  portfolio: OutcomePortfolio,
): IntentContext {
  const intent = getActiveIntent(portfolio);
  const byId = new Map(
    portfolio.outcomes.map((outcome) => [outcome.id, outcome]),
  );

  return {
    intentId: intent.id,
    title: intent.title,
    narrative: intent.narrative,
    horizon: intent.horizon,
    reviewDate: intent.reviewDate,
    reviewCadence: intent.reviewCadence,
    priority: intent.priority,
    status: intent.status,
    focusOutcomes: intent.focusOutcomeIds
      .map((id) => {
        const outcome = byId.get(id);
        return outcome ? { id: outcome.id, name: outcome.name } : null;
      })
      .filter((item): item is { id: string; name: string } => item !== null),
    constraints: intent.constraints,
  };
}

export function resolveIntentOutcomeSets(portfolio: OutcomePortfolio): {
  focusOutcomes: IntentOutcomeRef[];
  watchingOutcomes: IntentOutcomeRef[];
  supportingOutcomes: IntentOutcomeRef[];
  nonFocusOutcomes: IntentOutcomeRef[];
} {
  const intent = getActiveIntent(portfolio);

  const toRef = (outcome: Outcome): IntentOutcomeRef => ({
    id: outcome.id,
    name: outcome.name,
    alignment: resolveOutcomeAlignment(intent, outcome.id),
    healthScore: outcome.healthScore,
    status: outcome.status,
  });

  const focusOutcomes: IntentOutcomeRef[] = [];
  const watchingOutcomes: IntentOutcomeRef[] = [];
  const supportingOutcomes: IntentOutcomeRef[] = [];
  const nonFocusOutcomes: IntentOutcomeRef[] = [];

  for (const outcome of portfolio.outcomes) {
    const ref = toRef(outcome);
    switch (ref.alignment) {
      case "focused":
        focusOutcomes.push(ref);
        break;
      case "watching":
        watchingOutcomes.push(ref);
        break;
      case "non_focus":
        nonFocusOutcomes.push(ref);
        break;
      default:
        supportingOutcomes.push(ref);
    }
  }

  return {
    focusOutcomes,
    watchingOutcomes,
    supportingOutcomes,
    nonFocusOutcomes,
  };
}

function strongestAlignment(
  alignments: OutcomeIntentAlignment[],
): OutcomeIntentAlignment {
  if (alignments.length === 0) return "supporting";
  return alignments.reduce((best, current) =>
    ALIGNMENT_RANK[current] > ALIGNMENT_RANK[best] ? current : best,
  );
}

export function alignDecisionToIntent(
  portfolio: OutcomePortfolio,
  decision: Decision,
): DecisionIntentAlignment {
  const intent = getActiveIntent(portfolio);
  const byId = new Map(
    portfolio.outcomes.map((outcome) => [outcome.id, outcome]),
  );

  const viaOutcomeIds = decision.outcomeIds.filter((id) => byId.has(id));
  const viaOutcomeNames = viaOutcomeIds.map(
    (id) => byId.get(id)?.name ?? id,
  );
  const alignments = viaOutcomeIds.map((id) =>
    resolveOutcomeAlignment(intent, id),
  );
  const alignment = strongestAlignment(alignments);

  const explanation =
    alignment === "focused"
      ? `Supports strategic focus through ${viaOutcomeNames.join(", ")}.`
      : alignment === "watching"
        ? `Touches watched outcomes: ${viaOutcomeNames.join(", ")}.`
        : alignment === "non_focus"
          ? `Linked outcomes are outside current focus: ${viaOutcomeNames.join(", ")}.`
          : `Supports the portfolio through ${viaOutcomeNames.join(", ")}.`;

  return {
    intentId: intent.id,
    intentTitle: intent.title,
    alignment,
    viaOutcomeIds,
    viaOutcomeNames,
    explanation,
  };
}

export function assertIntentOutcomeRefs(portfolio: OutcomePortfolio): void {
  const intent = getActiveIntent(portfolio);
  const known = new Set(portfolio.outcomes.map((outcome) => outcome.id));
  const all = [
    ...intent.focusOutcomeIds,
    ...intent.watchingOutcomeIds,
    ...intent.nonFocusOutcomeIds,
  ];
  for (const id of all) {
    if (!known.has(id)) {
      throw new Error(`Intent references unknown outcome: ${id}`);
    }
  }
}
