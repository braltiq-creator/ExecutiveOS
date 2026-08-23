import { describe, expect, it, beforeEach } from "vitest";
import {
  createSimproApiClient,
  createMockSimproHttpTransport,
  createRateLimitTransport,
  createSimproTokenVault,
  validateSimproCredentials,
  refreshSimproOAuth,
  syncSimproExecutiveContext,
  applySimproExecutiveContext,
  createSimproLiveSyncEngine,
  createSimproWebhookStore,
  createSimproConnectionRegistry,
  getSimproConnectionRegistry,
  resetSimproConnectionRegistry,
  createDefaultSimproConfiguration,
  assertSimproTenantIsolation,
  assertNoPlaintextSimproCredentials,
  createSimproSecurityContext,
  simulateLargeCustomerPortfolio,
  OPERATIONAL_SIGNAL_IDS,
  SIMPRO_OAUTH_SCOPES,
  toOperationalContextView,
  syncTimesheets,
} from "@/providers/simpro";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { KnowledgeGraph } from "@/knowledge-graph";
import { EnterpriseDigitalTwin } from "@/digital-twin";
import { conveneExecutiveCouncil, createAgentContext } from "@/agents";

describe("Simpro production Executive Context Provider", () => {
  beforeEach(() => {
    resetSimproConnectionRegistry();
  });

  it("API client pages, retries on 429, and emits telemetry", async () => {
    const transport = createRateLimitTransport(
      createMockSimproHttpTransport(),
      1,
    );
    const client = createSimproApiClient({
      companyId: "c1",
      getCredentials: () => ({
        strategy: "api_key",
        apiKeyRef: "vault:k",
        apiKey: "k",
      }),
      transport,
      asOf: "2026-07-26T08:00:00.000Z",
    });
    const jobs = await client.list("jobs");
    expect(jobs.length).toBeGreaterThan(0);
    expect(client.telemetry().some((e) => e.throttled)).toBe(true);
  });

  it("encrypts credentials and rejects plaintext persistence", () => {
    const vault = createSimproTokenVault("vault:test");
    const encrypted = vault.encrypt(
      {
        strategy: "api_key",
        apiKeyRef: "vault:k",
        apiKey: "super-secret-key",
      },
      "company-1",
    );
    expect(encrypted.payloadEncrypted).not.toContain("super-secret-key");
    expect(assertNoPlaintextSimproCredentials(encrypted).ok).toBe(true);
    const decrypted = vault.decrypt(encrypted);
    expect(decrypted.strategy).toBe("api_key");
  });

  it("maps live sync into vendor-independent executive context", async () => {
    const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
    const graph = new KnowledgeGraph({ asOf: snapshot.asOf, source: "simpro-test" });
    const twin = new EnterpriseDigitalTwin({ source: "simpro-test" });
    const result = await syncSimproExecutiveContext({
      snapshot,
      graph,
      twin,
      options: {
        executiveosTenantId: "tenant-northline",
        companyId: "northline-simpro",
        asOf: snapshot.asOf,
      },
    });

    expect(result.brief.providerId).toBe("simpro");
    expect(result.brief.signals.map((s) => s.id).sort()).toEqual(
      [...OPERATIONAL_SIGNAL_IDS].sort(),
    );
    expect(result.brief.operationalHealth.label).not.toMatch(/simpro/i);
    expect(result.brief.framing).not.toMatch(/simpro/i);
    for (const event of result.events) {
      expect(event.payload.executiveMeaning).toBeTruthy();
      expect(JSON.stringify(event.payload)).not.toMatch(/DateModified|Stage":/);
    }
    expect(result.relationshipEnrichment?.entitiesUpserted).toBeGreaterThan(0);

    const view = toOperationalContextView(result.brief);
    expect(view.serviceDelivery.openJobs).toBeGreaterThan(0);
    expect(JSON.stringify(view)).not.toMatch(/Simpro|simpro/i);
  });

  it("supports webhooks, replay, and large customer simulation", () => {
    const hooks = createSimproWebhookStore();
    const sub = hooks.subscribe({
      resource: "jobs",
      notificationUrl: "https://app.test/hooks/simpro",
      secret: "s1",
      expirationDateTime: "2026-07-27T08:00:00.000Z",
    });
    const ok = hooks.receive({
      subscriptionId: sub.id,
      secret: "s1",
      resource: "jobs",
      changeType: "updated",
      payloadRef: "job-501",
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(ok.accepted).toBe(true);
    expect(hooks.replay(sub.id)).toHaveLength(1);

    const large = simulateLargeCustomerPortfolio({
      customers: 20,
      jobsPerCustomer: 5,
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(large.length).toBeGreaterThan(100);
  });

  it("detects auth expiry and isolates tenants", async () => {
    expect(
      validateSimproCredentials(
        {
          strategy: "oauth2",
          clientId: "c",
          clientSecretRef: "vault:s",
          accessToken: "a",
          refreshToken: "r",
          expiresAt: "2026-07-26T07:00:00.000Z",
          scopes: [...SIMPRO_OAUTH_SCOPES],
        },
        "2026-07-26T08:00:00.000Z",
      ).ok,
    ).toBe(false);

    await expect(
      refreshSimproOAuth({
        credentials: {
          strategy: "oauth2",
          clientId: "c",
          clientSecretRef: "vault:s",
          accessToken: "a",
          refreshToken: "revoked",
          expiresAt: "2026-07-26T09:00:00.000Z",
          scopes: [...SIMPRO_OAUTH_SCOPES],
        },
      }),
    ).rejects.toThrow(/expired|revoked|invalid_grant/i);

    const isolation = assertSimproTenantIsolation(
      createSimproSecurityContext({
        tenantId: "tenant-a",
        companyId: "co-a",
      }),
      "tenant-b",
    );
    expect(isolation.ok).toBe(false);

    const registry = createSimproConnectionRegistry();
    registry.connect({
      executiveosTenantId: "tenant-a",
      companyId: "co-a",
      credentials: {
        strategy: "api_key",
        apiKeyRef: "vault:a",
        apiKey: "a",
      },
      userId: "a@test",
      scopes: [...SIMPRO_OAUTH_SCOPES],
      asOf: "2026-07-26T08:00:00.000Z",
    });
    registry.connect({
      executiveosTenantId: "tenant-b",
      companyId: "co-b",
      credentials: {
        strategy: "api_key",
        apiKeyRef: "vault:b",
        apiKey: "b",
      },
      userId: "b@test",
      scopes: [...SIMPRO_OAUTH_SCOPES],
      asOf: "2026-07-26T08:00:00.000Z",
    });
    await registry.sync({
      executiveosTenantId: "tenant-a",
      mode: "full",
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(registry.getLiveBrief("tenant-a")).toBeTruthy();
    expect(registry.getLiveBrief("tenant-b")).toBeNull();
  });

  it("live sync checkpoints and Today includes operational context", async () => {
    const engine = createSimproLiveSyncEngine();
    const config = {
      ...createDefaultSimproConfiguration("tenant-northline"),
      connected: true,
      companyId: "northline-simpro",
      consentedScopes: [...SIMPRO_OAUTH_SCOPES],
    };
    const run = await engine.run({
      mode: "incremental",
      config,
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(run.ok).toBe(true);
    expect(run.checkpoints.every((c) => c.status === "succeeded")).toBe(true);

    const globalRegistry = getSimproConnectionRegistry();
    globalRegistry.connect({
      executiveosTenantId: "tenant-northline",
      companyId: "northline-simpro",
      credentials: {
        strategy: "api_key",
        apiKeyRef: "vault:simpro",
        apiKey: "mock",
      },
      userId: "alex@northline.test",
      scopes: [...SIMPRO_OAUTH_SCOPES],
      asOf: "2026-07-26T08:00:00.000Z",
    });
    await globalRegistry.sync({
      executiveosTenantId: "tenant-northline",
      mode: "full",
      asOf: "2026-07-26T08:00:00.000Z",
    });

    const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
    const applied = applySimproExecutiveContext({
      snapshot,
      options: { executiveosTenantId: "tenant-northline" },
    });
    expect(applied.operationalContextBrief.signals.length).toBe(
      OPERATIONAL_SIGNAL_IDS.length,
    );

    const ui = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    expect(ui.operationalContext).toBeTruthy();
    expect(ui.operationalContext?.framing).not.toMatch(/simpro/i);
  });

  it("syncs timesheets into field productivity without vendor leakage", async () => {
    const client = createSimproApiClient({
      companyId: "c1",
      getCredentials: () => ({
        strategy: "api_key",
        apiKeyRef: "vault:k",
        apiKey: "k",
      }),
      asOf: "2026-07-26T08:00:00.000Z",
    });
    const sheets = await syncTimesheets(client, "2026-07-26T08:00:00.000Z");
    expect(sheets.overtimeHours).toBeGreaterThan(0);
    expect(
      sheets.events.every((e) =>
        String(e.payload.executiveMeaning).match(/Field Productivity|Updated/i),
      ),
    ).toBe(true);
  });

  it("supports four Design Partner tenants in isolation", async () => {
    const registry = createSimproConnectionRegistry();
    const partners = [
      "tenant-partner-a",
      "tenant-partner-b",
      "tenant-partner-c",
      "tenant-partner-d",
    ];
    for (const tenant of partners) {
      registry.connect({
        executiveosTenantId: tenant,
        companyId: `co-${tenant}`,
        credentials: {
          strategy: "api_key",
          apiKeyRef: `vault:${tenant}`,
          apiKey: `key-${tenant}`,
        },
        userId: `${tenant}@design.partner`,
        scopes: [...SIMPRO_OAUTH_SCOPES],
        asOf: "2026-07-26T08:00:00.000Z",
      });
      const sync = await registry.sync({
        executiveosTenantId: tenant,
        mode: "full",
        asOf: "2026-07-26T08:00:00.000Z",
      });
      expect(sync?.ok).toBe(true);
      expect(registry.getLiveBrief(tenant)?.providerId).toBe("simpro");
    }
    expect(registry.getLiveBrief("tenant-partner-a")).not.toBe(
      registry.getLiveBrief("tenant-partner-b"),
    );
    for (const tenant of partners) {
      expect(registry.adminStatus(tenant)?.tenantStatus).toBe("connected");
    }
  });

  it("handles large field-service simulation within performance budget", () => {
    const started = Date.now();
    const large = simulateLargeCustomerPortfolio({
      customers: 80,
      jobsPerCustomer: 8,
      asOf: "2026-07-26T08:00:00.000Z",
    });
    const elapsed = Date.now() - started;
    expect(large.length).toBeGreaterThan(600);
    expect(elapsed).toBeLessThan(2000);
    expect(JSON.stringify(large[0]?.payload)).not.toMatch(/Stage|DateModified/);
  });

  it("wires operational evidence into Executive Council", () => {
    const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
    expect(snapshot.operationalContextBrief?.providerId).toBe("simpro");
    const brief = conveneExecutiveCouncil(snapshot);
    const coo = brief.perspectives.find((p) => p.agentId === "coo");
    const cfo = brief.perspectives.find((p) => p.agentId === "cfo");
    const cro = brief.perspectives.find((p) => p.agentId === "cro");
    const ceo = brief.perspectives.find((p) => p.agentId === "ceo");
    expect(coo?.review.summary).toMatch(/operational|capacity|job|delivery/i);
    expect(cfo?.review.summary).toMatch(/cash|finance|forecast/i);
    expect(cro?.review.summary.length).toBeGreaterThan(10);
    expect(ceo?.review.summary.length).toBeGreaterThan(10);
    const ctx = createAgentContext(snapshot);
    expect(ctx.operationalContext?.jobsAtRisk.length).toBeGreaterThan(0);
  });

  it("simulates network failure recovery via failed checkpoint then success", async () => {
    let fail = true;
    const transport = {
      async fetch(input: {
        url: string;
        method: string;
        headers: Record<string, string>;
        body?: string;
      }) {
        if (fail) {
          return { status: 503, headers: {}, body: "unavailable" };
        }
        return createMockSimproHttpTransport().fetch(input);
      },
    };
    const client = createSimproApiClient({
      companyId: "c1",
      getCredentials: () => ({
        strategy: "api_key",
        apiKeyRef: "vault:k",
        apiKey: "k",
      }),
      transport,
      maxRetries: 1,
      asOf: "2026-07-26T08:00:00.000Z",
    });
    await expect(client.list("jobs")).rejects.toThrow(/503/);
    fail = false;
    const recovered = await client.list("jobs");
    expect(recovered.length).toBeGreaterThan(0);
  });
});
