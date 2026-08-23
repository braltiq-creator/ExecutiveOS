import type {
  CommercialEditionId,
  ImplementationPlan,
  ImplementationStageId,
  ImplementationStageStatus,
} from "@/commercial/framework/types";
import { IMPLEMENTATION_STAGES } from "@/commercial/implementation/stages";

const plans = new Map<string, ImplementationPlan>();
let seq = 0;

export function resetImplementationPlans(): void {
  plans.clear();
  seq = 0;
}

export function createImplementationPlan(input: {
  tenantId: string;
  editionId: CommercialEditionId;
  startedAt?: string;
}): ImplementationPlan {
  const startedAt = input.startedAt ?? new Date().toISOString();
  seq += 1;
  const plan: ImplementationPlan = {
    id: `impl-${seq}`,
    tenantId: input.tenantId,
    editionId: input.editionId,
    currentStageId: "discovery",
    stages: IMPLEMENTATION_STAGES.map((stage, index) => ({
      stageId: stage.id,
      status: (index === 0 ? "in_progress" : "not_started") as ImplementationStageStatus,
      completedAt: null,
      evidence: [],
      blockers: [],
    })),
    startedAt,
    updatedAt: startedAt,
    goLiveAt: null,
  };
  plans.set(plan.id, plan);
  return plan;
}

export function advanceImplementationStage(input: {
  planId: string;
  toStageId: ImplementationStageId;
  evidence?: string[];
  blockers?: string[];
}): ImplementationPlan | null {
  const plan = plans.get(input.planId);
  if (!plan) return null;

  const targetDef = IMPLEMENTATION_STAGES.find((s) => s.id === input.toStageId);
  if (!targetDef) return null;

  const now = new Date().toISOString();
  const stages = plan.stages.map((stage) => {
    const def = IMPLEMENTATION_STAGES.find((s) => s.id === stage.stageId)!;
    if (def.order < targetDef.order) {
      return {
        ...stage,
        status: "complete" as const,
        completedAt: stage.completedAt ?? now,
        evidence:
          stage.stageId === plan.currentStageId
            ? [...stage.evidence, ...(input.evidence ?? [])]
            : stage.evidence,
      };
    }
    if (def.order === targetDef.order) {
      return {
        ...stage,
        status: "in_progress" as const,
        evidence: [...stage.evidence, ...(input.evidence ?? [])],
        blockers: input.blockers ?? stage.blockers,
      };
    }
    return stage;
  });

  const next: ImplementationPlan = {
    ...plan,
    currentStageId: input.toStageId,
    stages,
    updatedAt: now,
    goLiveAt: input.toStageId === "go_live" ? now : plan.goLiveAt,
  };
  plans.set(next.id, next);
  return next;
}

export function completeImplementationStage(input: {
  planId: string;
  stageId: ImplementationStageId;
  evidence?: string[];
}): ImplementationPlan | null {
  const plan = plans.get(input.planId);
  if (!plan) return null;
  const def = IMPLEMENTATION_STAGES.find((s) => s.id === input.stageId);
  if (!def) return null;
  const nextStage = IMPLEMENTATION_STAGES.find((s) => s.order === def.order + 1);
  if (!nextStage) {
    return advanceImplementationStage({
      planId: input.planId,
      toStageId: "go_live",
      evidence: input.evidence,
    });
  }
  const updated = plans.get(input.planId)!;
  const now = new Date().toISOString();
  updated.stages = updated.stages.map((s) =>
    s.stageId === input.stageId
      ? {
          ...s,
          status: "complete",
          completedAt: now,
          evidence: [...s.evidence, ...(input.evidence ?? [])],
        }
      : s,
  );
  return advanceImplementationStage({
    planId: input.planId,
    toStageId: nextStage.id,
    evidence: input.evidence,
  });
}

export function listImplementationPlans(
  tenantId?: string,
): ImplementationPlan[] {
  return [...plans.values()]
    .filter((p) => (tenantId ? p.tenantId === tenantId : true))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getImplementationPlan(
  id: string,
): ImplementationPlan | undefined {
  return plans.get(id);
}
