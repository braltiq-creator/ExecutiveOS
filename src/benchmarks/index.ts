/**
 * Reality Lab — Benchmarks & Reporting
 * Measurable trust, readiness, and regression tracking.
 */

export {
  computeRunBenchmarks,
} from "@/benchmarks/metrics";
export type { RunBenchmarks } from "@/benchmarks/metrics";

export {
  saveBaseline,
  getBaseline,
  listBaselines,
  clearBaselines,
  compareToBaseline,
  generateSuiteReport,
} from "@/benchmarks/reporting";
export type {
  BenchmarkBaseline,
  RegressionFinding,
  ComparisonReport,
} from "@/benchmarks/reporting";

export { runRealityLabSuite } from "@/benchmarks/suite";
export type { RealityLabSuiteResult } from "@/benchmarks/suite";
