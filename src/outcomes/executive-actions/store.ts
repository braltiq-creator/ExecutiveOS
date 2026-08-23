/**
 * Executive actions linked to recommendations / outcomes.
 * Manual capture initially; future automation can write the same records.
 */

import type {
  ExecutiveActionKind,
  ExecutiveActionRecord,
} from "@/outcomes/framework/types";

const actions = new Map<string, ExecutiveActionRecord>();

const ACTION_LABELS: Record<ExecutiveActionKind, string> = {
  contacted_strategic_customer: "Executive contacted strategic customer",
  reassigned_operational_resources: "Executive reassigned operational resources",
  escalated_delivery_risk: "Executive escalated delivery risk",
  approved_investment: "Executive approved investment",
  scheduled_leadership_meeting: "Executive scheduled leadership meeting",
  changed_forecast: "Executive changed forecast",
  other: "Executive action",
};

export function resetExecutiveActions(): void {
  actions.clear();
}

export function listExecutiveActions(
  tenantId: string,
): ExecutiveActionRecord[] {
  return [...actions.values()]
    .filter((a) => a.tenantId === tenantId)
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
}

export function recordExecutiveAction(input: {
  tenantId: string;
  kind: ExecutiveActionKind;
  detail?: string;
  recommendationId?: string | null;
  outcomeId?: string | null;
  capturedBy?: string;
  source?: "manual" | "system";
  asOf?: string;
  label?: string;
}): ExecutiveActionRecord {
  const record: ExecutiveActionRecord = {
    id: `act-${input.tenantId}-${actions.size + 1}`,
    tenantId: input.tenantId,
    recommendationId: input.recommendationId ?? null,
    outcomeId: input.outcomeId ?? null,
    kind: input.kind,
    label: input.label ?? ACTION_LABELS[input.kind],
    detail: input.detail ?? ACTION_LABELS[input.kind],
    capturedBy: input.capturedBy ?? "manual",
    capturedAt: input.asOf ?? new Date().toISOString(),
    source: input.source ?? "manual",
  };
  actions.set(record.id, record);
  return record;
}

export function linkActionToOutcome(input: {
  actionId: string;
  outcomeId: string;
}): ExecutiveActionRecord | null {
  const existing = actions.get(input.actionId);
  if (!existing) return null;
  const next = { ...existing, outcomeId: input.outcomeId };
  actions.set(next.id, next);
  return next;
}

export { ACTION_LABELS };
