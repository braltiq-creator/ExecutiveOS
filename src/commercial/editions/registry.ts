import type {
  CommercialEdition,
  CommercialEditionId,
} from "@/commercial/framework/types";

const editions = new Map<CommercialEditionId, CommercialEdition>();

function seedDefaults(): void {
  if (editions.size > 0) return;
  const asOf = "2026-07-26T00:00:00.000Z";

  editions.set("operations_executive", {
    id: "operations_executive",
    name: "Operations Executive",
    targetCustomer:
      "Field-service and operationally intensive mid-market businesses",
    targetExecutive: "CEO / COO / Operations leader",
    intelligenceProfileId: "operations_executive",
    includedProviders: ["microsoft365", "simpro"],
    includedScenarioPacks: [
      "ops-capacity-constrained",
      "ops-focus-today",
      "ops-delivery-risk",
    ],
    includedStrategicOutcomes: [
      "Improve operational reliability",
      "Protect delivery quality",
      "Strengthen customer retention through operations",
    ],
    includedReporting: [
      "Executive Brief",
      "Operational health strip",
      "Scenario scorecards",
    ],
    implementationScope: [
      "Tenant provision",
      "M365 + Simpro connection",
      "Executive discovery",
      "Scenario validation",
      "Go-live success review",
    ],
    expansionOpportunities: [
      "Add Commercial Executive edition",
      "Additional executive seats",
      "Future Intelligence Profiles",
    ],
    registeredAt: asOf,
  });

  editions.set("commercial_executive", {
    id: "commercial_executive",
    name: "Commercial Executive",
    targetCustomer:
      "Growth-oriented B2B services businesses with pipeline complexity",
    targetExecutive: "CEO / CRO / Commercial leader",
    intelligenceProfileId: "commercial_executive",
    includedProviders: ["microsoft365", "salesforce"],
    includedScenarioPacks: [
      "com-prioritise-today",
      "com-pipeline-risk",
      "com-strategic-account",
    ],
    includedStrategicOutcomes: [
      "Grow profitable revenue",
      "Strengthen strategic customer retention",
      "Improve commercial focus discipline",
    ],
    includedReporting: [
      "Executive Brief",
      "Commercial context",
      "Pipeline scenario scorecards",
    ],
    implementationScope: [
      "Tenant provision",
      "M365 + Salesforce connection",
      "Executive discovery",
      "Scenario validation",
      "Go-live success review",
    ],
    expansionOpportunities: [
      "Add Operations Executive edition",
      "Additional executive seats",
      "Future Intelligence Profiles",
    ],
    registeredAt: asOf,
  });
}

export function resetEditions(): void {
  editions.clear();
}

export function ensureDefaultEditions(): void {
  seedDefaults();
}

export function registerEdition(
  edition: Omit<CommercialEdition, "registeredAt"> & { registeredAt?: string },
): CommercialEdition {
  const record: CommercialEdition = {
    ...edition,
    registeredAt: edition.registeredAt ?? new Date().toISOString(),
  };
  editions.set(record.id, record);
  return record;
}

export function getEdition(
  id: CommercialEditionId,
): CommercialEdition | undefined {
  ensureDefaultEditions();
  return editions.get(id);
}

export function listEditions(): CommercialEdition[] {
  ensureDefaultEditions();
  return [...editions.values()];
}
