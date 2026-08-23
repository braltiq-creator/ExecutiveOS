/**
 * Knowledge Graph enrichment — operational entities without Simpro types.
 */

import type { KnowledgeGraph } from "@/knowledge-graph";
import type { EntityType } from "@/knowledge-graph/types";
import type { BusinessEvent } from "@/connectors/types";
import type { OperationalContextBrief } from "@/providers/simpro/executive-context/types";

export type OperationalEnrichmentResult = {
  entitiesUpserted: number;
  relationshipsUpserted: number;
};

export function enrichOperationalGraph(
  graph: KnowledgeGraph,
  brief: OperationalContextBrief,
  events: BusinessEvent[],
): OperationalEnrichmentResult {
  let entitiesUpserted = 0;
  let relationshipsUpserted = 0;

  const ensure = (
    id: string,
    type: EntityType,
    label: string,
    importance = 50,
  ) => {
    if (!graph.getEntity(id)) {
      graph.addEntity({
        id,
        type,
        label,
        properties: { importance, domain: "operations" },
      });
      entitiesUpserted += 1;
    }
  };

  for (const event of events) {
    const type = event.entityType as EntityType;
    const label = String(
      event.payload.title ??
        event.payload.name ??
        event.payload.executiveMeaning ??
        event.entityId,
    );
    ensure(event.entityId, type, label, event.importance);
    graph.addEntity({
      id: event.entityId,
      type,
      label,
      properties: {
        importance: event.importance,
        meaning: String(event.payload.executiveMeaning ?? ""),
        domain: "operations",
      },
    });
    entitiesUpserted += 1;

    if (event.payload.customer) {
      const customerId = `customer-${String(event.payload.customer)
        .replace(/\s+/g, "-")
        .toLowerCase()}`;
      ensure(customerId, "Customer", String(event.payload.customer), 60);
      graph.addRelationship({
        id: `rel-${event.entityId}-${customerId}`,
        type: "relates_to",
        fromId: event.entityId,
        toId: customerId,
        weight: 0.7,
      });
      relationshipsUpserted += 1;
    }

    if (event.payload.supplier) {
      const supplierId = `supplier-${String(event.payload.supplier)
        .replace(/\s+/g, "-")
        .toLowerCase()}`;
      ensure(supplierId, "Supplier", String(event.payload.supplier), 55);
      graph.addRelationship({
        id: `rel-${event.entityId}-${supplierId}`,
        type: "depends_on",
        fromId: event.entityId,
        toId: supplierId,
        weight: 0.75,
      });
      relationshipsUpserted += 1;
    }
  }

  for (const risk of brief.customerRisks) {
    ensure(risk.id, "Risk", risk.risk, 80);
    for (const related of risk.relatedEntityIds) {
      ensure(related, "Action", related, 60);
      graph.addRelationship({
        id: `rel-${risk.id}-${related}`,
        type: "affects",
        fromId: risk.id,
        toId: related,
        weight: 0.8,
      });
      relationshipsUpserted += 1;
    }
  }

  for (const signal of brief.signals) {
    ensure(`ops-signal-${signal.id}`, "Signal", signal.label, signal.score);
  }

  return { entitiesUpserted, relationshipsUpserted };
}
