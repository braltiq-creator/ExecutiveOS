/**
 * Executive outcome records — link recommendations → actions → observed value.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type {
  BuiltInBusinessOutcomeKind,
  ExecutiveOutcomeRecord,
  ExecutiveOutcomeStatus,
  ValueRange,
} from "@/outcomes/framework/types";

const outcomes = new Map<string, ExecutiveOutcomeRecord>();

function defaultValueRange(
  kind: BuiltInBusinessOutcomeKind,
  confidence: number,
): ValueRange {
  switch (kind) {
    case "executive_time_saved":
      return {
        low: 1,
        mid: 3,
        high: 6,
        unit: "hours",
        confidence,
        explanation: "Estimated executive time saved (range, not precise).",
      };
    case "revenue_risk_reduced":
    case "customer_retention_improved":
    case "cash_collection_improved":
    case "strategic_opportunity_realised":
      return {
        low: 5_000,
        mid: 25_000,
        high: 75_000,
        unit: "usd",
        confidence: Math.min(confidence, 55),
        explanation: "Indicative commercial value range — not accounting precision.",
      };
    case "forecast_accuracy_improved":
      return {
        low: 2,
        mid: 8,
        high: 15,
        unit: "percent",
        confidence,
        explanation: "Estimated forecast accuracy improvement range.",
      };
    default:
      return {
        low: 40,
        mid: 65,
        high: 85,
        unit: "score",
        confidence,
        explanation: "Qualitative impact score range pending confirmation.",
      };
  }
}

export function resetExecutiveOutcomes(): void {
  outcomes.clear();
}

export function listExecutiveOutcomes(
  tenantId: string,
): ExecutiveOutcomeRecord[] {
  return [...outcomes.values()]
    .filter((o) => o.tenantId === tenantId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getExecutiveOutcome(
  id: string,
): ExecutiveOutcomeRecord | undefined {
  return outcomes.get(id);
}

export function createExecutiveOutcome(input: {
  tenantId: string;
  name: string;
  profileId: IntelligenceProfileId;
  businessQuestion: string;
  recommendation: string;
  scenarioId?: string | null;
  recommendationId?: string | null;
  executiveActionId?: string | null;
  observedOutcome?: string;
  evidence?: string[];
  confidence?: number;
  businessOutcomeKind?: BuiltInBusinessOutcomeKind;
  customOutcomeLabel?: string | null;
  estimatedBusinessValue?: ValueRange;
  asOf?: string;
}): ExecutiveOutcomeRecord {
  const asOf = input.asOf ?? new Date().toISOString();
  const confidence = input.confidence ?? 50;
  const kind = input.businessOutcomeKind ?? "executive_time_saved";
  const record: ExecutiveOutcomeRecord = {
    id: `eout-${input.tenantId}-${outcomes.size + 1}`,
    tenantId: input.tenantId,
    name: input.name,
    profileId: input.profileId,
    scenarioId: input.scenarioId ?? null,
    businessQuestion: input.businessQuestion,
    recommendationId: input.recommendationId ?? null,
    recommendation: input.recommendation,
    executiveActionId: input.executiveActionId ?? null,
    observedOutcome: input.observedOutcome ?? "",
    evidence: input.evidence ?? [],
    confidence,
    estimatedBusinessValue:
      input.estimatedBusinessValue ?? defaultValueRange(kind, confidence),
    status: "open",
    businessOutcomeKind: kind,
    customOutcomeLabel: input.customOutcomeLabel ?? null,
    createdAt: asOf,
    updatedAt: asOf,
    confirmedAt: null,
    timestamps: { open: asOf },
  };
  outcomes.set(record.id, record);
  return record;
}

export function updateExecutiveOutcomeStatus(input: {
  id: string;
  status: ExecutiveOutcomeStatus;
  observedOutcome?: string;
  evidence?: string[];
  confidence?: number;
  asOf?: string;
}): ExecutiveOutcomeRecord | null {
  const existing = outcomes.get(input.id);
  if (!existing) return null;
  const asOf = input.asOf ?? new Date().toISOString();
  const timestamps = { ...existing.timestamps };
  if (!timestamps[input.status]) timestamps[input.status] = asOf;

  const next: ExecutiveOutcomeRecord = {
    ...existing,
    status: input.status,
    observedOutcome: input.observedOutcome ?? existing.observedOutcome,
    evidence: input.evidence
      ? [...existing.evidence, ...input.evidence].slice(-20)
      : existing.evidence,
    confidence: input.confidence ?? existing.confidence,
    updatedAt: asOf,
    confirmedAt: input.status === "confirmed" ? asOf : existing.confirmedAt,
    timestamps,
  };
  outcomes.set(next.id, next);
  return next;
}

export function countOutcomesByStatus(
  tenantId: string,
): Record<ExecutiveOutcomeStatus, number> {
  const counts: Record<ExecutiveOutcomeStatus, number> = {
    open: 0,
    observed: 0,
    confirmed: 0,
    rejected: 0,
  };
  for (const o of listExecutiveOutcomes(tenantId)) {
    counts[o.status] += 1;
  }
  return counts;
}
