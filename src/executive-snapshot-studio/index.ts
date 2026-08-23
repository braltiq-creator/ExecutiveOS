/**
 * Executive Snapshot Studio — Phase 56+
 *
 * Client entry focuses on wizard UX.
 * Server Actions / filesystem fixtures: `@/executive-snapshot-studio/server`
 * Browser API stubs: import from `./client/api` (used by SnapshotStudio).
 */

export type * from "./types";
export { STUDIO_WIZARD_STEPS } from "./types";

export * from "./welcome";
export * from "./profile-detection";
export * from "./readiness";
export * from "./mapping";
export * from "./snapshot";
export * from "./brief";
export * from "./history";
export * from "./launch";
export * from "./preview";
export * from "./wizard";

/**
 * Intelligence tabular helpers (no node:fs).
 * Filesystem fixture validation: `@/executive-snapshot-studio/server`
 */
export {
  analyseCommercialSnapshot,
  interpretCommercialSnapshot,
  runCommercialValidationFromTabular,
  formatCommercialValidationReport,
  portfolioFromCommercialAnalysis,
  buildCommercialExecutiveBrief,
} from "./intelligence";
export type {
  CommercialAnalysis,
  CommercialInsight,
  CommercialExecutiveValue,
  CommercialValidationResult,
  CommercialExecutiveBrief,
  InsightPosture,
} from "./intelligence";
