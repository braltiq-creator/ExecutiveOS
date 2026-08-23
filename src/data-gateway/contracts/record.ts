/**
 * Canonical record contract — source-agnostic rows.
 */

export type UdgFieldValue = string | number | boolean | null;

export type UdgRawRecord = {
  /** 1-based source row index when tabular. */
  rowIndex: number;
  fields: Record<string, UdgFieldValue>;
};

export type UdgCanonicalRecord = {
  /** Stable id within the snapshot (not a global business id). */
  recordId: string;
  rowIndex: number;
  fields: Record<string, UdgFieldValue>;
};

/** Well-known canonical field keys (extensible; not customer-specific). */
export const UDG_CANONICAL_FIELDS = [
  "dealer",
  "forecastQuantity",
  "actualQuantity",
  "orderBankQuantity",
  "productionCapacity",
  "availableSlots",
  "finishedGoods",
  "inventoryDays",
  "forecastVersion",
  "factory",
  "period",
  "branch",
  "model",
  "variant",
  "region",
  "customer",
  "product",
  "quantity",
  "amount",
  "currency",
  "asOfDate",
  "status",
  "notes",
  // Commercial ontology
  "opportunity",
  "owner",
  "transactionType",
  "stage",
  "saasValue",
  "maintenanceValue",
  "licenseValue",
  "oneTimeServicesValue",
  "recurringValue",
  "pipelineValue",
  "lastStageChangeDate",
  "stageDuration",
  "stageMovement",
  "nextStep",
  "industry",
  "closeDate",
  "organisation",
  "activityEvidence",
] as const;

export type UdgCanonicalFieldKey = (typeof UDG_CANONICAL_FIELDS)[number] | string;

export const UDG_CANONICAL_FIELD_LABELS: Record<string, string> = {
  dealer: "Dealer",
  forecastQuantity: "Forecast Units",
  actualQuantity: "Actual Demand Units",
  orderBankQuantity: "Order Bank Units",
  productionCapacity: "Production Capacity Units",
  availableSlots: "Available Slots",
  finishedGoods: "Finished Goods Units",
  inventoryDays: "Inventory Days",
  forecastVersion: "Forecast Version",
  factory: "Factory",
  period: "Period",
  branch: "Branch",
  model: "Model",
  variant: "Variant",
  region: "Region",
  customer: "Customer",
  product: "Product",
  quantity: "Quantity",
  amount: "Amount",
  currency: "Currency",
  asOfDate: "As-of Date",
  status: "Status",
  notes: "Notes",
  opportunity: "Opportunity",
  owner: "Owner",
  transactionType: "Transaction",
  stage: "Stage",
  saasValue: "SaaS Value",
  maintenanceValue: "Maintenance Value",
  licenseValue: "Software License Value",
  oneTimeServicesValue: "One Time Services",
  recurringValue: "Recurring Value",
  pipelineValue: "Pipeline Value",
  lastStageChangeDate: "Last Stage Change",
  stageDuration: "Stage Duration",
  stageMovement: "Stage Movement",
  nextStep: "Next Step",
  industry: "Industry",
  closeDate: "Close Date",
  organisation: "Organisation",
  activityEvidence: "Activity Evidence",
};
