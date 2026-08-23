/**
 * Collect portable signal presence for scenario evaluation.
 * Counts/presence only — no cross-tenant business payloads.
 */

import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";

export type ScenarioSignalBag = Record<string, number>;

export function signalsFromIntelligentSnapshot(
  snapshot: IntelligentExecutiveSnapshot,
): ScenarioSignalBag {
  const ops = snapshot.operationalContextBrief;
  const com = snapshot.commercialContextBrief;
  return {
    sinceYesterday: snapshot.narrative.sinceYesterday.length,
    overnightChanges: snapshot.narrative.sinceYesterday.length,
    executiveContext: snapshot.executiveContextBrief ? 1 : 0,
    recommendedActions: snapshot.recommendations.length,
    agenda: snapshot.agendaBrief?.items.length ?? 0,
    jobsAtRisk: ops?.jobsAtRisk.length ?? 0,
    criticalJobs: ops?.serviceDelivery.criticalJobs ?? 0,
    operationalRecommendations: ops?.recommendations.length ?? 0,
    customersAtRisk:
      (ops?.customerRisks.length ?? 0) + (ops?.criticalCustomers.length ?? 0),
    customerDelivery: ops?.serviceDelivery ? 1 : 0,
    bottlenecks: ops?.bottlenecks.length ?? 0,
    capacity: ops?.capacity ? 1 : 0,
    technicianUtilisation: ops?.technicianUtilisation ? 1 : 0,
    overloadedTechnicians:
      ops && ops.technicianUtilisation.utilisedPct >= 85 ? 1 : 0,
    cashCollection: ops?.cashCollection ? 1 : 0,
    revenueThreats:
      ops &&
      (ops.cashCollection.overdueValue > 0 ||
        ops.revenuePipeline.acceptedQuotesValue > 0)
        ? 1
        : 0,
    projectsSlipping:
      ops?.bottlenecks.filter((b) =>
        /project|slip|delay|delivery/i.test(`${b.title} ${b.impact}`),
      ).length ?? 0,
    deliveryRisk: ops?.jobsAtRisk.length ?? 0,
    safetySignals: ops?.safetySignals.length ?? 0,
    assetRisk:
      ops && ops.assetAvailability.level !== "healthy" ? 1 : 0,
    assetAvailability: ops?.assetAvailability ? 1 : 0,
    opportunitiesAtRisk: com?.largeDealsAtRisk.length ?? 0,
    interventionOpportunities: com?.largeDealsAtRisk.length ?? 0,
    strategicAccounts: com?.strategicAccounts.length ?? 0,
    accountHealth: com?.customerHealth ? 1 : 0,
    forecastConfidence: com?.revenueForecast ? 1 : 0,
    renewalsAtRisk: com?.renewalRisks.length ?? 0,
    customersToContact:
      (com?.strategicAccounts.filter((a) => a.severity !== "healthy").length ??
        0) + (com?.recommendations.length ? 1 : 0),
    commercialRecommendations: com?.recommendations.length ?? 0,
    commercialRisks: com?.commercialRisks.length ?? 0,
    coachingNeeds:
      com?.signals.filter((s) =>
        /coach|forecast|hygiene/i.test(`${s.label} ${s.summary}`),
      ).length ?? 0,
    revenueRisks:
      (com?.commercialRisks.length ?? 0) + (com?.renewalRisks.length ?? 0),
  };
}

export function signalsFromPresentationSnapshot(
  snapshot: ExecutiveSnapshot,
): ScenarioSignalBag {
  const ops = snapshot.operationalContext;
  const com = snapshot.commercialContext;
  return {
    sinceYesterday: snapshot.sinceYesterday.length,
    overnightChanges: snapshot.sinceYesterday.length,
    executiveContext: snapshot.executiveContext ? 1 : 0,
    recommendedActions: snapshot.recommendedActions.length,
    agenda: snapshot.executiveAgenda?.items.length ?? 0,
    jobsAtRisk: ops?.jobsAtRisk.length ?? 0,
    criticalJobs: ops?.serviceDelivery.criticalJobs ?? 0,
    operationalRecommendations: ops?.recommendations.length ?? 0,
    customersAtRisk:
      (ops?.customerRisks.length ?? 0) + (ops?.criticalCustomers.length ?? 0),
    customerDelivery: ops?.serviceDelivery ? 1 : 0,
    bottlenecks: ops?.bottlenecks.length ?? 0,
    capacity: ops?.capacity ? 1 : 0,
    technicianUtilisation: ops?.technicianUtilisation ? 1 : 0,
    overloadedTechnicians:
      ops && ops.technicianUtilisation.utilisedPct >= 85 ? 1 : 0,
    cashCollection: ops?.cashCollection ? 1 : 0,
    revenueThreats:
      ops &&
      (ops.cashCollection.overdueValue > 0 ||
        ops.revenuePipeline.acceptedQuotesValue > 0)
        ? 1
        : 0,
    projectsSlipping: ops?.bottlenecks.length ?? 0,
    deliveryRisk: ops?.jobsAtRisk.length ?? 0,
    safetySignals: ops?.safetySignals.length ?? 0,
    assetRisk: ops?.assetAvailability ? 1 : 0,
    assetAvailability: ops?.assetAvailability ? 1 : 0,
    opportunitiesAtRisk: com?.largeDealsAtRisk.length ?? 0,
    interventionOpportunities: com?.largeDealsAtRisk.length ?? 0,
    strategicAccounts: com?.strategicAccounts.length ?? 0,
    accountHealth: com?.customerHealth ? 1 : 0,
    forecastConfidence: com?.revenueForecast || com?.forecastConfidence ? 1 : 0,
    renewalsAtRisk: com?.renewalRisks.length ?? 0,
    customersToContact:
      (com?.recommendations.length ?? 0) +
      (com?.strategicAccounts.length ? 1 : 0),
    commercialRecommendations: com?.recommendations.length ?? 0,
    commercialRisks: com?.commercialRisks.length ?? 0,
    coachingNeeds: 0,
    revenueRisks:
      (com?.commercialRisks.length ?? 0) + (com?.renewalRisks.length ?? 0),
  };
}
