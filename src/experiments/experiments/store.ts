import type {
  ExperimentRecord,
  ExperimentResult,
  ExperimentStatus,
} from "@/experiments/framework/types";
import type { IntelligenceProfileId } from "@/profiles";
import { getHypothesis } from "@/experiments/hypotheses/store";

const experiments = new Map<string, ExperimentRecord>();
let seq = 0;

export function resetExperiments(): void {
  experiments.clear();
  seq = 0;
}

export function createExperiment(input: {
  hypothesisId: string;
  targetPartnerTenantIds: string[];
  startDate?: string;
  endDate?: string | null;
  linkedFeatureFlags?: string[];
}): ExperimentRecord {
  const hypothesis = getHypothesis(input.hypothesisId);
  if (!hypothesis) {
    throw new Error(`Unknown hypothesis: ${input.hypothesisId}`);
  }
  seq += 1;
  const now = new Date().toISOString();
  const record: ExperimentRecord = {
    id: `exp-${seq}`,
    hypothesisId: hypothesis.id,
    hypothesis: hypothesis.statement,
    objective: hypothesis.objective,
    targetProfileId: hypothesis.targetProfileId,
    targetPartnerTenantIds: [...input.targetPartnerTenantIds],
    expectedBehaviourChange: hypothesis.expectedBehaviourChange,
    successMetrics: [...hypothesis.successMetrics],
    startDate: input.startDate ?? now,
    endDate: input.endDate ?? null,
    status: "draft",
    result: "pending",
    learning: null,
    recommendedAction: null,
    linkedFeatureFlags: input.linkedFeatureFlags ?? [],
    createdAt: now,
    updatedAt: now,
  };
  experiments.set(record.id, record);
  return record;
}

export function updateExperimentStatus(input: {
  id: string;
  status: ExperimentStatus;
  result?: ExperimentResult;
  learning?: string | null;
  recommendedAction?: string | null;
  endDate?: string | null;
}): ExperimentRecord | null {
  const current = experiments.get(input.id);
  if (!current) return null;
  const next: ExperimentRecord = {
    ...current,
    status: input.status,
    result: input.result ?? current.result,
    learning:
      input.learning !== undefined ? input.learning : current.learning,
    recommendedAction:
      input.recommendedAction !== undefined
        ? input.recommendedAction
        : current.recommendedAction,
    endDate: input.endDate !== undefined ? input.endDate : current.endDate,
    updatedAt: new Date().toISOString(),
  };
  experiments.set(next.id, next);
  return next;
}

export function getExperiment(id: string): ExperimentRecord | undefined {
  return experiments.get(id);
}

export function listExperiments(): ExperimentRecord[] {
  return [...experiments.values()].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function listExperimentsForTenant(tenantId: string): ExperimentRecord[] {
  return listExperiments().filter((exp) =>
    exp.targetPartnerTenantIds.includes(tenantId),
  );
}

export function listExperimentsForProfile(
  profileId: IntelligenceProfileId,
): ExperimentRecord[] {
  return listExperiments().filter(
    (exp) =>
      exp.targetProfileId === "all" || exp.targetProfileId === profileId,
  );
}
