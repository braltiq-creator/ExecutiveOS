/**
 * Validation — confirm / edit / ignore discoveries; corrections improve inference.
 */

import type { DiscoveryItem, ValidationAction } from "@/onboarding/types";

export function applyValidationAction(input: {
  item: DiscoveryItem;
  action: ValidationAction;
  editedValue?: string;
}): DiscoveryItem {
  if (input.action === "confirm") {
    return {
      ...input.item,
      status: "confirmed",
      confidence: Math.min(99, input.item.confidence + 5),
    };
  }
  if (input.action === "ignore") {
    return { ...input.item, status: "ignored", confidence: 0 };
  }
  return {
    ...input.item,
    status: "edited",
    editableValue: input.editedValue ?? input.item.editableValue,
    label: input.editedValue ?? input.item.label,
    confidence: Math.min(99, input.item.confidence + 3),
    evidence: [
      ...input.item.evidence,
      "Corrected by executive",
    ],
  };
}

export function validationCandidates(
  discoveries: DiscoveryItem[],
  limit = 6,
): DiscoveryItem[] {
  return [...discoveries]
    .filter((d) => d.status === "proposed")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

export function accuracyFromValidations(discoveries: DiscoveryItem[]): number {
  const judged = discoveries.filter((d) =>
    ["confirmed", "edited", "ignored"].includes(d.status),
  );
  if (judged.length === 0) return 0;
  const positive = judged.filter((d) => d.status !== "ignored").length;
  return Math.round((positive / judged.length) * 100);
}
