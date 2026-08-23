/**
 * Executive Futures Engine
 * Deterministic scenario reasoning from Digital Twin + intelligence evidence.
 * Not ML forecasting. Never binds the executive.
 */

export type * from "@/futures/models";
export {
  TIME_HORIZON_IDS,
  BUSINESS_DRIVER_IDS,
  FUTURE_CASE_KINDS,
  INTERVENTION_KINDS,
  FUTURE_SPOTLIGHTS,
} from "@/futures/models";

export {
  BUSINESS_DRIVERS,
  listBusinessDrivers,
  getBusinessDriver,
} from "@/futures/drivers";

export {
  TIME_HORIZONS,
  listTimeHorizons,
  getTimeHorizon,
  selectPrimaryHorizon,
} from "@/futures/timelines";

export { FUTURE_CASE_LABELS, FUTURE_CASE_TEMPLATES } from "@/futures/scenarios";
export { buildLeadingIndicators } from "@/futures/signals";
export {
  buildFutureExplanation,
  explainFutureForExecutive,
} from "@/futures/explainability";

export { projectPossibleFutures } from "@/futures/generate";
export { applyExecutiveFutures } from "@/futures/apply-futures";
export { reviewFuturesWithCouncil } from "@/futures/council-review";
export { selectSpotlights } from "@/futures/spotlights";
export { toPossibleFuturesView } from "@/futures/to-view";
export {
  SPOTLIGHT_LABELS,
  INTERVENTION_KIND_LABELS,
} from "@/futures/labels";

export {
  simulateFuturesForScenario,
} from "@/futures/simulations";
export type { FutureSimulationResult } from "@/futures/simulations";
