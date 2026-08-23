/**
 * Expansion signals — land-and-expand without implying modules exist.
 */

import type { ManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import type { ExpansionSignal } from "./types";

export function buildManufacturingExpansionSignals(input: {
  analysis?: ManufacturingAnalysis | null;
  forecastingActive?: boolean;
}): ExpansionSignal[] {
  const analysis = input.analysis;
  const forecastingActive = input.forecastingActive !== false;

  const inventoryCoverage =
    analysis?.fieldCoverage.find((f) => f.field === "inventoryDays")?.rate ?? 0;
  const capacityCoverage =
    analysis?.fieldCoverage.find((f) => f.field === "capacity")?.rate ?? 0;
  const dealerPresent = (analysis?.dealers.length ?? 0) > 0;

  return [
    {
      id: "manufacturing_forecasting",
      label: "Forecasting",
      status: forecastingActive ? "active" : "not_active",
      rationale: forecastingActive
        ? "Active Design Partner module."
        : "Not active.",
    },
    {
      id: "inventory_intelligence",
      label: "Inventory Intelligence",
      status: "not_active",
      rationale:
        inventoryCoverage > 40
          ? "Potential next module — inventory fields present in export; module not active."
          : "Potential next module — inventory coverage not yet established; module not active.",
    },
    {
      id: "production_capacity",
      label: "Production Capacity",
      status: "not_active",
      rationale:
        capacityCoverage > 40
          ? "Potential next module — capacity fields present; module not active."
          : "Potential next module — capacity coverage not yet established; module not active.",
    },
    {
      id: "dealer_demand",
      label: "Dealer Demand",
      status: "not_active",
      rationale: dealerPresent
        ? "Potential next module — dealer identifiers present; module not active."
        : "Potential next module — dealer demand not established; module not active.",
    },
  ];
}
