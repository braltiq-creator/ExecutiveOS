/**
 * Portable datasets — expected signal shapes for scenario evaluation (tenant-agnostic).
 */

import type { IntelligenceProfileId } from "@/profiles";

export type ScenarioDatasetSignal = {
  scenarioId: string;
  signalKeys: string[];
  minimumSignals: number;
  description: string;
};

const OPERATIONS_SIGNALS: ScenarioDatasetSignal[] = [
  {
    scenarioId: "ops-overnight-changes",
    signalKeys: ["sinceYesterday", "overnightChanges", "executiveContext"],
    minimumSignals: 1,
    description: "Overnight delta signals",
  },
  {
    scenarioId: "ops-jobs-attention",
    signalKeys: ["jobsAtRisk", "criticalJobs", "operationalRecommendations"],
    minimumSignals: 1,
    description: "Jobs requiring attention",
  },
  {
    scenarioId: "ops-customers-at-risk",
    signalKeys: ["customersAtRisk", "customerDelivery"],
    minimumSignals: 1,
    description: "Customer risk",
  },
  {
    scenarioId: "ops-capacity-constrained",
    signalKeys: ["bottlenecks", "capacity"],
    minimumSignals: 1,
    description: "Capacity constraints",
  },
  {
    scenarioId: "ops-technicians-overloaded",
    signalKeys: ["technicianUtilisation", "overloadedTechnicians"],
    minimumSignals: 1,
    description: "Technician overload",
  },
  {
    scenarioId: "ops-revenue-threats",
    signalKeys: ["cashCollection", "revenueThreats"],
    minimumSignals: 1,
    description: "Revenue threats",
  },
  {
    scenarioId: "ops-projects-slipping",
    signalKeys: ["projectsSlipping", "deliveryRisk"],
    minimumSignals: 1,
    description: "Project slippage",
  },
  {
    scenarioId: "ops-safety-escalation",
    signalKeys: ["safetySignals"],
    minimumSignals: 0,
    description: "Safety (zero acceptable when none material)",
  },
  {
    scenarioId: "ops-asset-risk",
    signalKeys: ["assetRisk", "assetAvailability"],
    minimumSignals: 0,
    description: "Asset risk",
  },
  {
    scenarioId: "ops-focus-today",
    signalKeys: ["recommendedActions", "agenda"],
    minimumSignals: 1,
    description: "Today focus",
  },
];

const COMMERCIAL_SIGNALS: ScenarioDatasetSignal[] = [
  {
    scenarioId: "com-overnight-changes",
    signalKeys: ["sinceYesterday", "overnightChanges", "executiveContext"],
    minimumSignals: 1,
    description: "Overnight commercial delta",
  },
  {
    scenarioId: "com-opportunities-intervention",
    signalKeys: ["opportunitiesAtRisk", "interventionOpportunities"],
    minimumSignals: 1,
    description: "Opportunities needing intervention",
  },
  {
    scenarioId: "com-strategic-accounts",
    signalKeys: ["strategicAccounts", "accountHealth"],
    minimumSignals: 1,
    description: "Strategic account health",
  },
  {
    scenarioId: "com-forecast-confidence",
    signalKeys: ["forecastConfidence"],
    minimumSignals: 1,
    description: "Forecast confidence",
  },
  {
    scenarioId: "com-renewals-at-risk",
    signalKeys: ["renewalsAtRisk"],
    minimumSignals: 1,
    description: "Renewals at risk",
  },
  {
    scenarioId: "com-customers-contact",
    signalKeys: ["customersToContact", "commercialRecommendations"],
    minimumSignals: 1,
    description: "Customers to contact",
  },
  {
    scenarioId: "com-commercial-risks",
    signalKeys: ["commercialRisks"],
    minimumSignals: 1,
    description: "Commercial risks",
  },
  {
    scenarioId: "com-executive-coaching",
    signalKeys: ["coachingNeeds"],
    minimumSignals: 0,
    description: "Coaching needs",
  },
  {
    scenarioId: "com-revenue-risks",
    signalKeys: ["revenueRisks", "forecastConfidence"],
    minimumSignals: 1,
    description: "Revenue risks",
  },
  {
    scenarioId: "com-prioritise-today",
    signalKeys: ["recommendedActions", "agenda"],
    minimumSignals: 1,
    description: "Today priorities",
  },
];

export function getScenarioDatasetSignals(
  profileId: IntelligenceProfileId,
): ScenarioDatasetSignal[] {
  return profileId === "commercial_executive"
    ? COMMERCIAL_SIGNALS
    : OPERATIONS_SIGNALS;
}

export function getDatasetSignalForScenario(
  scenarioId: string,
): ScenarioDatasetSignal | undefined {
  return [...OPERATIONS_SIGNALS, ...COMMERCIAL_SIGNALS].find(
    (s) => s.scenarioId === scenarioId,
  );
}
