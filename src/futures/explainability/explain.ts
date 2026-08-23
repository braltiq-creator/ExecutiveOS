import type {
  Future,
  FutureExplanation,
  FutureCaseKind,
} from "@/futures/models/types";
import { FUTURE_CASE_LABELS } from "@/futures/scenarios/cases";

export function buildFutureExplanation(input: {
  caseKind: FutureCaseKind;
  title: string;
  assumptions: string[];
  supporting: string[];
  weakening: string[];
  influenceLevers: string[];
}): FutureExplanation {
  const label = FUTURE_CASE_LABELS[input.caseKind];
  return {
    whyItExists: `${label} exists because current evidence can still resolve toward this path — not because it is certain.`,
    assumptionsThatCreatedIt: input.assumptions,
    evidenceThatSupports: input.supporting,
    evidenceThatWeakens: input.weakening,
    whatWouldInvalidateIt: invalidatorsFor(input.caseKind, input.weakening),
    influenceLevers: input.influenceLevers,
  };
}

function invalidatorsFor(
  caseKind: FutureCaseKind,
  weakening: string[],
): string[] {
  const base = weakening.slice(0, 2);
  switch (caseKind) {
    case "best_case":
      return [
        ...base,
        "A material outcome moves off-track without a compensating decision.",
      ];
    case "worst_case":
      return [
        ...base,
        "Urgent interventions land and overnight signals cool for two cycles.",
      ];
    case "black_swan":
      return [
        "No shock event materialises and leading indicators stay inside threshold.",
      ];
    case "most_likely":
    case "expected_case":
    default:
      return [
        ...base,
        "Trajectory breaks — either a clear recovery or a clear deterioration.",
      ];
  }
}

export function explainFutureForExecutive(future: Future): string {
  const e = future.explanation;
  return [
    e.whyItExists,
    `Assumptions that matter: ${e.assumptionsThatCreatedIt.slice(0, 2).join("; ")}.`,
    `You can influence this via: ${e.influenceLevers.slice(0, 2).join("; ")}.`,
    `Monitor: ${future.leadingIndicators[0]?.label ?? "outcome health drift"}.`,
  ].join(" ");
}
