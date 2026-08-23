import { resetStrategicOutcomes } from "@/strategy/outcomes";
import { resetStrategicInitiatives } from "@/strategy/initiatives";
import { resetStrategicMetrics } from "@/strategy/metrics";
import { resetStrategyRoadmaps } from "@/strategy/roadmaps";

export function resetStrategyFramework(): void {
  resetStrategicOutcomes();
  resetStrategicInitiatives();
  resetStrategicMetrics();
  resetStrategyRoadmaps();
}
