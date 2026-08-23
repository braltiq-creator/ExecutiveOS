import type { BusinessEvent } from "@/connectors/types";
import type {
  SimproDomainEvent,
  SimproObject,
} from "@/industry/field-services/simpro/domain";
import {
  mapSimproEventToBusinessEvents,
  canonicalTypeForKind,
} from "@/industry/field-services/simpro/events";

/**
 * SimproDomainAdapter — vendor boundary.
 * Consumes Simpro objects/events; emits ExecutiveOS BusinessEvents only.
 */
export class SimproDomainAdapter {
  readonly id = "adapter-simpro";
  readonly label = "Simpro Domain Adapter";

  /**
   * Translate a Simpro domain event into canonical BusinessEvents.
   * Intelligence engines must never receive the SimproObject.
   */
  toBusinessEvents(event: SimproDomainEvent): BusinessEvent[] {
    return mapSimproEventToBusinessEvents(event);
  }

  toBusinessEventsMany(events: SimproDomainEvent[]): BusinessEvent[] {
    return events.flatMap((event) => this.toBusinessEvents(event));
  }

  /**
   * Upsert-style mapping for static Simpro entities (no event envelope).
   */
  entityToBusinessEvent(
    object: SimproObject,
    at: string,
  ): BusinessEvent {
    return {
      id: `evt-simpro-entity-${object.kind}-${object.id}`,
      timestamp: at,
      sourceSystem: "simpro",
      entityType: canonicalTypeForKind(object.kind),
      entityId: `${object.kind.toLowerCase()}-${object.id}`,
      eventType: "entity_upserted",
      importance: 50,
      confidence: 80,
      relationships: [],
      payload: {
        name: object.name ?? object.id,
        status: object.status,
        amount: object.amount,
        marginPercent: object.marginPercent,
        simproKind: object.kind,
      },
      metadata: {
        connectorId: this.id,
        rawRef: object.id,
        labels: ["field-services", "simpro", object.kind],
        vendorBoundary: "simpro-adapter",
      },
    };
  }
}

export function createSimproDomainAdapter(): SimproDomainAdapter {
  return new SimproDomainAdapter();
}

/** Mock Simpro feed for Reality Lab / local demos. */
export function createMockSimproDomainEvents(
  asOf = "2026-07-20T06:15:00+10:00",
): SimproDomainEvent[] {
  return [
    {
      id: "sp-1",
      at: asOf,
      name: "quote_accepted",
      object: {
        id: "Q-1042",
        kind: "Quote",
        name: "HVAC upgrade — Westport campus",
        amount: 240000,
        status: "accepted",
        customerId: "C-88",
      },
      detail: "Major quote accepted",
    },
    {
      id: "sp-2",
      at: asOf,
      name: "job_delayed",
      object: {
        id: "J-7781",
        kind: "Job",
        name: "Chiller repair",
        status: "delayed",
        technicianId: "T-12",
        customerId: "C-88",
        slaBreached: true,
      },
    },
    {
      id: "sp-3",
      at: asOf,
      name: "technician_unavailable",
      object: {
        id: "T-12",
        kind: "Technician",
        name: "A. Nguyen",
        status: "sick",
      },
      detail: "Lead technician unavailable",
    },
    {
      id: "sp-4",
      at: asOf,
      name: "invoice_overdue",
      object: {
        id: "INV-552",
        kind: "Invoice",
        name: "Project retention invoice",
        amount: 180000,
        status: "overdue",
        customerId: "C-21",
      },
    },
    {
      id: "sp-5",
      at: asOf,
      name: "project_margin_eroded",
      object: {
        id: "P-90",
        kind: "Project",
        name: "Mine site shutdown package",
        marginPercent: 11,
        status: "active",
      },
    },
    {
      id: "sp-6",
      at: asOf,
      name: "contract_renewed",
      object: {
        id: "SA-14",
        kind: "ServiceAgreement",
        name: "Campus PPM agreement",
        amount: 420000,
        status: "renewed",
        customerId: "C-88",
      },
    },
  ];
}
