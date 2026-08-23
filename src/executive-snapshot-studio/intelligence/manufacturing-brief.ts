/**
 * Manufacturing Forecasting Executive Brief — judgement, not MRP reporting.
 */

import type { ExecutiveCouncilBrief } from "@/agents/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { StudioReadiness } from "../types";
import type { ManufacturingAnalysis } from "./manufacturing-analysis";

export type ManufacturingExecutiveBrief = {
  title: string;
  module: "manufacturing_forecasting";
  executiveJudgement: string;
  evidence: string[];
  businessImplication: string;
  councilPosition: string;
  councilDisagreement: string[];
  uncertainty: string[];
  recommendedJudgement: string[];
  executiveValue: string;
  dataConfidence: string;
  whatChanged: string[];
  whyItMatters: string;
  whereIsEvidence: string[];
  whatRequiresJudgement: string[];
  forecastConfidence: string;
  confidence: number;
  asOf: string;
  demonstrationData: boolean;
};

export function buildManufacturingExecutiveBrief(input: {
  analysis: ManufacturingAnalysis;
  readiness: StudioReadiness;
  intelligent: IntelligentExecutiveSnapshot;
  council: ExecutiveCouncilBrief;
}): ManufacturingExecutiveBrief {
  const { analysis, readiness, intelligent } = input;
  // council remains on the API for pipeline parity; Manufacturing Forecasting
  // does not auto-form Council consensus from EIE alone.

  const demand = analysis.insights.filter((i) => i.category === "demand_movement");
  const capacity = analysis.insights.filter(
    (i) => i.category === "capacity_implication",
  );
  const inventory = analysis.insights.filter(
    (i) => i.category === "inventory_implication",
  );
  const accuracy = analysis.insights.filter(
    (i) => i.category === "forecast_accuracy",
  );
  const judgements = analysis.insights.filter(
    (i) => i.category === "executive_judgement",
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

  // Specific demand/capacity signal leads the brief title.
  // Generic "requires executive judgement" framing stays available for implication only.
  const signalLead =
    demand[0] ??
    capacity[0] ??
    accuracy[0] ??
    judgements[0] ??
    analysis.insights[0];
  const framing = judgements[0];

  const evidence = [
    ...demand.flatMap((i) => i.evidence),
    ...capacity.flatMap((i) => i.evidence),
    ...inventory.flatMap((i) => i.evidence),
  ]
    .filter(Boolean)
    .slice(0, 6);

  const whatChanged = [
    ...demand.map((i) => i.title),
    ...accuracy.map((i) => i.title),
  ].slice(0, 4);

  const recommendedJudgement = analysis.insights
    .filter((i) => i.posture === "investigate" || i.posture === "act")
    .slice(0, 5)
    .map((i) => {
      const verb = i.posture === "act" ? "Consider acting on" : "Investigate";
      return `${verb}: ${i.title} (${i.confidence}% confidence) — ${i.implication ?? i.detail}`;
    });

  if (recommendedJudgement.length === 0) {
    recommendedJudgement.push(
      "Monitor — evidence does not yet support a forced manufacturing recommendation.",
    );
  }

  const national = analysis.confidenceSlices.find((s) => s.id === "national");
  const forecastConfidence =
    national?.level === "insufficient" || national?.score == null
      ? "Insufficient evidence"
      : `${national.level.toUpperCase()} (${national.score}%) — ${national.why[0] ?? ""}`;

  return {
    title: "Manufacturing Forecasting Executive Brief",
    module: "manufacturing_forecasting",
    executiveJudgement:
      signalLead?.title ??
      "Manufacturing forecast evidence is establishing — material judgement has not yet been framed.",
    evidence:
      evidence.length > 0
        ? evidence
        : ["Active manufacturing snapshot evidence is establishing."],
    businessImplication:
      framing?.implication ??
      signalLead?.implication ??
      capacity[0]?.implication ??
      "Demand, capacity, and inventory signals require ranking before binding.",
    councilPosition: "Council position not yet established.",
    councilDisagreement: [],
    uncertainty: [
      ...analysis.missingInformation.slice(0, 4),
      ...analysis.unsupportedConclusions.slice(0, 2),
    ],
    recommendedJudgement,
    executiveValue: analysis.executiveValue.narrative,
    dataConfidence: `Dataset readiness ${readiness.commercialDatasetReadiness}% · Judgement readiness ${readiness.executiveReadiness}%`,
    whatChanged:
      whatChanged.length > 0
        ? whatChanged
        : ["Forecast evidence is establishing from the active snapshot."],
    whyItMatters:
      framing?.implication ??
      signalLead?.implication ??
      "Forecast movement without ranked judgement creates capacity and inventory exposure.",
    whereIsEvidence: evidence.slice(0, 5),
    whatRequiresJudgement: framing?.implication
      ? [framing.implication]
      : recommendedJudgement.slice(0, 2).map((r) =>
          r.replace(/^(Investigate|Consider acting on):\s*/i, ""),
        ),
    forecastConfidence,
    confidence,
    asOf: analysis.asOf,
    demonstrationData: analysis.demonstrationData,
  };
}
