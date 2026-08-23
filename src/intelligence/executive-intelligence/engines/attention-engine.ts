import { ensureSentence } from "@/intelligence/executive-intelligence/lib/helpers";
import type {
  AttentionAllocation,
  AttentionItem,
  CapacityResult,
  IntelligentDecision,
  IntelligentOutcome,
  IntelligentRecommendation,
} from "@/intelligence/executive-intelligence/types";

/**
 * Attention Engine — scarce executive attention budget.
 * Only the highest-value items surface on Today.
 */
export function allocateAttention(input: {
  capacity: CapacityResult;
  decisions: IntelligentDecision[];
  outcomes: IntelligentOutcome[];
  recommendations: IntelligentRecommendation[];
}): AttentionAllocation {
  const budgetMinutes = budgetFromCapacity(input.capacity);
  const candidates: AttentionItem[] = [];

  for (const decision of input.decisions) {
    if (decision.priority === "resolved") continue;
    candidates.push({
      id: decision.id,
      kind: "decision",
      label: decision.question,
      href: `/decisions/${decision.id}`,
      attentionValue:
        decision.strategicAlignment?.attentionPriority ??
        decision.executiveImportance,
      estimatedMinutes: decision.estimatedEffortMinutes,
      why: decision.reasoning,
      relatedIds: decision.outcomeIds,
      strategicAlignment: decision.strategicAlignment,
    });
  }

  for (const outcome of input.outcomes) {
    const business =
      (outcome.status === "off_track" ? 70 : outcome.status === "at_risk" ? 55 : 25) +
      (outcome.momentum === "drifting" ? 20 : 0) +
      Math.max(0, 40 - outcome.healthScore / 3);
    const value =
      outcome.strategicAlignment?.attentionPriority ?? Math.round(business);
    candidates.push({
      id: outcome.id,
      kind: "outcome",
      label: outcome.shortName,
      href: `/outcomes/${outcome.id}`,
      attentionValue: Math.round(value),
      estimatedMinutes: 4,
      why: outcome.reasoning,
      relatedIds: [],
      strategicAlignment: outcome.strategicAlignment,
    });
  }

  for (const recommendation of input.recommendations) {
    candidates.push({
      id: recommendation.id,
      kind: "action",
      label: recommendation.title,
      href: recommendation.href,
      attentionValue: recommendation.attentionValue,
      estimatedMinutes: 5,
      why: recommendation.reason,
      relatedIds: [
        ...recommendation.relatedOutcomeIds,
        ...recommendation.relatedDecisionIds,
      ],
      strategicAlignment: recommendation.strategicAlignment,
    });
  }

  // Risks / opportunities from outcome posture
  for (const outcome of input.outcomes) {
    if (outcome.status === "off_track" || outcome.momentum === "drifting") {
      candidates.push({
        id: `risk-${outcome.id}`,
        kind: "risk",
        label: `${outcome.shortName} risk`,
        href: `/outcomes/${outcome.id}`,
        attentionValue: 60 + (outcome.momentum === "drifting" ? 15 : 0),
        estimatedMinutes: 3,
        why: outcome.lastSignificantChange,
        relatedIds: [outcome.id],
      });
    }
    if (outcome.momentum === "building") {
      candidates.push({
        id: `opp-${outcome.id}`,
        kind: "opportunity",
        label: `${outcome.shortName} opportunity`,
        href: `/outcomes/${outcome.id}`,
        attentionValue: 42,
        estimatedMinutes: 3,
        why: outcome.executiveRecommendation,
        relatedIds: [outcome.id],
      });
    }
  }

  const ranked = dedupeById(candidates).sort(
    (left, right) => right.attentionValue - left.attentionValue,
  );

  const selected: AttentionItem[] = [];
  const deferred: AttentionItem[] = [];
  let used = 0;

  for (const item of ranked) {
    if (used + item.estimatedMinutes <= budgetMinutes && selected.length < 9) {
      selected.push(item);
      used += item.estimatedMinutes;
    } else {
      deferred.push(item);
    }
  }

  return {
    budgetMinutes,
    budgetLevel: input.capacity.attentionBudget,
    ranked,
    selected,
    deferred,
    reasoning: ensureSentence(
      `Attention budget is ${budgetMinutes} minutes (${input.capacity.attentionBudget}). ${selected.length} items selected; ${deferred.length} deferred. Ranked by business importance AND executive intent — not chronology.`,
    ),
  };
}

function budgetFromCapacity(capacity: CapacityResult): number {
  if (capacity.capacity === "overdrawn") return 18;
  if (capacity.capacity === "constrained") return 28;
  return 40;
}

function dedupeById(items: AttentionItem[]): AttentionItem[] {
  const seen = new Set<string>();
  const result: AttentionItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}
