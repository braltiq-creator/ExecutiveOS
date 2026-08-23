import { SIMULATED_ORGANISATIONS } from "@/simulation/organisations";
import { getAllScenarios } from "@/simulation/scenarios";
import { runScenario, type LabRunResult } from "@/simulation/runner";
import {
  generateSuiteReport,
  saveBaseline,
  compareToBaseline,
  type ComparisonReport,
} from "@/benchmarks/reporting";

export type RealityLabSuiteResult = {
  runs: LabRunResult[];
  suiteReport: ReturnType<typeof generateSuiteReport>;
  comparisons: ComparisonReport[];
};

/**
 * Run Reality Lab across organisations × scenarios.
 * Optionally seed baselines from the first pass for regression checks.
 */
export function runRealityLabSuite(options?: {
  organisationIds?: string[];
  scenarioIds?: string[];
  /** When set, save baselines and re-run for comparison */
  trackRegressions?: boolean;
  baselinePrefix?: string;
}): RealityLabSuiteResult {
  const orgs = SIMULATED_ORGANISATIONS.filter(
    (org) =>
      !options?.organisationIds ||
      options.organisationIds.includes(org.id),
  );
  const scenarios = getAllScenarios().filter(
    (scenario) =>
      !options?.scenarioIds || options.scenarioIds.includes(scenario.id),
  );

  const runs: LabRunResult[] = [];
  for (const org of orgs) {
    for (const scenario of scenarios) {
      runs.push(runScenario(org, scenario));
    }
  }

  const comparisons: ComparisonReport[] = [];
  if (options?.trackRegressions) {
    const prefix = options.baselinePrefix ?? "baseline";
    for (const run of runs) {
      const baselineId = `${prefix}:${run.organisationId}:${run.scenarioId}`;
      saveBaseline({
        id: baselineId,
        label: `${run.organisationName} / ${run.scenarioName}`,
        run,
      });
      // Deterministic re-run with prior fingerprints — should be stable
      const org = orgs.find((item) => item.id === run.organisationId)!;
      const scenario = scenarios.find((item) => item.id === run.scenarioId)!;
      const second = runScenario(org, scenario, {
        priorFingerprints: run.fingerprints,
      });
      comparisons.push(compareToBaseline(second, baselineId));
    }
  }

  return {
    runs,
    suiteReport: generateSuiteReport(runs),
    comparisons,
  };
}
