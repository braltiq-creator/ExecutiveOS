/**
 * Simpro / Field Services domain model.
 * Vendor concepts stay here — Intelligence never receives Simpro payloads.
 */

export const SIMPRO_ENTITY_KINDS = [
  "Customer",
  "Site",
  "Job",
  "Project",
  "Quote",
  "Invoice",
  "Technician",
  "Contractor",
  "Asset",
  "ServiceAgreement",
  "PurchaseOrder",
  "StockItem",
  "Timesheet",
  "Variation",
  "RecurringService",
  "Defect",
  "MaintenanceSchedule",
] as const;

export type SimproEntityKind = (typeof SIMPRO_ENTITY_KINDS)[number];

/** Vendor-shaped object — only the adapter may consume this. */
export type SimproObject = {
  id: string;
  kind: SimproEntityKind;
  /** Vendor status / stage string */
  status?: string;
  name?: string;
  customerId?: string;
  siteId?: string;
  technicianId?: string;
  projectId?: string;
  amount?: number;
  marginPercent?: number;
  dueAt?: string;
  scheduledAt?: string;
  completedAt?: string;
  slaBreached?: boolean;
  firstTimeFix?: boolean;
  overtimeHours?: number;
  travelMinutes?: number;
  tags?: string[];
  raw?: Record<string, unknown>;
};

export type SimproEventName =
  | "quote_accepted"
  | "quote_lost"
  | "job_delayed"
  | "job_completed"
  | "technician_unavailable"
  | "purchase_order_delayed"
  | "invoice_overdue"
  | "customer_complaint"
  | "contract_renewed"
  | "contract_cancelled"
  | "variation_approved"
  | "defect_raised"
  | "sla_breached"
  | "timesheet_overtime"
  | "stock_shortage"
  | "project_margin_eroded";

export type SimproDomainEvent = {
  id: string;
  at: string;
  name: SimproEventName;
  object: SimproObject;
  detail?: string;
};
