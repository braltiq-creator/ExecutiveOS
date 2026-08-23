import { getStrategicObjectives } from "@/lib/onboarding/queries";
import type { StrategicObjective } from "@/types/onboarding";
import type { ExecutiveObjectiveContext } from "@/types/intelligence";

export async function loadStrategicObjectiveRecords(
  userId: string,
): Promise<StrategicObjective[]> {
  return getStrategicObjectives(userId);
}

export function mapExecutiveObjectives(
  objectives: StrategicObjective[],
): ExecutiveObjectiveContext[] {
  return objectives.map((objective) => ({
    id: objective.id,
    title: objective.title,
    description: objective.description ?? "",
    priority: objective.priority,
    sortOrder: objective.sort_order,
  }));
}
