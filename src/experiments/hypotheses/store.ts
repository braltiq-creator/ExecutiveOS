import type { HypothesisRecord } from "@/experiments/framework/types";
import type { IntelligenceProfileId } from "@/profiles";

const hypotheses = new Map<string, HypothesisRecord>();
let seq = 0;

export function resetHypotheses(): void {
  hypotheses.clear();
  seq = 0;
}

export function createHypothesis(input: {
  statement: string;
  objective: string;
  targetProfileId: IntelligenceProfileId | "all";
  expectedBehaviourChange: string;
  successMetrics: string[];
  createdBy?: string;
}): HypothesisRecord {
  seq += 1;
  const record: HypothesisRecord = {
    id: `hyp-${seq}`,
    statement: input.statement,
    objective: input.objective,
    targetProfileId: input.targetProfileId,
    expectedBehaviourChange: input.expectedBehaviourChange,
    successMetrics: input.successMetrics,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy ?? "braltiq-product",
  };
  hypotheses.set(record.id, record);
  return record;
}

export function getHypothesis(id: string): HypothesisRecord | undefined {
  return hypotheses.get(id);
}

export function listHypotheses(): HypothesisRecord[] {
  return [...hypotheses.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
