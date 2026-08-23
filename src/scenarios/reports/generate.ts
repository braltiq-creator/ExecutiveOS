/**
 * Executive scenario reports — weekly, monthly, pilot complete.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import {
  getScenarioPackForProfile,
  getScenarioById,
  type ScenarioExecutiveReport,
  type ScenarioReportKind,
} from "@/scenarios/framework";
import { runScenarioPack } from "@/scenarios/validation";
import { buildScenarioScorecard } from "@/scenarios/validation/scorecard";
import { listOutcomesForTenant } from "@/scenarios/outcomes";

export function generateScenarioReport(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  kind: ScenarioReportKind;
  asOf?: string;
  intelligent?: IntelligentExecutiveSnapshot;
  presentation?: ExecutiveSnapshot;
}): ScenarioExecutiveReport {
  const asOf = input.asOf ?? new Date().toISOString();
  const pack = getScenarioPackForProfile(input.profileId);
  const run = runScenarioPack(input);
  const scorecard = buildScenarioScorecard(input);
  const outcomes = listOutcomesForTenant(input.tenantId);

  const titles: Record<ScenarioReportKind, string> = {
    weekly: "Weekly Scenario Report",
    monthly: "Monthly Scenario Report",
    pilot_complete: "Pilot Complete Scenario Report",
  };

  const questionsAnswered = run.results
    .filter((r) => r.answered)
    .map((r) => getScenarioById(r.scenarioId)?.businessQuestion ?? r.scenarioId);

  const evidence = run.results.flatMap((r) => r.evidenceFound).slice(0, 12);
  const recommendations = run.results
    .map((r) => r.recommendation)
    .filter((r): r is string => Boolean(r))
    .slice(0, 10);
  const outcomeLines = outcomes.length
    ? outcomes.map((o) => `${o.realised ? "✓" : "○"} ${o.outcome}`)
    : run.results
        .filter((r) => r.passed)
        .map(
          (r) =>
            getScenarioById(r.scenarioId)?.businessOutcome ?? r.scenarioId,
        );
  const learning = [
    `Average confidence ${run.averageConfidence}%`,
    `Completion ${run.completionPct}% · Accuracy ${run.accuracyPct}%`,
    scorecard.weakScenarios.length === 0
      ? "No weak scenarios this period"
      : `Focus improvement on: ${scorecard.weakScenarios
          .slice(0, 3)
          .map((w) => w.name)
          .join(", ")}`,
  ];
  const areasForImprovement = scorecard.weakScenarios.map(
    (w) => `${w.name}: ${w.reason}`,
  );

  let markdown = `# ${titles[input.kind]}\n\n`;
  markdown += `**Pack:** ${pack.name}  \n`;
  markdown += `**Tenant:** ${input.tenantId}  \n`;
  markdown += `**Generated:** ${asOf}  \n`;
  markdown += `**Overall success:** ${scorecard.overallSuccess}/100\n\n`;
  markdown += `## Questions answered\n\n`;
  for (const q of questionsAnswered) markdown += `- ${q}\n`;
  markdown += `\n## Evidence\n\n`;
  for (const e of evidence) markdown += `- ${e}\n`;
  markdown += `\n## Recommendations\n\n`;
  for (const r of recommendations) markdown += `- ${r}\n`;
  markdown += `\n## Outcomes\n\n`;
  for (const o of outcomeLines) markdown += `- ${o}\n`;
  markdown += `\n## Learning\n\n`;
  for (const l of learning) markdown += `- ${l}\n`;
  markdown += `\n## Areas for improvement\n\n`;
  if (areasForImprovement.length === 0) {
    markdown += `- None — scenario pack meeting acceptance gate\n`;
  } else {
    for (const a of areasForImprovement) markdown += `- ${a}\n`;
  }

  return {
    kind: input.kind,
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
    title: titles[input.kind],
    questionsAnswered,
    evidence,
    recommendations,
    outcomes: outcomeLines,
    learning,
    areasForImprovement,
    markdown,
  };
}
