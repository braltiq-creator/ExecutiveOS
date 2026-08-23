/**
 * Manufacturing Forecasting — canonical data contract (UDG).
 *
 * ExecutiveOS interprets manufacturing demand data for executive judgement.
 * It does NOT replace MRP, ERP, APS, CMMS, or factory scheduling systems.
 *
 * Where a source field is absent: mark Not available / Not established —
 * never invent values.
 */

import { UDG_CANONICAL_FIELD_LABELS } from "./record";

/** Module identity within Industry → Module → Land → Expand. */
export const MANUFACTURING_FORECASTING_MODULE_ID =
  "manufacturing_forecasting" as const;

export const MANUFACTURING_FORECASTING_CONCEPTS = [
  "Product",
  "Model",
  "Variant",
  "Factory",
  "Region",
  "Dealer / Branch",
  "Period",
  "Forecast",
  "Actual Demand",
  "Forecast Version",
  "Forecast Confidence",
  "Order Bank",
  "Production Capacity",
  "Available Slots",
  "Inventory",
  "Inventory Days",
  "Backlog",
  "Allocation",
] as const;

/**
 * UDG canonical field keys used by Manufacturing Forecasting Intelligence.
 * Aliases are resolved in data-gateway mapping — Excel remains a connector only.
 */
export const MANUFACTURING_FORECASTING_FIELDS = [
  "period",
  "region",
  "dealer",
  "branch",
  "model",
  "variant",
  "factory",
  "forecastQuantity",
  "actualQuantity",
  "orderBankQuantity",
  "productionCapacity",
  "availableSlots",
  "finishedGoods",
  "inventoryDays",
  "forecastVersion",
] as const;

export type ManufacturingForecastingField =
  (typeof MANUFACTURING_FORECASTING_FIELDS)[number];

/** Minimum fields to establish a manufacturing forecast shape. */
export const MANUFACTURING_FORECASTING_REQUIRED_HINTS = [
  "model",
  "forecastQuantity",
] as const;

export function manufacturingForecastingFieldLabel(
  field: ManufacturingForecastingField,
): string {
  return UDG_CANONICAL_FIELD_LABELS[field] ?? field;
}

export function isManufacturingForecastingField(
  field: string,
): field is ManufacturingForecastingField {
  return (MANUFACTURING_FORECASTING_FIELDS as readonly string[]).includes(field);
}
