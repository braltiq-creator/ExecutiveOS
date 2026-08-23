import { createNorthlineConnectorSuite } from "@/connectors/registry";
import { runEnterpriseSyncPipeline } from "@/connectors/pipeline";
import { EnterpriseDigitalTwin } from "@/digital-twin/twin";
import type { KnowledgeGraph } from "@/knowledge-graph";
import { KnowledgeGraph as KnowledgeGraphClass } from "@/knowledge-graph";

/**
 * Bootstrap a Twin from mock connectors for tests / local demos.
 */
export function bootstrapNorthlineDigitalTwin(options?: {
  asOf?: string;
  graph?: KnowledgeGraph;
  runIntelligence?: boolean;
}): {
  twin: EnterpriseDigitalTwin;
  graph: KnowledgeGraph;
  pipeline: ReturnType<typeof runEnterpriseSyncPipeline>;
} {
  const asOf = options?.asOf ?? "2026-07-20T06:15:00+10:00";
  const twin = new EnterpriseDigitalTwin({
    asOf,
    source: "northline-twin",
  });
  const graph =
    options?.graph ??
    new KnowledgeGraphClass({
      asOf,
      source: "twin-bootstrap",
    });

  // Ensure Focus Outcome anchors exist before connector relationships land
  twin.apply([
    {
      id: "evt-seed-outcome-arr",
      timestamp: asOf,
      sourceSystem: "manual",
      entityType: "Outcome",
      entityId: "outcome-enterprise-arr",
      eventType: "entity_upserted",
      importance: 95,
      confidence: 90,
      relationships: [],
      payload: { name: "Enterprise ARR" },
      metadata: { connectorId: "seed", labels: ["seed"] },
    },
    {
      id: "evt-seed-outcome-board",
      timestamp: asOf,
      sourceSystem: "manual",
      entityType: "Outcome",
      entityId: "outcome-board",
      eventType: "entity_upserted",
      importance: 88,
      confidence: 88,
      relationships: [],
      payload: { name: "Board Readiness" },
      metadata: { connectorId: "seed", labels: ["seed"] },
    },
    {
      id: "evt-seed-outcome-efficiency",
      timestamp: asOf,
      sourceSystem: "manual",
      entityType: "Outcome",
      entityId: "outcome-efficiency",
      eventType: "entity_upserted",
      importance: 80,
      confidence: 85,
      relationships: [],
      payload: { name: "Executive Efficiency" },
      metadata: { connectorId: "seed", labels: ["seed"] },
    },
    {
      id: "evt-seed-outcome-retention",
      timestamp: asOf,
      sourceSystem: "manual",
      entityType: "Outcome",
      entityId: "outcome-retention",
      eventType: "entity_upserted",
      importance: 70,
      confidence: 80,
      relationships: [],
      payload: { name: "Net Retention" },
      metadata: { connectorId: "seed", labels: ["seed"] },
    },
    {
      id: "evt-seed-customer-helix",
      timestamp: asOf,
      sourceSystem: "manual",
      entityType: "Customer",
      entityId: "customer-helix",
      eventType: "entity_upserted",
      importance: 90,
      confidence: 92,
      relationships: [
        {
          type: "affects",
          targetEntityId: "outcome-enterprise-arr",
          targetEntityType: "Outcome",
        },
      ],
      payload: { name: "Helix Industries" },
      metadata: { connectorId: "seed", labels: ["seed", "helix"] },
    },
  ]);

  const pipeline = runEnterpriseSyncPipeline(
    createNorthlineConnectorSuite(asOf),
    twin,
    {
      graph,
      runIntelligence: options?.runIntelligence ?? false,
      snapshotLabel: "northline-bootstrap",
    },
  );

  return { twin, graph, pipeline };
}
