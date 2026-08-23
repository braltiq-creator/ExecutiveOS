import type { ExperimentRecord } from "@/experiments/framework/types";
import { updateExperimentStatus } from "@/experiments/experiments/store";

export function startExperiment(id: string): ExperimentRecord | null {
  return updateExperimentStatus({ id, status: "running" });
}

export function pauseExperiment(id: string): ExperimentRecord | null {
  return updateExperimentStatus({ id, status: "paused" });
}

export function completeExperiment(input: {
  id: string;
  result: "validated" | "rejected" | "inconclusive";
  learning: string;
  recommendedAction: string;
}): ExperimentRecord | null {
  return updateExperimentStatus({
    id: input.id,
    status: "completed",
    result: input.result,
    learning: input.learning,
    recommendedAction: input.recommendedAction,
    endDate: new Date().toISOString(),
  });
}
