/**
 * Derive portable operational signals from sync aggregates.
 */

import {
  OPERATIONAL_SIGNAL_IDS,
  type OperationalContextBrief,
  type OperationalSignal,
  type OperationalHealthLevel,
} from "@/providers/simpro/executive-context/types";

export type SignalDerivationInput = {
  openJobs: number;
  criticalJobs: number;
  availableTechnicians: number;
  unavailableTechnicians: number;
  acceptedQuotesValue: number;
  openOpportunities: number;
  overdueInvoices: number;
  overdueValue: number;
  delayedPurchaseOrders: number;
  marginRiskCount: number;
  unavailableAssets: number;
  overloadedDays: number;
};

function severityFromScore(score: number): OperationalSignal["severity"] {
  if (score >= 85) return "critical";
  if (score >= 70) return "high";
  if (score >= 50) return "moderate";
  if (score >= 30) return "low";
  return "healthy";
}

export function deriveOperationalSignals(
  input: SignalDerivationInput,
): OperationalSignal[] {
  const capacityPressure =
    input.availableTechnicians + input.unavailableTechnicians === 0
      ? 60
      : Math.round(
          (input.unavailableTechnicians /
            (input.availableTechnicians + input.unavailableTechnicians)) *
            100,
        );
  const backlogScore = Math.min(100, input.openJobs * 8 + input.criticalJobs * 15);
  const cashScore = Math.min(100, input.overdueInvoices * 25 + input.overdueValue / 2000);
  const deliveryScore = Math.min(100, input.criticalJobs * 30 + input.overloadedDays * 20);
  const marginScore = Math.min(100, input.marginRiskCount * 35);
  const supplyScore = Math.min(100, input.delayedPurchaseOrders * 40);
  const assetScore = Math.min(100, input.unavailableAssets * 35);
  const pipelineScore = Math.max(
    0,
    40 - Math.min(40, input.openOpportunities * 5) + (input.acceptedQuotesValue > 0 ? 0 : 20),
  );

  const signals: OperationalSignal[] = [
    {
      id: "operational_capacity",
      label: "Operational Capacity",
      severity: severityFromScore(capacityPressure),
      score: capacityPressure,
      summary:
        capacityPressure >= 50
          ? "Field capacity is constrained by unavailable technicians."
          : "Field capacity is within a manageable range.",
      evidence: [
        `${input.availableTechnicians} available`,
        `${input.unavailableTechnicians} unavailable`,
      ],
      relatedEntityIds: [],
    },
    {
      id: "field_productivity",
      label: "Field Productivity",
      severity: severityFromScore(Math.max(0, 70 - input.openJobs * 3)),
      score: Math.max(0, 70 - input.openJobs * 3),
      summary: `${input.openJobs} open service commitments in the field.`,
      evidence: [`${input.openJobs} open jobs`],
      relatedEntityIds: [],
    },
    {
      id: "revenue_pipeline",
      label: "Revenue Pipeline",
      severity: severityFromScore(pipelineScore),
      score: pipelineScore,
      summary: `Accepted pipeline value $${input.acceptedQuotesValue.toLocaleString()}.`,
      evidence: [
        `$${input.acceptedQuotesValue.toLocaleString()} accepted`,
        `${input.openOpportunities} open opportunities`,
      ],
      relatedEntityIds: [],
    },
    {
      id: "customer_delivery_risk",
      label: "Customer Delivery Risk",
      severity: severityFromScore(deliveryScore),
      score: deliveryScore,
      summary:
        input.criticalJobs > 0
          ? `${input.criticalJobs} critical delivery commitment(s) need executive attention.`
          : "No critical delivery commitments flagged.",
      evidence: [`${input.criticalJobs} critical jobs`],
      relatedEntityIds: [],
    },
    {
      id: "cash_collection_risk",
      label: "Cash Collection Risk",
      severity: severityFromScore(cashScore),
      score: cashScore,
      summary:
        input.overdueInvoices > 0
          ? `${input.overdueInvoices} overdue invoice(s) totalling $${input.overdueValue.toLocaleString()}.`
          : "Collections position is clear.",
      evidence: [`$${input.overdueValue.toLocaleString()} overdue`],
      relatedEntityIds: [],
    },
    {
      id: "technician_availability",
      label: "Technician Availability",
      severity: severityFromScore(capacityPressure),
      score: capacityPressure,
      summary: `${input.availableTechnicians} technicians available for allocation.`,
      evidence: [`${input.unavailableTechnicians} unavailable`],
      relatedEntityIds: [],
    },
    {
      id: "project_health",
      label: "Project Health",
      severity: severityFromScore(marginScore),
      score: marginScore,
      summary:
        input.marginRiskCount > 0
          ? `${input.marginRiskCount} project(s) showing margin pressure.`
          : "Project margins within tolerance.",
      evidence: [`${input.marginRiskCount} margin risks`],
      relatedEntityIds: [],
    },
    {
      id: "operational_bottlenecks",
      label: "Operational Bottlenecks",
      severity: severityFromScore(Math.max(supplyScore, deliveryScore * 0.6)),
      score: Math.max(supplyScore, Math.round(deliveryScore * 0.6)),
      summary:
        input.delayedPurchaseOrders > 0 || input.overloadedDays > 0
          ? "Supply or scheduling bottlenecks are constraining delivery."
          : "No material operational bottlenecks detected.",
      evidence: [
        `${input.delayedPurchaseOrders} delayed POs`,
        `${input.overloadedDays} overloaded schedule day(s)`,
      ],
      relatedEntityIds: [],
    },
    {
      id: "margin_risk",
      label: "Margin Risk",
      severity: severityFromScore(marginScore),
      score: marginScore,
      summary:
        input.marginRiskCount > 0
          ? "Margin erosion requires commercial intervention."
          : "Margins stable.",
      evidence: [`${input.marginRiskCount} at-risk projects`],
      relatedEntityIds: [],
    },
    {
      id: "service_backlog",
      label: "Service Backlog",
      severity: severityFromScore(backlogScore),
      score: backlogScore,
      summary: `Service backlog stands at ${input.openJobs} open commitment(s).`,
      evidence: [`${input.openJobs} open`, `${input.criticalJobs} critical`],
      relatedEntityIds: [],
    },
    {
      id: "safety_signal",
      label: "Safety Signals",
      severity: input.criticalJobs > 0 ? "moderate" : "healthy",
      score: input.criticalJobs > 0 ? 45 : 10,
      summary:
        input.criticalJobs > 0
          ? "Critical field work elevates safety and escalation awareness."
          : "No elevated safety signals from operations.",
      evidence: [`${input.criticalJobs} critical jobs`],
      relatedEntityIds: [],
    },
    {
      id: "asset_availability",
      label: "Asset Availability",
      severity: severityFromScore(assetScore),
      score: assetScore,
      summary:
        input.unavailableAssets > 0
          ? `${input.unavailableAssets} asset(s) unavailable or in fault.`
          : "Assets available for service.",
      evidence: [`${input.unavailableAssets} unavailable`],
      relatedEntityIds: [],
    },
  ];

  // Ensure catalogue completeness
  const ids = new Set(signals.map((s) => s.id));
  for (const id of OPERATIONAL_SIGNAL_IDS) {
    if (!ids.has(id)) {
      throw new Error(`Missing operational signal ${id}`);
    }
  }
  return signals;
}

export function operationalHealthFromSignals(
  signals: OperationalSignal[],
): OperationalContextBrief["operationalHealth"] {
  const worst = Math.max(...signals.map((s) => s.score), 0);
  let level: OperationalHealthLevel = "healthy";
  if (worst >= 85) level = "critical";
  else if (worst >= 70) level = "strained";
  else if (worst >= 50) level = "watch";

  const labels: Record<OperationalHealthLevel, string> = {
    healthy: "Operations healthy",
    watch: "Operations on watch",
    strained: "Operations strained",
    critical: "Operations critical",
  };

  return {
    level,
    label: labels[level],
    detail:
      level === "healthy"
        ? "Field operations are within executive tolerance."
        : "Operational pressure requires leadership attention today.",
  };
}
