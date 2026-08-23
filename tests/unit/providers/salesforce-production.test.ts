import { describe, expect, it, beforeEach } from "vitest";
import {
  createSalesforceApiClient,
  createMockSalesforceHttpTransport,
  createSalesforceRateLimitTransport,
  createSalesforceTokenVault,
  validateSalesforceCredentials,
  refreshSalesforceOAuth,
  syncSalesforceExecutiveContext,
  applySalesforceExecutiveContext,
  createSalesforceLiveSyncEngine,
  createSalesforceWebhookStore,
  createSalesforceCdcStore,
  createSalesforceConnectionRegistry,
  getSalesforceConnectionRegistry,
  resetSalesforceConnectionRegistry,
  createDefaultSalesforceConfiguration,
  assertSalesforceTenantIsolation,
  assertNoPlaintextSalesforceCredentials,
  createSalesforceSecurityContext,
  simulateLargeCrmPortfolio,
  COMMERCIAL_SIGNAL_IDS,
  SALESFORCE_OAUTH_SCOPES,
  toCommercialContextView,
} from "@/providers/salesforce";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { KnowledgeGraph } from "@/knowledge-graph";
import { EnterpriseDigitalTwin } from "@/digital-twin";
import { conveneExecutiveCouncil, createAgentContext } from "@/agents";

describe("Salesforce production Executive Context Provider", () => {
  beforeEach(() => {
    resetSalesforceConnectionRegistry();
  });

  it("API client queries, retries on 429, and emits telemetry", async () => {
    const transport = createSalesforceRateLimitTransport(
      createMockSalesforceHttpTransport(),
      1,
    );
    const client = createSalesforceApiClient({
      orgId: "org1",
      getCredentials: () => ({
        strategy: "oauth2",
        clientId: "c",
        clientSecretRef: "vault:s",
        accessToken: "t",
        refreshToken: "r",
        instanceUrl: "https://example.my.salesforce.com",
        expiresAt: "2026-07-26T12:00:00.000Z",
        scopes: [...SALESFORCE_OAUTH_SCOPES],
      }),
      transport,
      asOf: "2026-07-26T08:00:00.000Z",
    });
    const opps = await client.query("SELECT Id FROM Opportunity");
    expect(opps.length).toBeGreaterThan(0);
    expect(client.telemetry().some((e) => e.throttled)).toBe(true);
  });

  it("encrypts credentials and rejects plaintext persistence", () => {
    const vault = createSalesforceTokenVault("vault:test");
    const encrypted = vault.encrypt(
      {
        strategy: "oauth2",
        clientId: "c",
        clientSecretRef: "vault:s",
        accessToken: "super-secret-token",
        refreshToken: "super-secret-refresh",
        instanceUrl: "https://example.my.salesforce.com",
        expiresAt: "2026-07-26T12:00:00.000Z",
        scopes: [...SALESFORCE_OAUTH_SCOPES],
      },
      "org-1",
    );
    expect(encrypted.payloadEncrypted).not.toContain("super-secret-token");
    expect(assertNoPlaintextSalesforceCredentials(encrypted).ok).toBe(true);
    const decrypted = vault.decrypt(encrypted);
    expect(decrypted.strategy).toBe("oauth2");
  });

  it("refreshes expired OAuth tokens", async () => {
    const expired = {
      strategy: "oauth2" as const,
      clientId: "c",
      clientSecretRef: "vault:s",
      accessToken: "old",
      refreshToken: "r",
      instanceUrl: "https://example.my.salesforce.com",
      expiresAt: "2026-07-26T07:00:00.000Z",
      scopes: [...SALESFORCE_OAUTH_SCOPES],
    };
    expect(
      validateSalesforceCredentials(expired, "2026-07-26T08:00:00.000Z").ok,
    ).toBe(false);
    const refreshed = await refreshSalesforceOAuth({
      credentials: expired,
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(refreshed.accessToken).toContain("refreshed");
    expect(
      validateSalesforceCredentials(refreshed, "2026-07-26T08:00:00.000Z").ok,
    ).toBe(true);
  });

  it("maps live sync into vendor-independent executive context", async () => {
    const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
    const graph = new KnowledgeGraph({
      asOf: snapshot.asOf,
      source: "salesforce-test",
    });
    const twin = new EnterpriseDigitalTwin({ source: "salesforce-test" });
    const result = await syncSalesforceExecutiveContext({
      snapshot,
      graph,
      twin,
      options: {
        executiveosTenantId: "tenant-northline",
        orgId: "northline-sf",
        asOf: snapshot.asOf,
      },
    });

    expect(result.brief.providerId).toBe("salesforce");
    expect(result.brief.signals.map((s) => s.id).sort()).toEqual(
      [...COMMERCIAL_SIGNAL_IDS].sort(),
    );
    expect(result.brief.commercialHealth.label).not.toMatch(/salesforce/i);
    expect(result.brief.framing).not.toMatch(/salesforce|soql|sobject/i);
    for (const event of result.events) {
      expect(event.payload.executiveMeaning).toBeTruthy();
      expect(JSON.stringify(event.payload)).not.toMatch(
        /StageName|IsWon|SOQL|SObject/i,
      );
    }
    expect(result.relationshipEnrichment?.entitiesUpserted).toBeGreaterThan(0);

    const view = toCommercialContextView(result.brief);
    expect(view.pipelineHealth.openDeals).toBeGreaterThan(0);
    expect(JSON.stringify(view)).not.toMatch(/Salesforce|salesforce|SOQL/i);
  });

  it("supports Platform Events, CDC replay, and large CRM simulation", () => {
    const hooks = createSalesforceWebhookStore();
    const sub = hooks.subscribe({
      channel: "/event/CommercialChange__e",
      notificationUrl: "https://app.test/hooks/salesforce",
      secret: "s1",
      expirationDateTime: "2026-07-27T08:00:00.000Z",
    });
    const ok = hooks.receive({
      subscriptionId: sub.id,
      secret: "s1",
      channel: "/event/CommercialChange__e",
      changeType: "created",
      payloadRef: "opp-1",
      asOf: "2026-07-26T08:00:00.000Z",
      replayId: "replay-1",
    });
    expect(ok.accepted).toBe(true);
    expect(hooks.replay(sub.id)).toHaveLength(1);

    const cdc = createSalesforceCdcStore();
    cdc.ensure("OpportunityChangeEvent");
    cdc.apply({
      channel: "OpportunityChangeEvent",
      asOf: "2026-07-26T08:00:00.000Z",
      changes: [
        {
          entity: "Opportunity",
          changeType: "UPDATE",
          recordId: "006OPP003",
          commitTimestamp: "2026-07-26T08:00:00.000Z",
          replayId: "cdc-1",
        },
      ],
    });
    expect(cdc.replay("OpportunityChangeEvent")).toHaveLength(1);
    cdc.gap("OpportunityChangeEvent", "network");
    const recovered = cdc.recover(
      "OpportunityChangeEvent",
      "cdc-1",
      "2026-07-26T08:05:00.000Z",
    );
    expect(recovered.status).toBe("active");

    const large = simulateLargeCrmPortfolio({
      accounts: 40,
      oppsPerAccount: 5,
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(large.length).toBe(40 + 40 * 5);
  });

  it("enforces tenant isolation and connection registry sync", async () => {
    const security = createSalesforceSecurityContext({
      tenantId: "tenant-a",
      orgId: "org-a",
    });
    expect(assertSalesforceTenantIsolation(security, "tenant-b").ok).toBe(
      false,
    );

    const registry = createSalesforceConnectionRegistry();
    registry.connect({
      executiveosTenantId: "tenant-northline",
      orgId: "northline-sf",
      credentials: {
        strategy: "oauth2",
        clientId: "c",
        clientSecretRef: "vault:s",
        accessToken: "t",
        refreshToken: "r",
        instanceUrl: "https://northline.my.salesforce.com",
        expiresAt: "2026-07-26T12:00:00.000Z",
        scopes: [...SALESFORCE_OAUTH_SCOPES],
      },
      userId: "admin",
      scopes: [...SALESFORCE_OAUTH_SCOPES],
      asOf: "2026-07-26T08:00:00.000Z",
    });
    const sync = await registry.sync({
      executiveosTenantId: "tenant-northline",
      mode: "full",
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(sync?.ok).toBe(true);
    expect(registry.getLiveBrief("tenant-northline")?.providerId).toBe(
      "salesforce",
    );
    expect(registry.adminStatus("tenant-northline")?.cdcEnabled).toBe(true);

    const engine = createSalesforceLiveSyncEngine();
    const run = await engine.run({
      mode: "incremental",
      config: createDefaultSalesforceConfiguration("tenant-northline"),
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(run.ok).toBe(true);
  });

  it("handles authentication expiry via refresh failure path", async () => {
    await expect(
      refreshSalesforceOAuth({
        credentials: {
          strategy: "oauth2",
          clientId: "c",
          clientSecretRef: "vault:s",
          accessToken: "t",
          refreshToken: "revoked",
          instanceUrl: "https://example.my.salesforce.com",
          expiresAt: "2026-07-26T07:00:00.000Z",
          scopes: [...SALESFORCE_OAUTH_SCOPES],
        },
      }),
    ).rejects.toThrow(/invalid_grant|expired|revoked/i);
  });

  it("wires commercial context into Today and Executive Council", () => {
    const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
    expect(snapshot.commercialContextBrief?.providerId).toBe("salesforce");
    expect(snapshot.commercialContextBrief?.signals).toHaveLength(
      COMMERCIAL_SIGNAL_IDS.length,
    );

    const applied = applySalesforceExecutiveContext({
      snapshot,
      options: { preferMock: true },
    });
    expect(applied.commercialContextBrief.pipelineHealth.openDeals).toBeGreaterThan(
      0,
    );

    const withContext = applied.snapshot;
    const brief = conveneExecutiveCouncil(withContext);
    const cro = brief.perspectives.find((p) => p.agentId === "cro");
    const cfo = brief.perspectives.find((p) => p.agentId === "cfo");
    const cso = brief.perspectives.find((p) => p.agentId === "cso");
    expect(cro?.review.summary).toMatch(/growth|pipeline|commercial|deal/i);
    expect(cfo?.review.summary).toMatch(/forecast|confidence|commercial/i);
    expect(cso?.review.summary.length).toBeGreaterThan(10);

    const ctx = createAgentContext(withContext);
    expect(ctx.commercialContext?.providerId).toBe("salesforce");

    const ui = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    expect(ui.commercialContext?.pipelineHealth.openDeals).toBeGreaterThan(0);
    expect(JSON.stringify(ui.commercialContext)).not.toMatch(
      /Salesforce|SOQL|SObject/i,
    );
  });

  it("default registry reset isolates tenants between tests", () => {
    const a = getSalesforceConnectionRegistry();
    a.getOrCreate("tenant-a");
    resetSalesforceConnectionRegistry();
    const b = getSalesforceConnectionRegistry();
    expect(b.get("tenant-a")).toBeUndefined();
  });
});
