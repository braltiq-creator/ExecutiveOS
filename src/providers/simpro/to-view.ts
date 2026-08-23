import type {
  OperationalContextBrief,
  OperationalContextView,
} from "@/providers/simpro/executive-context/types";

export function toOperationalContextView(
  brief: OperationalContextBrief,
): OperationalContextView {
  return {
    framing: brief.framing,
    operationalHealth: brief.operationalHealth,
    capacity: {
      label: brief.capacity.label,
      utilisedPct: brief.capacity.utilisedPct,
      availableTechnicians: brief.capacity.availableTechnicians,
      detail: brief.capacity.detail,
    },
    fieldProductivity: {
      label: brief.fieldProductivity.label,
      utilisationPct: brief.fieldProductivity.utilisationPct,
      overtimeHours: brief.fieldProductivity.overtimeHours,
      detail: brief.fieldProductivity.detail,
    },
    technicianUtilisation: {
      label: brief.technicianUtilisation.label,
      utilisedPct: brief.technicianUtilisation.utilisedPct,
      detail: brief.technicianUtilisation.detail,
    },
    serviceDelivery: {
      openJobs: brief.serviceDelivery.openJobs,
      criticalJobs: brief.serviceDelivery.criticalJobs,
      backlogLabel: brief.serviceDelivery.backlogLabel,
      detail: brief.serviceDelivery.detail,
    },
    servicePerformance: {
      label: brief.servicePerformance.label,
      completedToday: brief.servicePerformance.completedToday,
      criticalOpen: brief.servicePerformance.criticalOpen,
      onTimePct: brief.servicePerformance.onTimePct,
      detail: brief.servicePerformance.detail,
    },
    revenuePipeline: {
      acceptedQuotesValue: brief.revenuePipeline.acceptedQuotesValue,
      openOpportunities: brief.revenuePipeline.openOpportunities,
      label: brief.revenuePipeline.label,
      detail: brief.revenuePipeline.detail,
    },
    cashCollection: {
      overdueInvoices: brief.cashCollection.overdueInvoices,
      overdueValue: brief.cashCollection.overdueValue,
      riskLevel: brief.cashCollection.riskLevel,
      detail: brief.cashCollection.detail,
    },
    jobsAtRisk: brief.jobsAtRisk.map((j) => ({
      title: j.title,
      customerName: j.customerName,
      reason: j.reason,
      severity: j.severity,
    })),
    criticalCustomers: brief.criticalCustomers.map((r) => ({
      customerName: r.customerName,
      risk: r.risk,
      severity: r.severity,
    })),
    customerRisks: brief.customerRisks.map((r) => ({
      customerName: r.customerName,
      risk: r.risk,
      severity: r.severity,
    })),
    bottlenecks: brief.bottlenecks.map((b) => ({
      title: b.title,
      kind: b.kind,
      impact: b.impact,
    })),
    safetySignals: brief.safetySignals,
    assetAvailability: {
      label: brief.assetAvailability.label,
      detail: brief.assetAvailability.detail,
    },
    operationalOpportunities: brief.operationalOpportunities.map((o) => ({
      title: o.title,
      detail: o.detail,
    })),
    signals: brief.signals.map((s) => ({
      label: s.label,
      severity: s.severity,
      summary: s.summary,
    })),
    recommendations: brief.recommendations.map((r) => ({
      title: r.title,
      why: r.why,
      urgency: r.urgency,
    })),
    closingNote: brief.closingNote,
  };
}
