/**
 * Snapshot Studio intelligence helpers (tabular / in-memory).
 * Filesystem fixture access: import from `@/executive-snapshot-studio/server`.
 */

export {
  analyseCommercialSnapshot,
  fieldCoverageRatesFromAnalysis,
  type CommercialAnalysis,
  type CommercialInsight,
  type CommercialExecutiveValue,
  type InsightPosture,
} from "./commercial-analysis";
export { portfolioFromCommercialAnalysis } from "./portfolio-bridge";
export {
  buildCommercialExecutiveBrief,
  type CommercialExecutiveBrief,
} from "./commercial-brief";
export {
  interpretCommercialSnapshot,
  runCommercialValidationFromTabular,
  formatCommercialValidationReport,
  type CommercialValidationResult,
} from "./run-commercial-validation";

export {
  analyseManufacturingSnapshot,
  fieldCoverageRatesFromManufacturingAnalysis,
  MANUFACTURING_VARIANCE_WINDOW_PERIODS,
  type ManufacturingAnalysis,
  type ManufacturingInsight,
} from "./manufacturing-analysis";
export { portfolioFromManufacturingAnalysis } from "./manufacturing-portfolio-bridge";
export {
  buildManufacturingDecisionPaper,
  applyDecisionPaperToDecision,
} from "./manufacturing-decision-frame";
export {
  buildManufacturingExecutiveBrief,
  type ManufacturingExecutiveBrief,
} from "./manufacturing-brief";
export {
  interpretManufacturingSnapshot,
  runManufacturingValidationFromTabular,
  formatManufacturingValidationReport,
  type ManufacturingValidationResult,
} from "./run-manufacturing-validation";
