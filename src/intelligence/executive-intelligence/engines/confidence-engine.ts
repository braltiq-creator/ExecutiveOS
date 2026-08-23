import type {
  ConfidenceDriver,
  ConfidenceScore,
  EnterpriseSignals,
} from "@/intelligence/executive-intelligence/types";
import { average, clampScore } from "@/intelligence/executive-intelligence/lib/helpers";

/**
 * Confidence Engine — never invent certainty.
 * Aggregates completeness, freshness, agreement, history, prediction, AI.
 */
export function assessConfidence(input: {
  label: string;
  dataCompleteness: number;
  freshnessHours: number;
  sourceAgreement: number;
  historicalReliability: number;
  predictionCertainty: number;
  aiReasoningConfidence: number;
}): ConfidenceScore {
  const drivers: ConfidenceDriver[] = [
    {
      id: "data_completeness",
      label: "Data completeness",
      weight: scoreContribution(input.dataCompleteness, 0.22),
      evidence: `Completeness at ${Math.round(input.dataCompleteness)}%.`,
    },
    {
      id: "freshness",
      label: "Freshness",
      weight: freshnessWeight(input.freshnessHours),
      evidence:
        input.freshnessHours <= 12
          ? "Signals refreshed within the operating window."
          : `Signals are ${Math.round(input.freshnessHours)}h old — trust softens.`,
    },
    {
      id: "source_agreement",
      label: "Source agreement",
      weight: scoreContribution(input.sourceAgreement, 0.18),
      evidence: `Independent sources agree at ${Math.round(input.sourceAgreement)}%.`,
    },
    {
      id: "historical_reliability",
      label: "Historical reliability",
      weight: scoreContribution(input.historicalReliability, 0.16),
      evidence: `Similar judgements held at ${Math.round(input.historicalReliability)}% reliability.`,
    },
    {
      id: "prediction_certainty",
      label: "Prediction certainty",
      weight: scoreContribution(input.predictionCertainty, 0.14),
      evidence: `Forward path certainty ${Math.round(input.predictionCertainty)}%.`,
    },
    {
      id: "ai_reasoning",
      label: "AI reasoning confidence",
      weight: scoreContribution(input.aiReasoningConfidence, 0.12),
      evidence: `Advisor model confidence ${Math.round(input.aiReasoningConfidence)}%.`,
    },
  ];

  const base = 62;
  const raw = base + drivers.reduce((sum, driver) => sum + driver.weight, 0);
  const ceiling = clampScore(
    55 +
      input.dataCompleteness * 0.25 +
      input.sourceAgreement * 0.15 -
      Math.max(0, input.freshnessHours - 24) * 0.4,
  );
  const value = clampScore(Math.min(raw, ceiling));

  return {
    value,
    ceiling,
    drivers,
    reasoning: `${input.label} confidence is ${value}% (ceiling ${ceiling}%) — limited by the weakest trust driver, not inflated by averages.`,
  };
}

export function assessPortfolioConfidence(
  signals: EnterpriseSignals,
): ConfidenceScore {
  const outcomeConf = average(signals.outcomes.map((o) => o.confidence));
  const decisionConf = average(signals.decisions.map((d) => d.confidence));
  const completeness =
    signals.outcomes.length === 0
      ? 40
      : clampScore(
          50 +
            signals.outcomes.length * 8 +
            signals.decisions.length * 4 +
            signals.outcomes.filter((o) => o.history.length >= 2).length * 4,
        );

  return assessConfidence({
    label: "Portfolio",
    dataCompleteness: completeness,
    freshnessHours: 6,
    sourceAgreement: clampScore((outcomeConf + decisionConf) / 2),
    historicalReliability: clampScore(outcomeConf - 4),
    predictionCertainty: clampScore(outcomeConf - 8),
    aiReasoningConfidence: clampScore(outcomeConf - 4),
  });
}

function scoreContribution(score: number, scale: number): number {
  return Math.round((score - 60) * scale);
}

function freshnessWeight(hours: number): number {
  if (hours <= 6) return 8;
  if (hours <= 18) return 4;
  if (hours <= 36) return 0;
  if (hours <= 72) return -6;
  return -12;
}
