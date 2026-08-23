import type { RunBenchmarks } from "@/benchmarks/metrics";
import type { LabRunResult } from "@/simulation/runner";

export type BenchmarkBaseline = {
  id: string;
  label: string;
  createdAt: string;
  organisationId: string;
  scenarioId: string;
  benchmarks: RunBenchmarks;
  fingerprints: Record<string, string>;
};

export type RegressionFinding = {
  metric: keyof RunBenchmarks;
  previous: number;
  current: number;
  delta: number;
  severity: "regression" | "improvement" | "stable";
};

export type ComparisonReport = {
  id: string;
  asOf: string;
  baselineId: string;
  currentLabel: string;
  organisationId: string;
  scenarioId: string;
  findings: RegressionFinding[];
  regressions: RegressionFinding[];
  improvements: RegressionFinding[];
  trustDelta: number;
  summary: string;
  passed: boolean;
};

const REGRESSION_THRESHOLD = -3;

/** In-memory baseline registry — swap for durable store later. */
const baselines = new Map<string, BenchmarkBaseline>();

export function saveBaseline(input: {
  id: string;
  label: string;
  run: LabRunResult;
}): BenchmarkBaseline {
  const baseline: BenchmarkBaseline = {
    id: input.id,
    label: input.label,
    createdAt: input.run.asOf,
    organisationId: input.run.organisationId,
    scenarioId: input.run.scenarioId,
    benchmarks: input.run.benchmarks,
    fingerprints: input.run.fingerprints,
  };
  baselines.set(baseline.id, baseline);
  return baseline;
}

export function getBaseline(id: string): BenchmarkBaseline | undefined {
  return baselines.get(id);
}

export function listBaselines(): BenchmarkBaseline[] {
  return [...baselines.values()];
}

export function clearBaselines(): void {
  baselines.clear();
}

/**
 * Compare a run against a saved baseline — highlight regressions.
 */
export function compareToBaseline(
  run: LabRunResult,
  baselineId: string,
): ComparisonReport {
  const baseline = baselines.get(baselineId);
  if (!baseline) {
    return {
      id: `cmp-missing-${baselineId}`,
      asOf: run.asOf,
      baselineId,
      currentLabel: `${run.organisationName} / ${run.scenarioName}`,
      organisationId: run.organisationId,
      scenarioId: run.scenarioId,
      findings: [],
      regressions: [],
      improvements: [],
      trustDelta: 0,
      summary: `Baseline ${baselineId} not found.`,
      passed: false,
    };
  }

  const metrics = Object.keys(baseline.benchmarks) as Array<keyof RunBenchmarks>;
  const findings: RegressionFinding[] = metrics.map((metric) => {
    const previous = Number(baseline.benchmarks[metric]);
    const current = Number(run.benchmarks[metric]);
    const delta = current - previous;
    const severity: RegressionFinding["severity"] =
      delta <= REGRESSION_THRESHOLD
        ? "regression"
        : delta >= 3
          ? "improvement"
          : "stable";
    return { metric, previous, current, delta, severity };
  });

  const regressions = findings.filter((item) => item.severity === "regression");
  const improvements = findings.filter((item) => item.severity === "improvement");
  const trustDelta =
    run.benchmarks.trustScore - baseline.benchmarks.trustScore;

  return {
    id: `cmp-${baseline.id}-${run.scenarioId}`,
    asOf: run.asOf,
    baselineId: baseline.id,
    currentLabel: `${run.organisationName} / ${run.scenarioName}`,
    organisationId: run.organisationId,
    scenarioId: run.scenarioId,
    findings,
    regressions,
    improvements,
    trustDelta,
    summary: [
      `Trust ${run.benchmarks.trustScore} (Δ ${trustDelta >= 0 ? "+" : ""}${trustDelta}).`,
      regressions.length
        ? `${regressions.length} regression(s): ${regressions.map((r) => r.metric).join(", ")}.`
        : "No material regressions.",
      improvements.length
        ? `${improvements.length} improvement(s).`
        : "No material improvements.",
    ].join(" "),
    passed: regressions.length === 0,
  };
}

/**
 * Multi-run comparison report across organisations / scenarios.
 */
export function generateSuiteReport(runs: LabRunResult[]): {
  id: string;
  asOf: string;
  runCount: number;
  averageTrust: number;
  averagePassRate: number;
  weakest: Array<{ label: string; trustScore: number }>;
  strongest: Array<{ label: string; trustScore: number }>;
  summary: string;
} {
  const averageTrust =
    runs.reduce((sum, run) => sum + run.benchmarks.trustScore, 0) /
    Math.max(1, runs.length);
  const averagePassRate =
    runs.reduce((sum, run) => sum + run.benchmarks.passRate, 0) /
    Math.max(1, runs.length);

  const ranked = [...runs].sort(
    (a, b) => a.benchmarks.trustScore - b.benchmarks.trustScore,
  );

  return {
    id: `suite-${runs.length}-${Date.now()}`,
    asOf: runs[0]?.asOf ?? new Date().toISOString(),
    runCount: runs.length,
    averageTrust: Math.round(averageTrust),
    averagePassRate: Math.round(averagePassRate),
    weakest: ranked.slice(0, 3).map((run) => ({
      label: `${run.organisationName} / ${run.scenarioName}`,
      trustScore: run.benchmarks.trustScore,
    })),
    strongest: ranked
      .slice(-3)
      .reverse()
      .map((run) => ({
        label: `${run.organisationName} / ${run.scenarioName}`,
        trustScore: run.benchmarks.trustScore,
      })),
    summary: [
      `Suite of ${runs.length} run(s): average trust ${Math.round(averageTrust)}, pass rate ${Math.round(averagePassRate)}%.`,
      "Reality Lab measures reasoning quality like an autopilot test harness.",
    ].join(" "),
  };
}
