/**
 * Lightweight Design Partner feedback — not a survey platform.
 */

import type {
  DesignPartnerFeedback,
  DesignPartnerFeedbackKind,
} from "./types";

const feedback: DesignPartnerFeedback[] = [];

export function recordDesignPartnerFeedback(input: {
  organisationId: string;
  kind: DesignPartnerFeedbackKind;
  comment?: string | null;
  snapshotId?: string | null;
  insightId?: string | null;
  decisionId?: string | null;
  screen?: string | null;
  actorId?: string | null;
  at?: string;
}): DesignPartnerFeedback {
  const entry: DesignPartnerFeedback = {
    id: `dpf_${Date.now().toString(36)}_${feedback.length}`,
    organisationId: input.organisationId,
    kind: input.kind,
    comment: input.comment?.trim() ? input.comment.trim() : null,
    snapshotId: input.snapshotId ?? null,
    insightId: input.insightId ?? null,
    decisionId: input.decisionId ?? null,
    screen: input.screen ?? null,
    actorId: input.actorId ?? null,
    at: input.at ?? new Date().toISOString(),
  };
  feedback.push(entry);
  return entry;
}

export function listDesignPartnerFeedback(
  organisationId?: string,
): DesignPartnerFeedback[] {
  if (!organisationId) return [...feedback];
  return feedback.filter((f) => f.organisationId === organisationId);
}

export function clearDesignPartnerFeedback(): void {
  feedback.length = 0;
}
