/**
 * Knowledge Graph enrichment — commercial entities without Salesforce types.
 */

import type { KnowledgeGraph } from "@/knowledge-graph";
import type { EntityType } from "@/knowledge-graph/types";
import type { BusinessEvent } from "@/connectors/types";
import type { CommercialContextBrief } from "@/providers/salesforce/executive-context/types";

export type CommercialEnrichmentResult = {
  entitiesUpserted: number;
  relationshipsUpserted: number;
};

export function enrichCommercialGraph(
  graph: KnowledgeGraph,
  brief: CommercialContextBrief,
  events: BusinessEvent[],
): CommercialEnrichmentResult {
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
        properties: { importance, domain: "commercial" },
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
        domain: "commercial",
      },
    });
    entitiesUpserted += 1;

    if (event.payload.account) {
      const accountId = `customer-${String(event.payload.account)
        .replace(/\s+/g, "-")
        .toLowerCase()}`;
      ensure(accountId, "Customer", String(event.payload.account), 70);
      graph.addRelationship({
        id: `rel-${event.entityId}-${accountId}`,
        type: "relates_to",
        fromId: event.entityId,
        toId: accountId,
        weight: 0.8,
      });
      relationshipsUpserted += 1;
    }
  }

  for (const account of brief.strategicAccounts) {
    ensure(account.id, "Customer", account.name, 85);
    for (const related of account.relatedEntityIds) {
      ensure(related, "Opportunity", related, 70);
      graph.addRelationship({
        id: `rel-${account.id}-${related}`,
        type: "affects",
        fromId: account.id,
        toId: related,
        weight: 0.75,
      });
      relationshipsUpserted += 1;
    }
  }

  for (const risk of brief.commercialRisks) {
    ensure(risk.id, "Risk", risk.title, 80);
  }

  for (const deal of brief.largeDealsAtRisk) {
    ensure(deal.id, "Opportunity", deal.title, 88);
    ensure(`risk-${deal.id}`, "Risk", deal.reason, 82);
    graph.addRelationship({
      id: `rel-risk-${deal.id}`,
      type: "affects",
      fromId: `risk-${deal.id}`,
      toId: deal.id,
      weight: 0.9,
    });
    relationshipsUpserted += 1;
  }

  for (const signal of brief.signals) {
    ensure(`crm-signal-${signal.id}`, "Signal", signal.label, signal.score);
  }

  ensure("revenue-stream-commercial", "Metric", "Revenue Streams", 75);
  ensure("sales-team-commercial", "Team", "Sales Teams", 60);
  ensure("forecast-commercial", "Metric", "Commercial Forecast", 80);

  return { entitiesUpserted, relationshipsUpserted };
}
