/**
 * Accuracy — discovery validation accuracy over time.
 */

import type { DiscoveryItem } from "@/onboarding/types";
import { accuracyFromValidations } from "@/onboarding/validation";

export type AccuracyReport = {
  tenantId: string;
  accuracyPct: number;
  confirmed: number;
  edited: number;
  ignored: number;
  pending: number;
  explanation: string;
};

export function measureDiscoveryAccuracy(input: {
  tenantId: string;
  discoveries: DiscoveryItem[];
}): AccuracyReport {
  const confirmed = input.discoveries.filter((d) => d.status === "confirmed").length;
  const edited = input.discoveries.filter((d) => d.status === "edited").length;
  const ignored = input.discoveries.filter((d) => d.status === "ignored").length;
  const pending = input.discoveries.filter((d) => d.status === "proposed").length;
  const accuracyPct = accuracyFromValidations(input.discoveries);

  return {
    tenantId: input.tenantId,
    accuracyPct,
    confirmed,
    edited,
    ignored,
    pending,
    explanation:
      confirmed + edited + ignored === 0
        ? "No validations yet — accuracy will appear as executives confirm discoveries."
        : `Accuracy ${accuracyPct}% from ${confirmed + edited + ignored} judged discoveries.`,
  };
}
