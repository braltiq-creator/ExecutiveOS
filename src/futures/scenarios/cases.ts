import type { FutureCaseKind } from "@/futures/models/types";

export const FUTURE_CASE_LABELS: Record<FutureCaseKind, string> = {
  best_case: "Best Case",
  expected_case: "Expected Case",
  worst_case: "Worst Case",
  most_likely: "Most Likely",
  black_swan: "Black Swan",
};

export type FutureCaseTemplate = {
  kind: FutureCaseKind;
  titleSuffix: string;
  probabilityBias: number;
  confidenceBias: number;
  tone: "upside" | "base" | "downside" | "tail";
};

export const FUTURE_CASE_TEMPLATES: FutureCaseTemplate[] = [
  {
    kind: "most_likely",
    titleSuffix: "continues on the current trajectory",
    probabilityBias: 12,
    confidenceBias: 8,
    tone: "base",
  },
  {
    kind: "expected_case",
    titleSuffix: "plays out as the operating plan assumes",
    probabilityBias: 6,
    confidenceBias: 6,
    tone: "base",
  },
  {
    kind: "best_case",
    titleSuffix: "improves if interventions land on time",
    probabilityBias: -8,
    confidenceBias: -4,
    tone: "upside",
  },
  {
    kind: "worst_case",
    titleSuffix: "deteriorates if pressure compounds",
    probabilityBias: -4,
    confidenceBias: 0,
    tone: "downside",
  },
  {
    kind: "black_swan",
    titleSuffix: "is hit by a low-probability shock",
    probabilityBias: -28,
    confidenceBias: -18,
    tone: "tail",
  },
];
