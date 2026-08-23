/**
 * Commercial Executive Brief — executive interpretation, not CRM reporting.
 */

import type { ExecutiveCouncilBrief } from "@/agents/types";
import { PRIORITIES_NOT_ESTABLISHED } from "@/intelligence/executive-intelligence/lib/isolated-context";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { StudioReadiness } from "../types";
import type { CommercialAnalysis } from "./commercial-analysis";

export type CommercialExecutiveBrief = {
  title: string;
  /** Executive Judgement — what matters this morning */
  executiveJudgement: string;
  /** Evidence — what changed or is materially different */
  evidence: string[];
  /** Business Implication — why it matters */
  businessImplication: string;
  /** Council Position — five permanent executives */
  councilPosition: string;
  councilDisagreement: string[];
  /** Uncertainty — what we don't know */
  uncertainty: string[];
  /** Recommended Judgement — what the executive should consider */
  recommendedJudgement: string[];
  /** Executive Value — measurable value supported by evidence */
  executiveValue: string;
  /** Data Confidence — how much to trust this */
  dataConfidence: string;
  /** @deprecated prefer section fields — retained for report compatibility */
  executiveSummary: string;
  commercialHealth: string;
  pipeline: string;
  forecastConfidence: string;
  materialChanges: string[];
  priorityJudgements: string[];
  recommendedActions: string[];
  confidence: number;
  asOf: string;
};

export function buildCommercialExecutiveBrief(input: {
  analysis: CommercialAnalysis;
  readiness: StudioReadiness;
  intelligent: IntelligentExecutiveSnapshot;
  council: ExecutiveCouncilBrief;
}): CommercialExecutiveBrief {
  const { analysis, readiness, intelligent, council } = input;

  const dq = analysis.insights.filter((i) => i.category === "data_quality");
  const judgements = analysis.insights.filter(
    (i) => i.category === "executive_judgement",
  );
  const material = analysis.insights.filter((i) =>
    [
      "concentration",
      "pipeline_risk",
      "forecast_risk",
      "stale_opportunity",
      "stage_risk",
    ].includes(i.category),
  );

  const avgInsightConfidence =
    analysis.insights.length === 0
      ? readiness.confidence
      : Math.round(
          analysis.insights.reduce((n, i) => n + i.confidence, 0) /
            analysis.insights.length,
        );

  const confidence = Math.round(
    (readiness.executiveReadiness +
      avgInsightConfidence +
      Math.min(intelligent.pulse.confidence.value, readiness.evidenceCoverage)) /
      3,
  );

  const recommendedJudgement = analysis.insights
    .filter((i) => i.posture === "investigate" || i.posture === "act")
    .slice(0, 5)
    .map((i) => {
      const verb = i.posture === "act" ? "Consider acting on" : "Investigate";
      return `${verb}: ${i.title} (${i.confidence}% confidence) — ${i.implication ?? i.detail}`;
    });

  const insufficient = analysis.insights.filter(
    (i) => i.posture === "insufficient_evidence",
  );
  for (const item of insufficient.slice(0, 2)) {
    recommendedJudgement.push(
      `Insufficient evidence: ${item.title} — do not manufacture certainty.`,
    );
  }
  if (recommendedJudgement.length === 0) {
    recommendedJudgement.push(
      "Monitor — evidence does not yet support a forced recommendation.",
    );
  }

  const evidence = [
    ...material.slice(0, 6).map((i) => `${i.title}: ${i.evidence.join(" · ")}`),
    ...dq.slice(0, 2).map((i) => `${i.title}: ${i.evidence.join(" · ")}`),
  ];

  const businessImplication =
    material
      .map((i) => i.implication)
      .filter(Boolean)
      .slice(0, 4)
      .join(" ") ||
    "Material commercial patterns are present; implications are limited to evidenced observations.";

  const uncertainty = [
    ...analysis.missingInformation,
    ...analysis.unsupportedConclusions,
    ...readiness.judgementReadiness.narrative.filter((line) =>
      /insufficient|constrained/i.test(line),
    ),
  ];

  const prioritiesEstablished = !/not yet been established/i.test(
    intelligent.narrative.executiveSummary,
  );

  const executiveJudgement = [
    prioritiesEstablished
      ? intelligent.narrative.executiveSummary
      : PRIORITIES_NOT_ESTABLISHED,
    judgements[0]
      ? `Priority judgement: ${judgements[0].implication ?? judgements[0].detail}`
      : material[0]
        ? `What matters: ${material[0].implication ?? material[0].detail}`
        : null,
    `${analysis.openCount} open / ${analysis.closedCount} closed records in the Executive Snapshot.`,
  ]
    .filter(Boolean)
    .join(" ");

  const dataConfidence = [
    `Data quality ${readiness.dataQuality}% · Coverage ${readiness.coverage}% · Freshness ${readiness.freshness}% · Evidence coverage ${readiness.evidenceCoverage}%.`,
    `Commercial Dataset Readiness ${readiness.commercialDatasetReadiness}% · Executive Readiness ${readiness.executiveReadiness}%.`,
    ...readiness.judgementReadiness.narrative.slice(0, 3),
    "High data quality does not equal high decision confidence when critical evidence fields are absent.",
  ].join(" ");

  return {
    title: "Commercial Executive Brief",
    executiveJudgement,
    evidence,
    businessImplication,
    councilPosition: council.framing,
    councilDisagreement: council.conflicts.map(
      (c) =>
        `${c.topic}: ${c.positions.map((p) => `${p.agentTitle} (${p.stance})`).join(" vs ")}`,
    ),
    uncertainty,
    recommendedJudgement,
    executiveValue: analysis.executiveValue.narrative,
    dataConfidence,
    executiveSummary: executiveJudgement,
    commercialHealth: `${intelligent.pulse.label} — commercial interpretation from snapshot evidence. ${readiness.judgementReadiness.narrative[0] ?? ""}`,
    pipeline: `Pipeline in View ≈ ${analysis.openPipelineValue.toLocaleString()} across ${analysis.openCount} open records. Stage mix is evidenced; CRM administration is out of scope.`,
    forecastConfidence: `Executive Readiness ${readiness.executiveReadiness}% · Dataset readiness ${readiness.commercialDatasetReadiness}% · Insight confidence ${avgInsightConfidence}%. Forecast/opportunity evidence: ${readiness.judgementReadiness.forecastOpportunityEvidence}. Activity judgement: ${readiness.judgementReadiness.activityBasedJudgement}.`,
    materialChanges: material.slice(0, 6).map((i) => i.title),
    priorityJudgements: judgements.slice(0, 5).map((i) => i.title),
    recommendedActions: recommendedJudgement,
    confidence,
    asOf: analysis.asOf,
  };
}
