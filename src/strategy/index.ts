/**
 * Strategic Outcomes Framework
 *
 * Makes recommendations, scenarios, and decisions traceable to strategic outcomes.
 * Optimises for strategic progress — not activity. Core architecture unchanged.
 */

export type * from "@/strategy/framework/types";
export {
  attachStrategicOutcomesToTodayActions,
  attachStrategicOutcomesToCouncil,
} from "@/strategy/framework";

export {
  resetStrategicOutcomes,
  listStrategicOutcomes,
  getStrategicOutcome,
  upsertStrategicOutcome,
  updateStrategicOutcomeHealth,
  seedStrategicOutcomesFromDiscovery,
  refineStrategicOutcomeFromSignals,
} from "@/strategy/outcomes";

export {
  resetStrategicInitiatives,
  listStrategicInitiatives,
  linkStrategicInitiative,
  updateStrategicInitiative,
  listDriftingInitiatives,
} from "@/strategy/initiatives";

export {
  resetStrategicMetrics,
  listStrategicMetrics,
  recordStrategicMetric,
} from "@/strategy/metrics";

export {
  listOutcomeDependencies,
  linkOutcomeDependency,
} from "@/strategy/dependencies";
export type { OutcomeDependencyEdge } from "@/strategy/dependencies";

export {
  alignRecommendationToOutcomes,
  buildAlignmentSnapshot,
  whichInitiativesAffectOutcome,
} from "@/strategy/alignment";

export { assessStrategicOutcomeHealth } from "@/strategy/health";
export type { OutcomeHealthCard } from "@/strategy/health";

export { measureStrategicProgress } from "@/strategy/progress";
export { listStrategyOwners } from "@/strategy/owners";
export type { StrategyOwnerView } from "@/strategy/owners";

export { assessStrategyConfidence } from "@/strategy/confidence";
export type { StrategyConfidenceModel } from "@/strategy/confidence";

export {
  resetStrategyRoadmaps,
  listStrategyRoadmaps,
  buildStrategyRoadmap,
} from "@/strategy/roadmaps";

export {
  assertStrategyPayload,
  getStrategyGovernance,
} from "@/strategy/governance";
export type { StrategyGovernancePolicy } from "@/strategy/governance";

export { validateStrategicAlignment } from "@/strategy/validation";
export { buildStrategyDashboard } from "@/strategy/dashboard";
export { resetStrategyFramework } from "@/strategy/reset";
