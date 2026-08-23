import type { AdaptiveBehaviourEvent, BehaviourEventKind } from "@/adaptive/framework/types";
import { ensureAdaptiveProfile, updateAdaptiveProfile } from "@/adaptive/preferences/store";
import type { IntelligenceProfileId } from "@/profiles";
import { appendLearningHistory } from "@/adaptive/governance/history";

const events: AdaptiveBehaviourEvent[] = [];
let seq = 0;

export function resetAdaptiveBehaviour(): void {
  events.length = 0;
  seq = 0;
}

export function recordAdaptiveBehaviour(input: {
  tenantId: string;
  executiveId: string;
  profileId: IntelligenceProfileId;
  kind: BehaviourEventKind;
  recommendationId?: string | null;
  weight?: number;
  meta?: Record<string, string | number | boolean>;
}): AdaptiveBehaviourEvent {
  ensureAdaptiveProfile({
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    profileId: input.profileId,
  });

  seq += 1;
  const event: AdaptiveBehaviourEvent = {
    id: `abev-${seq}`,
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    kind: input.kind,
    recommendationId: input.recommendationId ?? null,
    weight: input.weight ?? 1,
    at: new Date().toISOString(),
    meta: input.meta,
  };
  events.push(event);
  recomputeRates(input.tenantId, input.executiveId, input.profileId);
  appendLearningHistory({
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    category: "preference",
    summary: `Observed ${input.kind.replace(/_/g, " ")}`,
  });
  return event;
}

function recomputeRates(
  tenantId: string,
  executiveId: string,
  profileId: IntelligenceProfileId,
): void {
  const mine = events.filter(
    (e) => e.tenantId === tenantId && e.executiveId === executiveId,
  );
  const views = sum(mine, "recommendation_view");
  const accepts = sum(mine, "recommendation_accept");
  const ignores =
    sum(mine, "recommendation_ignore") + sum(mine, "recommendation_reject");
  const reviews = sum(mine, "review_complete");
  const opens = sum(mine, "brief_open");
  const expands = sum(mine, "explanation_expand");

  const denom = Math.max(1, views + accepts + ignores);
  const detail =
    expands >= 3 ? "deep" : expands >= 1 ? "balanced" : ("concise" as const);

  updateAdaptiveProfile(tenantId, executiveId, {
    profileId,
    recommendationAcceptanceRate: Math.round((accepts / denom) * 100),
    recommendationDismissalRate: Math.round((ignores / denom) * 100),
    reviewCompletionRate: Math.round(
      (reviews / Math.max(1, accepts + reviews)) * 100,
    ),
    briefingBehaviour: {
      opensPerWeek: opens,
      avgMinutes: 6 + Math.min(10, expands),
      preferredStartSection:
        accepts > ignores ? "recommendations" : "executive-value",
    },
    preferredDetailLevel: detail,
    learningConfidence: Math.min(
      92,
      35 + mine.length * 3 + accepts * 2,
    ),
    explanations: [
      `Acceptance rate ${Math.round((accepts / denom) * 100)}% from ${mine.length} observed behaviours.`,
      `Detail level set to ${detail} from explanation expansion patterns.`,
    ],
  });
}

function sum(events: AdaptiveBehaviourEvent[], kind: BehaviourEventKind): number {
  return events.filter((e) => e.kind === kind).reduce((s, e) => s + e.weight, 0);
}

export function listAdaptiveBehaviour(
  tenantId?: string,
): AdaptiveBehaviourEvent[] {
  return events
    .filter((e) => (tenantId ? e.tenantId === tenantId : true))
    .sort((a, b) => b.at.localeCompare(a.at));
}
