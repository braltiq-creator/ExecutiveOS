/**
 * Executive feedback — lightweight signals that improve confidence.
 */

import type { ExecutiveFeedback, FeedbackKind } from "@/validation/types";

const feedbackStore = new Map<string, ExecutiveFeedback[]>();

export function resetFeedbackStore(): void {
  feedbackStore.clear();
}

export function submitExecutiveFeedback(input: {
  tenantId: string;
  kind: FeedbackKind;
  subject: string;
  note?: string;
  relatedEntityId?: string;
  asOf?: string;
}): ExecutiveFeedback {
  const entry: ExecutiveFeedback = {
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tenantId: input.tenantId,
    at: input.asOf ?? new Date().toISOString(),
    kind: input.kind,
    subject: input.subject,
    note: input.note,
    relatedEntityId: input.relatedEntityId,
  };
  const list = feedbackStore.get(input.tenantId) ?? [];
  list.push(entry);
  feedbackStore.set(input.tenantId, list.slice(-200));
  return entry;
}

export function listExecutiveFeedback(tenantId: string): ExecutiveFeedback[] {
  return [...(feedbackStore.get(tenantId) ?? [])];
}

/** Map feedback into a confidence adjustment (-15 … +15). */
export function feedbackConfidenceDelta(tenantId: string): number {
  const list = feedbackStore.get(tenantId) ?? [];
  if (list.length === 0) return 0;
  const recent = list.slice(-20);
  let delta = 0;
  for (const item of recent) {
    switch (item.kind) {
      case "useful":
        delta += 2;
        break;
      case "already_knew":
        delta += 1;
        break;
      case "not_useful":
        delta -= 1;
        break;
      case "missing_context":
        delta -= 2;
        break;
      case "incorrect":
        delta -= 3;
        break;
      case "needs_investigation":
        delta -= 1;
        break;
    }
  }
  return Math.max(-15, Math.min(15, delta));
}
