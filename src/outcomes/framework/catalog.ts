/**
 * Built-in and tenant-defined business outcome type catalog.
 * New types can be added without Core changes.
 */

import type { BusinessOutcomeTypeDef, BuiltInBusinessOutcomeKind } from "@/outcomes/framework/types";

const BUILT_IN: BusinessOutcomeTypeDef[] = [
  {
    id: "bot-revenue-risk",
    tenantId: null,
    kind: "revenue_risk_reduced",
    label: "Revenue risk reduced",
    description: "Near-term revenue risk mitigated through executive action",
    defaultUnit: "usd",
  },
  {
    id: "bot-forecast",
    tenantId: null,
    kind: "forecast_accuracy_improved",
    label: "Forecast accuracy improved",
    description: "Forecast confidence or accuracy improved",
    defaultUnit: "percent",
  },
  {
    id: "bot-retention",
    tenantId: null,
    kind: "customer_retention_improved",
    label: "Customer retention improved",
    description: "At-risk customer retained or relationship strengthened",
    defaultUnit: "usd",
  },
  {
    id: "bot-bottleneck",
    tenantId: null,
    kind: "operational_bottleneck_resolved",
    label: "Operational bottleneck resolved",
    description: "Capacity or delivery bottleneck cleared",
    defaultUnit: "score",
  },
  {
    id: "bot-project",
    tenantId: null,
    kind: "project_delivered_on_time",
    label: "Project delivered on time",
    description: "Slipping project recovered to plan",
    defaultUnit: "score",
  },
  {
    id: "bot-safety",
    tenantId: null,
    kind: "safety_risk_mitigated",
    label: "Safety risk mitigated",
    description: "Safety issue contained or escalated successfully",
    defaultUnit: "score",
  },
  {
    id: "bot-cash",
    tenantId: null,
    kind: "cash_collection_improved",
    label: "Cash collection improved",
    description: "Overdue collections reduced",
    defaultUnit: "usd",
  },
  {
    id: "bot-time",
    tenantId: null,
    kind: "executive_time_saved",
    label: "Executive time saved",
    description: "Time saved through orientation and prioritisation",
    defaultUnit: "hours",
  },
  {
    id: "bot-opportunity",
    tenantId: null,
    kind: "strategic_opportunity_realised",
    label: "Strategic opportunity realised",
    description: "Strategic opportunity advanced or captured",
    defaultUnit: "usd",
  },
];

const customTypes = new Map<string, BusinessOutcomeTypeDef>();

export function resetBusinessOutcomeTypes(): void {
  customTypes.clear();
}

export function listBusinessOutcomeTypes(
  tenantId?: string,
): BusinessOutcomeTypeDef[] {
  const custom = [...customTypes.values()].filter(
    (t) => t.tenantId === null || t.tenantId === tenantId,
  );
  return [...BUILT_IN, ...custom];
}

export function defineBusinessOutcomeType(input: {
  tenantId: string;
  label: string;
  description: string;
  defaultUnit?: BusinessOutcomeTypeDef["defaultUnit"];
  kind?: BuiltInBusinessOutcomeKind;
}): BusinessOutcomeTypeDef {
  const def: BusinessOutcomeTypeDef = {
    id: `bot-custom-${customTypes.size + 1}`,
    tenantId: input.tenantId,
    kind: input.kind ?? "custom",
    label: input.label,
    description: input.description,
    defaultUnit: input.defaultUnit ?? "score",
  };
  customTypes.set(def.id, def);
  return def;
}

export function getBusinessOutcomeType(
  id: string,
): BusinessOutcomeTypeDef | undefined {
  return (
    BUILT_IN.find((t) => t.id === id) ?? customTypes.get(id) ?? undefined
  );
}
