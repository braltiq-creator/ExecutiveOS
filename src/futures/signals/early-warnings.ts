import type {
  BusinessDriverId,
  EarlyWarningSignal,
  FutureCaseKind,
} from "@/futures/models/types";

type SignalSeed = {
  label: string;
  monitor: string;
  threshold: string;
  escalationTrigger: string;
  confidenceChange: string;
  recoveryIndicator: string;
  relatedDriverIds: BusinessDriverId[];
};

const DRIVER_SIGNAL_SEEDS: Partial<Record<BusinessDriverId, SignalSeed>> = {
  cash_flow: {
    label: "Collections lag",
    monitor: "Days sales outstanding and overdue invoice balance",
    threshold: "DSO rises >10% week-over-week or overdue > agreed policy",
    escalationTrigger: "Two consecutive weeks above threshold",
    confidenceChange: "Raises confidence in cash-pressure futures; lowers best-case",
    recoveryIndicator: "Overdue balance returns inside policy for two weeks",
    relatedDriverIds: ["cash_flow", "revenue"],
  },
  capacity: {
    label: "Attention overdraw",
    monitor: "Executive attention budget and open decision load",
    threshold: "Attention contested with ≥2 immediate decisions",
    escalationTrigger: "Review load exceeds available Focus block",
    confidenceChange: "Raises confidence in deferred / degraded execution futures",
    recoveryIndicator: "Attention returns to focused with ≤1 immediate decision",
    relatedDriverIds: ["capacity"],
  },
  customer_demand: {
    label: "Customer escalation spike",
    monitor: "Critical escalations and renewal-risk markers",
    threshold: "Critical escalations increase vs prior 7-day baseline",
    escalationTrigger: "Enterprise account enters formal escalation",
    confidenceChange: "Raises worst-case / demand-risk futures",
    recoveryIndicator: "Escalation closed with retention confirmation",
    relatedDriverIds: ["customer_demand", "revenue"],
  },
  labour_availability: {
    label: "Labour coverage gap",
    monitor: "Skilled labour availability vs committed work",
    threshold: "Coverage < committed demand for >48 hours",
    escalationTrigger: "Critical jobs slip due to unavailable technicians",
    confidenceChange: "Raises operational-risk futures",
    recoveryIndicator: "Coverage restored without overtime spike",
    relatedDriverIds: ["labour_availability", "capacity"],
  },
  asset_reliability: {
    label: "Asset failure cluster",
    monitor: "Critical asset failures and MTTR",
    threshold: "Cluster of failures on material assets within 7 days",
    escalationTrigger: "Failure impacts customer-facing SLA",
    confidenceChange: "Raises black-swan / reliability futures",
    recoveryIndicator: "MTTR returns to baseline with no repeat failure",
    relatedDriverIds: ["asset_reliability", "safety"],
  },
  strategic_initiatives: {
    label: "Initiative drift",
    monitor: "Milestone slip on material strategic initiatives",
    threshold: "Key milestone slips without compensating decision",
    escalationTrigger: "Outcome health declines with initiative linkage",
    confidenceChange: "Raises strategic-opportunity and risk futures",
    recoveryIndicator: "Milestone re-baselined with executive bind",
    relatedDriverIds: ["strategic_initiatives"],
  },
  regulatory: {
    label: "Compliance deadline pressure",
    monitor: "Open regulatory / audit findings near deadline",
    threshold: "Finding unresolved inside 14 days of deadline",
    escalationTrigger: "Regulator engagement or licence risk raised",
    confidenceChange: "Raises regulatory worst-case futures",
    recoveryIndicator: "Finding closed with evidence pack",
    relatedDriverIds: ["regulatory"],
  },
};

export function buildLeadingIndicators(input: {
  futureId: string;
  caseKind: FutureCaseKind;
  drivers: BusinessDriverId[];
}): EarlyWarningSignal[] {
  const signals: EarlyWarningSignal[] = [];
  const seen = new Set<string>();

  for (const driver of input.drivers) {
    const seed = DRIVER_SIGNAL_SEEDS[driver];
    if (!seed || seen.has(seed.label)) continue;
    seen.add(seed.label);
    signals.push({
      id: `${input.futureId}-sig-${driver}`,
      ...seed,
      confidenceChange: adaptConfidenceChange(seed.confidenceChange, input.caseKind),
    });
  }

  if (signals.length === 0) {
    signals.push({
      id: `${input.futureId}-sig-general`,
      label: "Outcome health drift",
      monitor: "Material outcome health and overnight signal severity",
      threshold: "Any material outcome moves off-track",
      escalationTrigger: "Two outcomes decline in the same week",
      confidenceChange: adaptConfidenceChange(
        "Raises pressure futures; lowers best-case confidence",
        input.caseKind,
      ),
      recoveryIndicator: "Outcome health stabilises for two refresh cycles",
      relatedDriverIds: input.drivers.slice(0, 2),
    });
  }

  return signals.slice(0, 4);
}

function adaptConfidenceChange(
  base: string,
  caseKind: FutureCaseKind,
): string {
  if (caseKind === "best_case") {
    return `${base} — if adverse, reduce best-case confidence.`;
  }
  if (caseKind === "worst_case" || caseKind === "black_swan") {
    return `${base} — if adverse, raise this future's confidence.`;
  }
  return base;
}
