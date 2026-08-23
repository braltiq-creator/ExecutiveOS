/**
 * Derive portable commercial signals from CRM sync aggregates.
 */

import {
  COMMERCIAL_SIGNAL_IDS,
  type CommercialContextBrief,
  type CommercialSignal,
  type CommercialHealthLevel,
} from "@/providers/salesforce/executive-context/types";

export type CommercialSignalInput = {
  openPipelineValue: number;
  openDeals: number;
  weightedForecast: number;
  wonValue: number;
  lostValue: number;
  atRiskDealCount: number;
  atRiskDealValue: number;
  strategicAccountCount: number;
  escalatedCases: number;
  renewalCount: number;
  forecastAccuracyPct: number;
  campaignPipelineValue: number;
};

function severityFromScore(score: number): CommercialSignal["severity"] {
  if (score >= 85) return "critical";
  if (score >= 70) return "high";
  if (score >= 50) return "moderate";
  if (score >= 30) return "low";
  return "healthy";
}

export function deriveCommercialSignals(
  input: CommercialSignalInput,
): CommercialSignal[] {
  const pipelinePressure = Math.min(
    100,
    Math.round(
      input.atRiskDealCount * 22 +
        (input.openPipelineValue > 0
          ? (input.atRiskDealValue / input.openPipelineValue) * 60
          : 0),
    ),
  );
  const forecastUncertainty = Math.min(
    100,
    Math.round(100 - input.forecastAccuracyPct),
  );
  const momentumScore = Math.min(
    100,
    Math.max(
      0,
      55 -
        Math.round((input.wonValue - input.lostValue) / 50_000) +
        input.atRiskDealCount * 8,
    ),
  );
  const customerScore = Math.min(100, input.escalatedCases * 35);
  const renewalScore = Math.min(100, input.renewalCount * 25 + customerScore * 0.3);
  const expansionScore = Math.min(
    100,
    Math.max(0, 40 - Math.round(input.campaignPipelineValue / 100_000)),
  );

  const signals: CommercialSignal[] = [
    {
      id: "pipeline_health",
      label: "Pipeline Health",
      severity: severityFromScore(pipelinePressure),
      score: pipelinePressure,
      summary: `${input.openDeals} open deals · $${input.openPipelineValue.toLocaleString()} pipeline.`,
      evidence: [
        `$${input.atRiskDealValue.toLocaleString()} at risk`,
        `${input.atRiskDealCount} stressed deals`,
      ],
      relatedEntityIds: [],
    },
    {
      id: "revenue_forecast",
      label: "Revenue Forecast",
      severity: severityFromScore(forecastUncertainty),
      score: forecastUncertainty,
      summary: `Weighted forecast $${input.weightedForecast.toLocaleString()}.`,
      evidence: [`Accuracy ${input.forecastAccuracyPct}%`],
      relatedEntityIds: [],
    },
    {
      id: "forecast_accuracy",
      label: "Forecast Accuracy",
      severity: severityFromScore(forecastUncertainty),
      score: forecastUncertainty,
      summary: `Forecast confidence at ${input.forecastAccuracyPct}%.`,
      evidence: [`Won $${input.wonValue.toLocaleString()}`],
      relatedEntityIds: [],
    },
    {
      id: "commercial_momentum",
      label: "Commercial Momentum",
      severity: severityFromScore(momentumScore),
      score: momentumScore,
      summary:
        input.wonValue >= input.lostValue
          ? "Momentum favours secured revenue over losses."
          : "Losses are outpacing secured revenue.",
      evidence: [
        `Won $${input.wonValue.toLocaleString()}`,
        `Lost $${input.lostValue.toLocaleString()}`,
      ],
      relatedEntityIds: [],
    },
    {
      id: "customer_growth",
      label: "Customer Growth",
      severity: severityFromScore(Math.max(0, 50 - input.strategicAccountCount * 5)),
      score: Math.max(0, 50 - input.strategicAccountCount * 5),
      summary: `${input.strategicAccountCount} strategic accounts in focus.`,
      evidence: [`${input.strategicAccountCount} strategic accounts`],
      relatedEntityIds: [],
    },
    {
      id: "renewal_risk",
      label: "Renewal Risk",
      severity: severityFromScore(renewalScore),
      score: renewalScore,
      summary:
        input.renewalCount > 0
          ? `${input.renewalCount} renewal-shaped opportunities need attention.`
          : "No elevated renewal risks flagged.",
      evidence: [`${input.renewalCount} renewals`],
      relatedEntityIds: [],
    },
    {
      id: "strategic_accounts",
      label: "Strategic Accounts",
      severity: severityFromScore(customerScore),
      score: customerScore,
      summary: "Strategic account attention derived from cases and deal pressure.",
      evidence: [`${input.escalatedCases} escalations`],
      relatedEntityIds: [],
    },
    {
      id: "executive_relationships",
      label: "Executive Relationships",
      severity: "low",
      score: 25,
      summary: "Executive sponsors mapped from commercial contacts.",
      evidence: ["Contact titles and account ownership"],
      relatedEntityIds: [],
    },
    {
      id: "sales_capacity",
      label: "Sales Capacity",
      severity: severityFromScore(Math.min(100, input.openDeals * 6)),
      score: Math.min(100, input.openDeals * 6),
      summary: `${input.openDeals} active commercial pursuits in motion.`,
      evidence: [`${input.openDeals} open deals`],
      relatedEntityIds: [],
    },
    {
      id: "market_expansion",
      label: "Market Expansion",
      severity: severityFromScore(expansionScore),
      score: expansionScore,
      summary: `Campaign-influenced pipeline $${input.campaignPipelineValue.toLocaleString()}.`,
      evidence: [`$${input.campaignPipelineValue.toLocaleString()} campaign pipeline`],
      relatedEntityIds: [],
    },
    {
      id: "commercial_bottlenecks",
      label: "Commercial Bottlenecks",
      severity: severityFromScore(pipelinePressure),
      score: pipelinePressure,
      summary:
        input.atRiskDealCount > 0
          ? "Large deals and renewals are constraining forecast confidence."
          : "No material commercial bottlenecks detected.",
      evidence: [`${input.atRiskDealCount} at-risk deals`],
      relatedEntityIds: [],
    },
    {
      id: "customer_health",
      label: "Customer Health",
      severity: severityFromScore(customerScore),
      score: customerScore,
      summary:
        input.escalatedCases > 0
          ? "Customer satisfaction risk elevated by escalations."
          : "Customer health signals are calm.",
      evidence: [`${input.escalatedCases} escalated cases`],
      relatedEntityIds: [],
    },
  ];

  const ids = new Set(signals.map((s) => s.id));
  for (const id of COMMERCIAL_SIGNAL_IDS) {
    if (!ids.has(id)) throw new Error(`Missing commercial signal ${id}`);
  }
  return signals;
}

export function commercialHealthFromSignals(
  signals: CommercialSignal[],
): CommercialContextBrief["commercialHealth"] {
  const worst = Math.max(...signals.map((s) => s.score), 0);
  let level: CommercialHealthLevel = "healthy";
  if (worst >= 85) level = "critical";
  else if (worst >= 70) level = "strained";
  else if (worst >= 50) level = "watch";

  const labels: Record<CommercialHealthLevel, string> = {
    healthy: "Commercial health strong",
    watch: "Commercial health on watch",
    strained: "Commercial health strained",
    critical: "Commercial health critical",
  };

  return {
    level,
    label: labels[level],
    detail:
      level === "healthy"
        ? "Pipeline and forecast within executive tolerance."
        : "Commercial pressure requires leadership attention today.",
  };
}
