/**
 * Internal Braltiq simulation reports — never customer-facing.
 */

import type { LabRunResult } from "@/simulation/runner";
import type {
  CouncilValidation,
  EnterpriseScorecard,
  EnterpriseSimulationReport,
  EnterpriseSuiteResult,
  OperatingLoopValidation,
  OperatingMode,
  SimulationFinding,
} from "@/simulation/enterprise/types";

function finding(
  severity: SimulationFinding["severity"],
  title: string,
  detail: string,
): SimulationFinding {
  return { severity, title, detail };
}

export function generateEnterpriseReport(input: {
  organisationId: string;
  organisationName: string;
  scenarioId: string;
  scenarioName: string;
  mode: OperatingMode;
  asOf: string;
  lab: LabRunResult;
  operatingLoop: OperatingLoopValidation;
  council: CouncilValidation;
  scorecard: EnterpriseScorecard;
}): EnterpriseSimulationReport {
  const strengths: SimulationFinding[] = [];
  const weaknesses: SimulationFinding[] = [];
  const missedOpportunities: SimulationFinding[] = [];
  const poorRecommendations: SimulationFinding[] = [];
  const unexpectedBehaviour: SimulationFinding[] = [];
  const productImprovements: SimulationFinding[] = [];

  for (const dimension of input.scorecard.dimensions) {
    if (dimension.score >= 75) {
      strengths.push(
        finding(
          "strength",
          dimension.label,
          `${dimension.label} scored ${dimension.score}. ${dimension.reasoning}`,
        ),
      );
    } else if (dimension.score < 55) {
      weaknesses.push(
        finding(
          "weakness",
          dimension.label,
          `${dimension.label} scored ${dimension.score}. ${dimension.reasoning}`,
        ),
      );
    }
  }

  for (const stage of input.operatingLoop.stages) {
    if (!stage.pass) {
      weaknesses.push(
        finding(
          "weakness",
          `Operating loop · ${stage.label}`,
          stage.notes.join(" "),
        ),
      );
      productImprovements.push(
        finding(
          "product_improvement",
          `Harden ${stage.label} under ${input.mode}`,
          `Stage failed automatic pass-through for ${input.scenarioName}.`,
        ),
      );
    }
  }

  for (const evaluation of input.lab.blocked) {
    poorRecommendations.push(
      finding(
        "poor_recommendation",
        evaluation.title,
        `Blocked recommendation (${evaluation.overallScore}). ${evaluation.reasoning}`,
      ),
    );
  }

  for (const member of input.council.members) {
    if (input.mode === "crisis" && !member.hasObservation) {
      missedOpportunities.push(
        finding(
          "missed_opportunity",
          `${member.shortTitle} observation gap`,
          `${member.shortTitle} did not raise a proactive observation during crisis.`,
        ),
      );
    }
    if (member.collaboration < 45) {
      weaknesses.push(
        finding(
          "weakness",
          `${member.shortTitle} collaboration`,
          `${member.shortTitle} collaboration scored ${member.collaboration}.`,
        ),
      );
    }
  }

  for (const behaviour of input.council.unexpectedBehaviours) {
    unexpectedBehaviour.push(
      finding("unexpected", "Council behaviour", behaviour),
    );
  }

  if (input.lab.capture.unknowns.length === 0) {
    missedOpportunities.push(
      finding(
        "missed_opportunity",
        "Unknowns not surfaced",
        "Judgement capture contained no explicit unknowns for executive attention.",
      ),
    );
  }

  if (input.scorecard.overall < 70) {
    productImprovements.push(
      finding(
        "product_improvement",
        "Raise operational confidence before Design Partner",
        `Overall enterprise score ${input.scorecard.overall} under ${input.mode} / ${input.scenarioName}.`,
      ),
    );
  }

  const summary = [
    `${input.organisationName} × ${input.scenarioName} (${input.mode}).`,
    `Overall ${input.scorecard.overall}/100 — ${input.scorecard.pass ? "PASS" : "NEEDS WORK"}.`,
    `Loop ${input.operatingLoop.pass ? "intact" : "broken"}; Council ${input.council.pass ? "validated" : "incomplete"}.`,
    `Trust ${input.lab.benchmarks.trustScore}; ${input.lab.blocked.length} blocked recommendations.`,
  ].join(" ");

  const findings = [
    ...strengths,
    ...weaknesses,
    ...missedOpportunities,
    ...poorRecommendations,
    ...unexpectedBehaviour,
    ...productImprovements,
  ];

  return {
    id: `sim-report-${input.organisationId}-${input.scenarioId}`,
    asOf: input.asOf,
    organisationId: input.organisationId,
    organisationName: input.organisationName,
    scenarioId: input.scenarioId,
    scenarioName: input.scenarioName,
    mode: input.mode,
    summary,
    scorecard: input.scorecard,
    strengths,
    weaknesses,
    missedOpportunities,
    poorRecommendations,
    unexpectedBehaviour,
    productImprovements,
    findings,
  };
}

export function summariseEnterpriseSuite(
  runs: EnterpriseSuiteResult["runs"],
): Pick<
  EnterpriseSuiteResult,
  "averageScore" | "passRate" | "reportSummary" | "aggregatedFindings"
> {
  const averageScore =
    runs.length === 0
      ? 0
      : Math.round(
          runs.reduce((sum, run) => sum + run.scorecard.overall, 0) /
            runs.length,
        );
  const passCount = runs.filter((run) => run.scorecard.pass).length;
  const passRate =
    runs.length === 0 ? 0 : Math.round((passCount / runs.length) * 100);

  const aggregatedFindings = runs.flatMap((run) => run.report.findings).slice(0, 40);

  const modes = [...new Set(runs.map((run) => run.mode))];
  const reportSummary = [
    `Enterprise Simulation Suite — ${runs.length} runs across ${modes.join(", ") || "n/a"}.`,
    `Average score ${averageScore}; pass rate ${passRate}%.`,
    passRate >= 80
      ? "Operational confidence trending toward Design Partner readiness."
      : "Weaknesses remain; remediate before commercial confidence.",
  ].join(" ");

  return {
    averageScore,
    passRate,
    reportSummary,
    aggregatedFindings,
  };
}
