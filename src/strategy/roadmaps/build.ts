/**
 * Strategic roadmaps derived from outcomes + initiatives.
 */

import { listStrategicOutcomes } from "@/strategy/outcomes";
import { listStrategicInitiatives } from "@/strategy/initiatives";
import type { StrategyRoadmapItem } from "@/strategy/framework/types";

const items = new Map<string, StrategyRoadmapItem>();

export function resetStrategyRoadmaps(): void {
  items.clear();
}

export function listStrategyRoadmaps(tenantId: string): StrategyRoadmapItem[] {
  return [...items.values()].filter((i) => i.tenantId === tenantId);
}

export function buildStrategyRoadmap(
  tenantId: string,
): StrategyRoadmapItem[] {
  const built: StrategyRoadmapItem[] = [];
  for (const outcome of listStrategicOutcomes(tenantId)) {
    const related = listStrategicInitiatives(tenantId).filter(
      (i) => i.outcomeId === outcome.id,
    );
    if (related.length === 0) {
      const item: StrategyRoadmapItem = {
        id: `sroad-${outcome.id}-plan`,
        tenantId,
        outcomeId: outcome.id,
        title: `Define initiatives for ${outcome.name}`,
        horizon: "now",
        status: "planned",
        owner: outcome.executiveOwner,
      };
      items.set(item.id, item);
      built.push(item);
      continue;
    }
    for (const initiative of related) {
      const horizon =
        initiative.progressPct >= 70
          ? ("later" as const)
          : initiative.progressPct >= 30
            ? ("next" as const)
            : ("now" as const);
      const item: StrategyRoadmapItem = {
        id: `sroad-${initiative.id}`,
        tenantId,
        outcomeId: outcome.id,
        title: initiative.name,
        horizon,
        status:
          initiative.status === "completed"
            ? "done"
            : initiative.status === "planned"
              ? "planned"
              : "in_progress",
        owner: initiative.owner,
      };
      items.set(item.id, item);
      built.push(item);
    }
  }
  return built;
}
