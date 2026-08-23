import type { AlertThresholds } from "@/operations/observability/types";

const defaults: AlertThresholds = {
  platformErrorRatePct: 3,
  apiP95LatencyMs: 250,
  providerAvailabilityPct: 97,
  evsDeclinePoints: 10,
  activationRateFloorPct: 50,
  trialConversionFloorPct: 25,
  renewalRiskCount: 2,
  churnPct: 8,
  mrrDropPct: 10,
};

let thresholds: AlertThresholds = { ...defaults };

export function resetAlertThresholds(): void {
  thresholds = { ...defaults };
}

export function getAlertThresholds(): AlertThresholds {
  return { ...thresholds };
}

export function configureAlertThresholds(
  patch: Partial<AlertThresholds>,
): AlertThresholds {
  thresholds = { ...thresholds, ...patch };
  return getAlertThresholds();
}
