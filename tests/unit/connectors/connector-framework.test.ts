import { describe, expect, it } from "vitest";
import {
  createMockJiraConnector,
  createMockMicrosoft365Connector,
  createMockSalesforceConnector,
  createNorthlineConnectorSuite,
  runEnterpriseSyncPipeline,
} from "@/connectors";
import {
  EnterpriseDigitalTwin,
  bootstrapNorthlineDigitalTwin,
  createTwinEnterpriseDataProvider,
  updateKnowledgeGraphFromTwin,
} from "@/digital-twin";
import { KnowledgeGraph } from "@/knowledge-graph";
import { buildIntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence";

describe("Connector Framework", () => {
  it("exposes the EnterpriseConnector surface on mock connectors", () => {
    const connector = createMockSalesforceConnector();
    expect(connector.connect().ok).toBe(true);
    expect(typeof connector.validate).toBe("function");
    expect(typeof connector.sync).toBe("function");
    expect(typeof connector.normalise).toBe("function");
    expect(connector.health().status).toBe("connected");
  });

  it("normalises Salesforce records into BusinessEvents only", () => {
    const connector = createMockSalesforceConnector();
    const result = connector.sync();
    expect(result.events.length).toBeGreaterThan(0);
    for (const event of result.events) {
      expect(event.sourceSystem).toBe("salesforce");
      expect(event.id).toBeTruthy();
      expect(event.entityId).toBeTruthy();
      expect(event.entityType).toBeTruthy();
      expect(event.metadata.connectorId).toBe("connector-salesforce");
      expect(event.importance).toBeGreaterThan(0);
      expect(event.confidence).toBeGreaterThan(0);
    }
    expect(
      result.events.some((event) => event.entityId === "decision-residency"),
    ).toBe(true);
  });

  it("emits M365 meeting and capacity events", () => {
    const result = createMockMicrosoft365Connector().sync();
    expect(
      result.events.some((event) => event.entityId === "meeting-helix-security"),
    ).toBe(true);
    expect(
      result.events.some((event) => event.entityId === "signal-meeting-load"),
    ).toBe(true);
  });

  it("emits Jira action events with Northline ids", () => {
    const result = createMockJiraConnector().sync();
    expect(
      result.events.some((event) => event.entityId === "action-counsel-memo"),
    ).toBe(true);
    expect(
      result.events.some(
        (event) => event.entityType === "StrategicInitiative",
      ),
    ).toBe(true);
  });

  it("exposes sync observability", () => {
    const result = createMockMicrosoft365Connector().sync();
    const obs = result.observability;
    expect(obs.recordsProcessed).toBeGreaterThan(0);
    expect(obs.eventsCreated).toBe(result.events.length);
    expect(obs.latencyMs).toBeGreaterThanOrEqual(0);
    expect(obs.health.connectorId).toBe("connector-m365");
    expect(obs.lastSuccessfulSync).toBeTruthy();
    expect(Array.isArray(obs.errors)).toBe(true);
    expect(Array.isArray(obs.warnings)).toBe(true);
  });

  it("rejects invalid records during validation", () => {
    const connector = createMockJiraConnector();
    const validation = connector.validate({ summary: "no id" });
    expect(validation.ok).toBe(false);
    expect(validation.issues.some((issue) => issue.level === "error")).toBe(
      true,
    );
  });
});

describe("Enterprise Digital Twin", () => {
  it("applies events, queries state, and tracks history", () => {
    const twin = new EnterpriseDigitalTwin({ source: "test" });
    const apply = twin.apply([
      {
        id: "evt-1",
        timestamp: "2026-07-20T06:00:00+10:00",
        sourceSystem: "salesforce",
        entityType: "Decision",
        entityId: "decision-residency",
        eventType: "decision_required",
        importance: 96,
        confidence: 90,
        relationships: [
          {
            type: "affects",
            targetEntityId: "outcome-enterprise-arr",
            targetEntityType: "Outcome",
          },
        ],
        payload: { question: "Helix residency?" },
        metadata: { connectorId: "test" },
      },
    ]);
    expect(apply.eventsApplied).toBe(1);
    expect(twin.getEntity("decision-residency")?.label).toMatch(/Helix/i);
    expect(twin.query({ type: "Decision" })[0]?.id).toBe("decision-residency");
    expect(twin.history("decision-residency")).toHaveLength(1);
  });

  it("versions snapshots and supports replay", () => {
    const twin = new EnterpriseDigitalTwin();
    twin.apply([
      {
        id: "evt-a",
        timestamp: "2026-07-19T06:00:00+10:00",
        sourceSystem: "jira",
        entityType: "Action",
        entityId: "action-counsel-memo",
        eventType: "issue_updated",
        importance: 70,
        confidence: 80,
        relationships: [],
        payload: { summary: "Memo v1" },
        metadata: { connectorId: "test" },
      },
    ]);
    const snap = twin.snapshot("v1");
    twin.apply([
      {
        id: "evt-b",
        timestamp: "2026-07-20T06:00:00+10:00",
        sourceSystem: "jira",
        entityType: "Action",
        entityId: "action-workshop-slot",
        eventType: "issue_updated",
        importance: 60,
        confidence: 80,
        relationships: [],
        payload: { summary: "Workshop" },
        metadata: { connectorId: "test" },
      },
    ]);
    expect(twin.getState().entities.length).toBeGreaterThan(
      snap.state.entities.length,
    );
    const replayed = twin.replay(snap.id);
    expect(replayed.entities.some((e) => e.id === "action-counsel-memo")).toBe(
      true,
    );
    expect(replayed.entities.some((e) => e.id === "action-workshop-slot")).toBe(
      false,
    );
  });

  it("publishes change events and ignores duplicate event ids", () => {
    const twin = new EnterpriseDigitalTwin();
    const changes: string[] = [];
    twin.subscribe((change) => changes.push(change.kind));
    const event = {
      id: "evt-dup",
      timestamp: "2026-07-20T06:00:00+10:00",
      sourceSystem: "manual" as const,
      entityType: "Signal" as const,
      entityId: "signal-1",
      eventType: "signal_emitted",
      importance: 50,
      confidence: 50,
      relationships: [],
      payload: { label: "ping" },
      metadata: { connectorId: "test" },
    };
    twin.apply([event]);
    const second = twin.apply([event]);
    expect(second.ignoredDuplicates).toBe(1);
    expect(changes).toContain("entity_upserted");
  });

  it("projects into the Knowledge Graph", () => {
    const { twin } = bootstrapNorthlineDigitalTwin();
    const graph = new KnowledgeGraph({ asOf: "2026-07-20", source: "test" });
    const bridge = updateKnowledgeGraphFromTwin(twin, graph);
    expect(bridge.entitiesUpserted).toBeGreaterThan(0);
    expect(graph.getEntity("decision-residency")).toBeTruthy();
    expect(graph.getEntity("customer-helix")).toBeTruthy();
  });
});

describe("Sync pipeline → Intelligence", () => {
  it("runs Connector → Twin → Graph → Intelligence without vendor coupling", () => {
    const twin = new EnterpriseDigitalTwin({ source: "pipeline-test" });
    twin.apply([
      {
        id: "seed-arr",
        timestamp: "2026-07-20T06:00:00+10:00",
        sourceSystem: "manual",
        entityType: "Outcome",
        entityId: "outcome-enterprise-arr",
        eventType: "entity_upserted",
        importance: 95,
        confidence: 90,
        relationships: [],
        payload: { name: "Enterprise ARR" },
        metadata: { connectorId: "seed" },
      },
    ]);
    const graph = new KnowledgeGraph({ asOf: "2026-07-20", source: "test" });
    const result = runEnterpriseSyncPipeline(
      createNorthlineConnectorSuite(),
      twin,
      { graph, runIntelligence: true },
    );

    expect(result.totals.recordsProcessed).toBeGreaterThan(0);
    expect(result.totals.eventsCreated).toBeGreaterThan(0);
    expect(result.twinApply.eventsApplied).toBeGreaterThan(0);
    expect(result.graphBridge.entitiesUpserted).toBeGreaterThan(0);
    expect(result.intelligence).toBeTruthy();
    expect(result.intelligence!.decisions.some((d) => d.id === "decision-residency")).toBe(
      true,
    );
    expect(result.connectorObservability).toHaveLength(3);
  });

  it("builds an executive snapshot from Twin-backed signals", () => {
    const { twin, graph } = bootstrapNorthlineDigitalTwin();
    const provider = createTwinEnterpriseDataProvider(twin);
    const signals = provider.getSignals();
    expect(signals.outcomes.some((o) => o.id === "outcome-enterprise-arr")).toBe(
      true,
    );
    expect(signals.decisions[0]?.systems).not.toContain("Salesforce REST");
    const snapshot = buildIntelligentExecutiveSnapshot(provider, graph);
    expect(snapshot.pulse).toBeTruthy();
    expect(snapshot.narrative.executiveSummary.length).toBeGreaterThan(10);
  });
});
