/**
 * Pilot success reports — 30 / 60 / 90 days.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { listExecutiveOutcomes } from "@/outcomes/business-outcomes";
import { listRecommendationTracks } from "@/outcomes/recommendation-tracking";
import { listExecutiveActions } from "@/outcomes/executive-actions";
import { measureValueRealisation } from "@/outcomes/value-realisation";
import { assessOutcomesConfidence } from "@/outcomes/confidence";
import { runScenarioPack } from "@/scenarios";
import type {
  PilotSuccessReport,
  PilotSuccessReportKind,
} from "@/outcomes/framework/types";

export function generatePilotSuccessReport(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  kind: PilotSuccessReportKind;
  asOf?: string;
  testimonials?: string[];
}): PilotSuccessReport {
  const asOf = input.asOf ?? new Date().toISOString();
  const titles: Record<PilotSuccessReportKind, string> = {
    day_30: "30-Day Pilot Success Report",
    day_60: "60-Day Pilot Success Report",
    day_90: "90-Day Pilot Success Report",
  };

  const outcomes = listExecutiveOutcomes(input.tenantId);
  const recs = listRecommendationTracks(input.tenantId);
  const actions = listExecutiveActions(input.tenantId);
  const value = measureValueRealisation(input);
  const confidence = assessOutcomesConfidence({
    tenantId: input.tenantId,
    asOf,
  });
  const scenarioRun = runScenarioPack({
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
  });

  const questionsAnswered = [
    ...new Set(
      [
        ...scenarioRun.results
          .filter((r) => r.answered)
          .map((r) => r.explanation.replace(/^Answered "|" with.*$/g, "")),
        ...recs.map((r) => r.businessQuestion),
      ].filter(Boolean),
    ),
  ].slice(0, 12);

  // Prefer actual business questions from scenario results
  const questions = scenarioRun.results
    .filter((r) => r.answered)
    .map((r) => {
      const match = r.explanation.match(/"([^"]+)"/);
      return match?.[1] ?? r.scenarioId;
    });

  const recommendationsAccepted = recs
    .filter((r) =>
      ["accepted", "implemented", "observed", "confirmed"].includes(r.status),
    )
    .map((r) => r.title);

  const actionsTaken = actions.map((a) => a.label);
  const businessOutcomesObserved = outcomes
    .filter((o) => o.status === "observed" || o.status === "confirmed")
    .map((o) => o.observedOutcome || o.name);

  const lessonsLearned = [
    value.explanation,
    confidence.explanation,
    scenarioRun.explanation,
    outcomes.filter((o) => o.status === "confirmed").length
      ? "Confirmed outcomes strengthen recommendation confidence via learning loop"
      : "Confirm observed outcomes to strengthen the learning loop",
  ];

  const areasForImprovement = [
    ...scenarioRun.results
      .filter((r) => !r.passed)
      .slice(0, 3)
      .map((r) => r.explanation),
    ...(recs.filter((r) => r.status === "dismissed").length
      ? ["Review dismissed recommendations for quality gaps"]
      : []),
  ];

  const supportingEvidence = [
    ...outcomes.flatMap((o) => o.evidence).slice(0, 8),
    ...recs.flatMap((r) => r.evidence).slice(0, 4),
    `Value mid: ${value.businessValueCreated.mid} ${value.businessValueCreated.unit} (confidence ${value.businessValueCreated.confidence}%)`,
  ];

  const testimonials = input.testimonials ?? [];

  let markdown = `# ${titles[input.kind]}\n\n`;
  markdown += `**Tenant:** ${input.tenantId}  \n`;
  markdown += `**Profile:** ${input.profileId.replace(/_/g, " ")}  \n`;
  markdown += `**Generated:** ${asOf}\n\n`;
  markdown += `## Executive questions answered\n\n`;
  for (const q of questions.length ? questions : questionsAnswered) {
    markdown += `- ${q}\n`;
  }
  markdown += `\n## Recommendations accepted\n\n`;
  for (const r of recommendationsAccepted) markdown += `- ${r}\n`;
  if (!recommendationsAccepted.length) markdown += `- None recorded yet\n`;
  markdown += `\n## Actions taken\n\n`;
  for (const a of actionsTaken) markdown += `- ${a}\n`;
  if (!actionsTaken.length) markdown += `- None recorded yet\n`;
  markdown += `\n## Business outcomes observed\n\n`;
  for (const o of businessOutcomesObserved) markdown += `- ${o}\n`;
  if (!businessOutcomesObserved.length) markdown += `- None recorded yet\n`;
  markdown += `\n## Lessons learned\n\n`;
  for (const l of lessonsLearned) markdown += `- ${l}\n`;
  markdown += `\n## Areas for improvement\n\n`;
  for (const a of areasForImprovement.length ? areasForImprovement : ["Continue capturing outcomes"]) {
    markdown += `- ${a}\n`;
  }
  if (testimonials.length) {
    markdown += `\n## Executive testimonials\n\n`;
    for (const t of testimonials) markdown += `- "${t}"\n`;
  }
  markdown += `\n## Supporting evidence\n\n`;
  for (const e of supportingEvidence) markdown += `- ${e}\n`;

  return {
    kind: input.kind,
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
    title: titles[input.kind],
    questionsAnswered: questions.length ? questions : questionsAnswered,
    recommendationsAccepted,
    actionsTaken,
    businessOutcomesObserved,
    lessonsLearned,
    areasForImprovement,
    executiveTestimonials: testimonials,
    supportingEvidence,
    markdown,
  };
}
