/**
 * Executive owners for strategic outcomes / initiatives.
 */

import { listStrategicOutcomes } from "@/strategy/outcomes";
import { listStrategicInitiatives } from "@/strategy/initiatives";

export type StrategyOwnerView = {
  name: string;
  outcomeIds: string[];
  initiativeIds: string[];
  load: "light" | "moderate" | "heavy";
};

export function listStrategyOwners(tenantId: string): StrategyOwnerView[] {
  const map = new Map<string, StrategyOwnerView>();
  for (const outcome of listStrategicOutcomes(tenantId)) {
    const cur = map.get(outcome.executiveOwner) ?? {
      name: outcome.executiveOwner,
      outcomeIds: [],
      initiativeIds: [],
      load: "light" as const,
    };
    cur.outcomeIds.push(outcome.id);
    map.set(outcome.executiveOwner, cur);
  }
  for (const initiative of listStrategicInitiatives(tenantId)) {
    const cur = map.get(initiative.owner) ?? {
      name: initiative.owner,
      outcomeIds: [],
      initiativeIds: [],
      load: "light" as const,
    };
    cur.initiativeIds.push(initiative.id);
    map.set(initiative.owner, cur);
  }
  return [...map.values()].map((owner) => {
    const weight = owner.outcomeIds.length * 2 + owner.initiativeIds.length;
    return {
      ...owner,
      load: weight >= 5 ? "heavy" : weight >= 3 ? "moderate" : "light",
    };
  });
}
