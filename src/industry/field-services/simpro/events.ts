import type { BusinessEvent, CanonicalEntityType } from "@/connectors/types";
import type {
  SimproDomainEvent,
  SimproEntityKind,
  SimproEventName,
} from "@/industry/field-services/simpro/domain";

/**
 * Catalogue: Simpro event → ExecutiveOS BusinessEvent meaning.
 * Intelligence only ever sees the right-hand side.
 */
export type BusinessEventMapping = {
  simproEvent: SimproEventName;
  executiveMeaning: string;
  eventType: string;
  entityType: CanonicalEntityType;
  importance: number;
  healthImpacts: Array<
    | "revenue"
    | "operational"
    | "people"
    | "customer"
    | "cash"
    | "execution"
    | "growth"
  >;
};

export const SIMPRO_EVENT_MAPPINGS: BusinessEventMapping[] = [
  {
    simproEvent: "quote_accepted",
    executiveMeaning: "Revenue Opportunity Increased",
    eventType: "opportunity_moved",
    entityType: "Opportunity",
    importance: 82,
    healthImpacts: ["revenue", "growth"],
  },
  {
    simproEvent: "quote_lost",
    executiveMeaning: "Revenue Opportunity Decreased",
    eventType: "signal_emitted",
    entityType: "Signal",
    importance: 70,
    healthImpacts: ["revenue", "growth"],
  },
  {
    simproEvent: "job_delayed",
    executiveMeaning: "Delivery Risk Increased",
    eventType: "risk_raised",
    entityType: "Risk",
    importance: 88,
    healthImpacts: ["operational", "execution", "customer"],
  },
  {
    simproEvent: "job_completed",
    executiveMeaning: "Execution Progress Increased",
    eventType: "status_changed",
    entityType: "Action",
    importance: 55,
    healthImpacts: ["execution", "operational"],
  },
  {
    simproEvent: "technician_unavailable",
    executiveMeaning: "Capacity Reduced",
    eventType: "signal_emitted",
    entityType: "Signal",
    importance: 90,
    healthImpacts: ["people", "operational", "growth"],
  },
  {
    simproEvent: "purchase_order_delayed",
    executiveMeaning: "Supply Chain Risk Increased",
    eventType: "risk_raised",
    entityType: "Risk",
    importance: 78,
    healthImpacts: ["operational", "execution"],
  },
  {
    simproEvent: "invoice_overdue",
    executiveMeaning: "Cash Flow Risk Increased",
    eventType: "risk_raised",
    entityType: "Risk",
    importance: 86,
    healthImpacts: ["cash", "revenue"],
  },
  {
    simproEvent: "customer_complaint",
    executiveMeaning: "Customer Health Reduced",
    eventType: "signal_emitted",
    entityType: "Signal",
    importance: 84,
    healthImpacts: ["customer", "growth"],
  },
  {
    simproEvent: "contract_renewed",
    executiveMeaning: "Recurring Revenue Increased",
    eventType: "opportunity_moved",
    entityType: "Opportunity",
    importance: 80,
    healthImpacts: ["revenue", "growth", "customer"],
  },
  {
    simproEvent: "contract_cancelled",
    executiveMeaning: "Recurring Revenue Decreased",
    eventType: "risk_raised",
    entityType: "Risk",
    importance: 92,
    healthImpacts: ["revenue", "customer", "growth"],
  },
  {
    simproEvent: "variation_approved",
    executiveMeaning: "Variation Recovery Increased",
    eventType: "status_changed",
    entityType: "Metric",
    importance: 68,
    healthImpacts: ["revenue", "execution"],
  },
  {
    simproEvent: "defect_raised",
    executiveMeaning: "Quality Risk Increased",
    eventType: "risk_raised",
    entityType: "Risk",
    importance: 76,
    healthImpacts: ["customer", "operational", "execution"],
  },
  {
    simproEvent: "sla_breached",
    executiveMeaning: "Customer Commitment Risk Increased",
    eventType: "risk_raised",
    entityType: "Risk",
    importance: 90,
    healthImpacts: ["customer", "operational"],
  },
  {
    simproEvent: "timesheet_overtime",
    executiveMeaning: "People Strain Increased",
    eventType: "signal_emitted",
    entityType: "Signal",
    importance: 72,
    healthImpacts: ["people", "operational"],
  },
  {
    simproEvent: "stock_shortage",
    executiveMeaning: "Supply Constraint Increased",
    eventType: "risk_raised",
    entityType: "Risk",
    importance: 74,
    healthImpacts: ["operational", "execution"],
  },
  {
    simproEvent: "project_margin_eroded",
    executiveMeaning: "Gross Margin Risk Increased",
    eventType: "risk_raised",
    entityType: "Risk",
    importance: 94,
    healthImpacts: ["revenue", "execution", "growth"],
  },
];

export function mappingFor(
  name: SimproEventName,
): BusinessEventMapping | undefined {
  return SIMPRO_EVENT_MAPPINGS.find((item) => item.simproEvent === name);
}

export function mapSimproEventToBusinessEvents(
  event: SimproDomainEvent,
): BusinessEvent[] {
  const mapping = mappingFor(event.name);
  if (!mapping) return [];

  const entityId = canonicalEntityId(event);
  return [
    {
      id: `evt-simpro-${event.id}`,
      timestamp: event.at,
      sourceSystem: "simpro",
      entityType: mapping.entityType,
      entityId,
      eventType: mapping.eventType,
      importance: mapping.importance,
      confidence: 84,
      relationships: relationshipsFor(event),
      payload: {
        executiveMeaning: mapping.executiveMeaning,
        simproEvent: event.name,
        simproKind: event.object.kind,
        name: event.object.name ?? mapping.executiveMeaning,
        status: event.object.status,
        amount: event.object.amount,
        marginPercent: event.object.marginPercent,
        detail: event.detail,
        healthImpacts: mapping.healthImpacts,
      },
      metadata: {
        connectorId: "connector-simpro",
        rawRef: event.object.id,
        labels: ["field-services", "simpro", event.object.kind, event.name],
        vendorBoundary: "simpro-adapter",
      },
    },
  ];
}

function canonicalEntityId(event: SimproDomainEvent): string {
  const kind = event.object.kind.toLowerCase();
  return `${kind}-${event.object.id}`;
}

function relationshipsFor(
  event: SimproDomainEvent,
): BusinessEvent["relationships"] {
  const rels: BusinessEvent["relationships"] = [];
  if (event.object.customerId) {
    rels.push({
      type: "relates_to",
      targetEntityId: `customer-${event.object.customerId}`,
      targetEntityType: "Customer",
    });
  }
  if (event.object.projectId) {
    rels.push({
      type: "relates_to",
      targetEntityId: `project-${event.object.projectId}`,
      targetEntityType: "Project",
    });
  }
  if (event.object.technicianId) {
    rels.push({
      type: "relates_to",
      targetEntityId: `person-${event.object.technicianId}`,
      targetEntityType: "Person",
    });
  }
  // Focus Outcomes for field-service executive portfolio
  rels.push({
    type: "affects",
    targetEntityId: "outcome-fs-revenue",
    targetEntityType: "Outcome",
  });
  return rels;
}

/** Map Simpro entity kinds onto canonical graph/twin types. */
export function canonicalTypeForKind(
  kind: SimproEntityKind,
): CanonicalEntityType {
  switch (kind) {
    case "Customer":
      return "Customer";
    case "Technician":
    case "Contractor":
      return "Person";
    case "Project":
    case "Job":
      return "Project";
    case "Quote":
      return "Opportunity";
    case "Invoice":
    case "PurchaseOrder":
    case "Timesheet":
    case "Variation":
      return "Metric";
    case "ServiceAgreement":
    case "RecurringService":
      return "StrategicInitiative";
    case "Defect":
      return "Risk";
    case "Asset":
    case "StockItem":
    case "Site":
    case "MaintenanceSchedule":
      return "System";
    default:
      return "Signal";
  }
}
