import { describe, expect, it } from "vitest";
import {
  AUTH_STRATEGY_IDS,
  authenticateWithStrategy,
  listAuthStrategies,
  manageConnector,
  platformToEnterprise,
  createEnterpriseConnectivityCatalog,
  mapVendorToBusinessEvent,
  SYNC_MODES,
  planSync,
  buildHealthReport,
  aggregateConnectivityMetrics,
  createWebhookState,
  processIncomingWebhook,
  replayWebhooks,
  classifyFailure,
  shouldRetry,
  recordFailure,
  createRetryState,
  simulateConnectorSync,
  createSdkSapConnector,
  createSdkMaximoConnector,
  createAllSdkExampleConnectors,
  defineConnector,
  assertNoVendorLeakage,
  CONNECTOR_LIFECYCLE_STAGES,
  runEnterpriseSyncPipeline,
} from "@/connectivity";
import { createMockSapConnector, createMockMaximoConnector } from "@/platform";
import { EnterpriseDigitalTwin } from "@/digital-twin";

describe("Enterprise Connectivity Platform", () => {
  it("supports all authentication strategies and reuses them across connectors", () => {
    expect(listAuthStrategies()).toHaveLength(AUTH_STRATEGY_IDS.length);

    const sapAuth = authenticateWithStrategy({
      connectorId: "connector-sap",
      credentials: {
        strategy: "client_credentials",
        clientId: "sap",
        clientSecretRef: "secret:sap",
        tokenUrl: "https://example.invalid/token",
      },
      asOf: "2026-07-26T00:00:00.000Z",
    });
    const maximoAuth = authenticateWithStrategy({
      connectorId: "connector-maximo",
      credentials: {
        strategy: "client_credentials",
        clientId: "maximo",
        clientSecretRef: "secret:maximo",
        tokenUrl: "https://example.invalid/token",
      },
      asOf: "2026-07-26T00:00:00.000Z",
    });

    expect(sapAuth.ok).toBe(true);
    expect(maximoAuth.ok).toBe(true);
    expect(sapAuth.session?.strategy).toBe("client_credentials");
    expect(maximoAuth.session?.strategy).toBe("client_credentials");
  });

  it("can replace SAP with Maximo without affecting Core Twin consumers", () => {
    const twin = new EnterpriseDigitalTwin({ source: "connectivity-test" });
    const sap = platformToEnterprise(createMockSapConnector());
    const maximo = platformToEnterprise(createMockMaximoConnector());

    const sapResult = runEnterpriseSyncPipeline([sap], twin, {
      snapshotLabel: "sap-run",
    });
    expect(sapResult.twinApply.eventsApplied).toBeGreaterThan(0);

    const twin2 = new EnterpriseDigitalTwin({ source: "connectivity-test-2" });
    const maximoResult = runEnterpriseSyncPipeline([maximo], twin2, {
      snapshotLabel: "maximo-run",
    });
    expect(maximoResult.twinApply.eventsApplied).toBeGreaterThan(0);

    // Both produce BusinessEvents only — Twin API unchanged
    expect(twin.getState().entities.length).toBeGreaterThan(0);
    expect(twin2.getState().entities.length).toBeGreaterThan(0);
  });

  it("allows one organisation to connect two ERP systems simultaneously", () => {
    const catalog = createEnterpriseConnectivityCatalog();
    const sap = catalog.get("ext-connector-sap-mock") ?? catalog.managed.find((m) => m.system === "mock" && m.label.toLowerCase().includes("sap"));
    const maximo = catalog.managed.find((m) => m.label.toLowerCase().includes("maximo"));

    // Prefer catalog entries by known platform ids
    const sapManaged = manageConnector(createMockSapConnector());
    const maximoManaged = manageConnector(createMockMaximoConnector());

    sapManaged.connect();
    maximoManaged.connect();
    const sapSync = sapManaged.synchronise();
    const maximoSync = maximoManaged.synchronise();

    expect(sapSync.events.length).toBeGreaterThan(0);
    expect(maximoSync.events.length).toBeGreaterThan(0);
    expect(sapManaged.id).not.toBe(maximoManaged.id);

    const twin = new EnterpriseDigitalTwin({ source: "dual-erp" });
    const pipeline = runEnterpriseSyncPipeline(
      [sapManaged.asEnterpriseConnector(), maximoManaged.asEnterpriseConnector()],
      twin,
    );
    expect(pipeline.connectorObservability.length).toBe(2);
    void sap;
    void maximo;
  });

  it("supports building new connectors rapidly via defineConnector", () => {
    const connector = defineConnector({
      id: "connector-rapid",
      system: "mock",
      label: "Rapid Connector",
      preferredAuth: "api_key",
      mappings: [
        {
          id: "rapid-asset",
          vendorObjectType: "Asset",
          entityType: "System",
          eventType: "entity_upserted",
          fields: [
            { from: "name", to: "label", required: true },
            { from: "health", to: "importance", transform: "number", defaultValue: 70 },
          ],
        },
      ],
      fetchVendorObjects: () => [
        {
          system: "mock",
          objectType: "Asset",
          id: "asset-1",
          fields: { name: "Conveyor", health: 90 },
        },
      ],
    });

    connector.authenticate({
      strategy: "api_key",
      apiKeyRef: "secret:rapid",
    });
    connector.connect();
    const result = connector.synchronise();
    expect(result.events).toHaveLength(1);
    expect(result.events[0].entityType).toBe("System");
    expect(CONNECTOR_LIFECYCLE_STAGES.length).toBe(10);
    expect(connector.lifecycle().history.length).toBeGreaterThan(3);
  });

  it("maps vendor objects to BusinessEvents without leakage", () => {
    const mapped = mapVendorToBusinessEvent({
      vendor: {
        system: "sap",
        objectType: "Invoice",
        id: "inv-9",
        fields: { amountCents: 2500, status: "Paid", name: "Invoice 9" },
      },
      definition: {
        id: "inv",
        vendorObjectType: "Invoice",
        entityType: "Metric",
        eventType: "status_changed",
        fields: [
          { from: "name", to: "label", required: true },
          { from: "amountCents", to: "amount", transform: "cents_to_units", required: true },
          { from: "status", to: "status", transform: "lower", required: true },
        ],
      },
      sourceSystem: "mock",
      connectorId: "connector-sap",
      timestamp: "2026-07-26T00:00:00.000Z",
    });
    expect(mapped.ok).toBe(true);
    expect(mapped.event?.payload.amount).toBe(25);
    expect(assertNoVendorLeakage(mapped.event!.payload).ok).toBe(true);
  });

  it("supports all synchronisation modes", () => {
    expect(SYNC_MODES).toContain("realtime");
    expect(SYNC_MODES).toContain("webhook");
    expect(SYNC_MODES).toContain("replay");
    expect(SYNC_MODES).toContain("backfill");
    expect(planSync("incremental").usesCursor).toBe(true);
  });

  it("reports platform health and aggregate monitoring", () => {
    const connector = createSdkSapConnector();
    connector.connect();
    connector.authenticate({
      strategy: "oauth2",
      clientId: "sap",
      clientSecretRef: "secret:sap",
    });
    connector.synchronise();
    const report = connector.platformHealth();
    expect(report.businessEventsGenerated).toBeGreaterThan(0);
    expect(report.authenticationStatus).toBe("active");

    const metrics = aggregateConnectivityMetrics([report]);
    expect(metrics.connectorCount).toBe(1);
    expect(metrics.totalEvents).toBeGreaterThan(0);

    // buildHealthReport still works on core health
    expect(buildHealthReport({ core: connector.health() }).connectorId).toBeTruthy();
  });

  it("isolates connector failures via retry and DLQ", () => {
    let state = createRetryState();
    state = recordFailure(state, {
      connectorId: "a",
      error: "Network timeout — unavailable",
      attempt: 1,
    });
    expect(classifyFailure("Network timeout — unavailable")).toBe("transient");
    expect(shouldRetry("transient", 1)).toBe(true);

    state = recordFailure(state, {
      connectorId: "b",
      error: "Invalid credentials — permanent",
      attempt: 1,
    });
    expect(state.deadLetters.length).toBeGreaterThan(0);

    const sap = createSdkSapConnector();
    const maximo = createSdkMaximoConnector();
    sap.recover("boom");
    // Maximo unaffected
    maximo.connect();
    expect(maximo.synchronise().events.length).toBeGreaterThan(0);
    expect(sap.retryState().attempts.length).toBeGreaterThan(0);
  });

  it("supports webhook verification, idempotency, and replay", () => {
    let state = createWebhookState();
    const envelope = {
      id: "wh-1",
      direction: "incoming" as const,
      connectorId: "connector-sap",
      topic: "invoice.paid",
      payload: { invoiceId: "inv-1" },
      signature: "sig:webhook-secret:invoiceId",
      receivedAt: "2026-07-26T00:00:00.000Z",
      sequence: 1,
    };
    const first = processIncomingWebhook(state, envelope, {
      secretRef: "webhook-secret",
      requireSignature: true,
    });
    expect(first.result.accepted).toBe(true);
    state = first.state;

    const dup = processIncomingWebhook(state, envelope, {
      secretRef: "webhook-secret",
      requireSignature: true,
    });
    expect(dup.result.duplicate).toBe(true);

    expect(replayWebhooks(state)).toHaveLength(1);
  });

  it("tests connectors without production systems", () => {
    const connectors = createAllSdkExampleConnectors();
    expect(connectors.length).toBeGreaterThanOrEqual(6);

    const ok = simulateConnectorSync({
      connector: connectors[0],
      failure: "none",
    });
    expect(ok.ok).toBe(true);

    const authFail = simulateConnectorSync({
      connector: connectors[0],
      failure: "auth_expiry",
    });
    expect(authFail.ok).toBe(false);
    expect(authFail.retry.attempts[0]?.failureKind).toBe("transient");

    const rate = simulateConnectorSync({
      connector: createSdkSapConnector(),
      failure: "rate_limit",
    });
    expect(rate.failure).toBe("rate_limit");
  });
});
