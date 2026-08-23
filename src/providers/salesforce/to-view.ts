import type {
  CommercialContextBrief,
  CommercialContextView,
} from "@/providers/salesforce/executive-context/types";

export function toCommercialContextView(
  brief: CommercialContextBrief,
): CommercialContextView {
  return {
    framing: brief.framing,
    commercialHealth: brief.commercialHealth,
    pipelineHealth: {
      label: brief.pipelineHealth.label,
      openPipelineValue: brief.pipelineHealth.openPipelineValue,
      openDeals: brief.pipelineHealth.openDeals,
      weightedForecast: brief.pipelineHealth.weightedForecast,
      detail: brief.pipelineHealth.detail,
    },
    revenueForecast: {
      label: brief.revenueForecast.label,
      forecastValue: brief.revenueForecast.forecastValue,
      accuracyPct: brief.revenueForecast.accuracyPct,
      detail: brief.revenueForecast.detail,
    },
    commercialRisks: brief.commercialRisks.map((r) => ({
      title: r.title,
      kind: r.kind,
      severity: r.severity,
      detail: r.detail,
    })),
    strategicAccounts: brief.strategicAccounts.map((a) => ({
      name: a.name,
      attention: a.attention,
      severity: a.severity,
    })),
    renewalRisks: brief.renewalRisks.map((r) => ({
      title: r.title,
      detail: r.detail,
      severity: r.severity,
    })),
    largeDealsAtRisk: brief.largeDealsAtRisk.map((d) => ({
      title: d.title,
      amount: d.amount,
      reason: d.reason,
    })),
    forecastConfidence: {
      label: brief.revenueForecast.label,
      accuracyPct: brief.revenueForecast.accuracyPct,
      detail: brief.revenueForecast.detail,
    },
    salesMomentum: {
      label: brief.salesMomentum.label,
      detail: brief.salesMomentum.detail,
    },
    customerHealth: {
      label: brief.customerHealth.label,
      detail: brief.customerHealth.detail,
    },
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
