/**
 * Toggleable Global Intelligence Map layers.
 * Domain-agnostic — Manufacturing / Mining / Utilities bind markers into these ids.
 */

export type IntelligenceMapLayerId =
  | "demand"
  | "facilities"
  | "distribution"
  | "capacity"
  | "inventory"
  | "forecast"
  | "risks";

export type IntelligenceMapLayerDefinition = {
  id: IntelligenceMapLayerId;
  label: string;
  description: string;
  defaultEnabled: boolean;
};

export const INTELLIGENCE_MAP_LAYERS: IntelligenceMapLayerDefinition[] = [
  {
    id: "demand",
    label: "Demand intensity",
    description: "Derived demand concentration (heatmap · not rainbow choropleth)",
    defaultEnabled: true,
  },
  {
    id: "facilities",
    label: "Manufacturing facilities",
    description: "Plants / sites — verified coordinates or region-resolved only",
    defaultEnabled: true,
  },
  {
    id: "distribution",
    label: "Dealer & distribution",
    description: "Dealer / channel network indicators",
    defaultEnabled: true,
  },
  {
    id: "capacity",
    label: "Production capacity",
    description: "Capacity and load signals where evidence exists",
    defaultEnabled: false,
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Inventory attention and finished-goods signals",
    defaultEnabled: false,
  },
  {
    id: "forecast",
    label: "Forecast intelligence",
    description: "Forecast vs actual variance at regional placement",
    defaultEnabled: false,
  },
  {
    id: "risks",
    label: "Risks & exceptions",
    description: "Operational exceptions requiring attention (gold)",
    defaultEnabled: true,
  },
];

export function defaultLayerState(): Record<IntelligenceMapLayerId, boolean> {
  return Object.fromEntries(
    INTELLIGENCE_MAP_LAYERS.map((l) => [l.id, l.defaultEnabled]),
  ) as Record<IntelligenceMapLayerId, boolean>;
}
