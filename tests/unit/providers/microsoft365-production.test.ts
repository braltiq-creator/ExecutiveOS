import { describe, expect, it, beforeEach } from "vitest";
import {
  createPkcePair,
  buildAuthorizationRequest,
  exchangeAuthorizationCode,
  refreshAccessToken,
  validateAccessToken,
  createMockTokenTransport,
  createTokenVault,
  createProductionGraphClient,
  createMockGraphHttpTransport,
  createLiveSyncEngine,
  createDeltaState,
  applyDeltaPage,
  simulateLargeTenantDelta,
  createWebhookStore,
  createM365ConnectionRegistry,
  getM365ConnectionRegistry,
  resetM365ConnectionRegistry,
  createDefaultConnectorConfiguration,
  assertNoPlaintextCredentials,
  assertTenantIsolation,
  createSecurityContext,
  PRODUCTION_GRAPH_SCOPES,
  applyMicrosoft365ExecutiveContext,
  type EntraAppRegistration,
  type TokenSet,
} from "@/providers/microsoft365";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

const app: EntraAppRegistration = {
  clientId: "eos-m365-client",
  clientSecretRef: "vault:m365-secret",
  redirectUri: "https://app.executiveos.test/api/integrations/oauth/callback",
  authority: "https://login.microsoftonline.com/organizations",
};

describe("Microsoft 365 production integration", () => {
  beforeEach(() => {
    resetM365ConnectionRegistry();
  });

  it("runs OAuth authorization code flow with PKCE", async () => {
    const pkce = createPkcePair();
    expect(pkce.codeChallengeMethod).toBe("S256");
    expect(pkce.codeVerifier).not.toEqual(pkce.codeChallenge);

    const auth = buildAuthorizationRequest({
      app,
      tenantHint: "contoso.onmicrosoft.com",
    });
    expect(auth.url).toContain("code_challenge");
    expect(auth.url).toContain("code_challenge_method=S256");
    expect(auth.scopes).toEqual(expect.arrayContaining([...PRODUCTION_GRAPH_SCOPES]));

    const tokens = await exchangeAuthorizationCode({
      app,
      code: "auth-code-1",
      codeVerifier: auth.pkce.codeVerifier,
      microsoftTenantId: "11111111-1111-1111-1111-111111111111",
      transport: createMockTokenTransport(),
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
    expect(validateAccessToken({ token: tokens, asOf: "2026-07-26T08:00:00.000Z" }).ok).toBe(
      true,
    );

    const refreshed = await refreshAccessToken({
      app,
      refreshToken: tokens.refreshToken!,
      microsoftTenantId: tokens.tenantId,
      asOf: "2026-07-26T08:30:00.000Z",
    });
    expect(refreshed.accessToken).toBeTruthy();
  });

  it("encrypts tokens — no plaintext credentials persisted", () => {
    const vault = createTokenVault("vault:test");
    const encrypted = vault.encrypt({
      accessToken: "secret-access",
      refreshToken: "secret-refresh",
      idToken: "secret-id",
      tokenType: "Bearer",
      expiresAt: "2026-07-26T09:00:00.000Z",
      scopes: ["Calendars.Read"],
      tenantId: "t1",
    });
    expect(encrypted.accessTokenEncrypted).not.toContain("secret-access");
    expect(assertNoPlaintextCredentials(encrypted).ok).toBe(true);
    expect(vault.decrypt(encrypted).accessToken).toBe("secret-access");
  });

  it("production Graph client pages, batches, and handles 429", async () => {
    let calls = 0;
    const transport = {
      async fetch() {
        calls += 1;
        if (calls === 1) {
          return {
            status: 429,
            headers: { "retry-after": "0" } as Record<string, string>,
            body: "",
          };
        }
        return {
          status: 200,
          headers: {} as Record<string, string>,
          body: JSON.stringify({
            value: [{ id: "1" }],
            "@odata.nextLink": null,
          }),
        };
      },
    };

    let tokens: TokenSet = {
      accessToken: "access",
      refreshToken: "refresh",
      idToken: null,
      tokenType: "Bearer",
      expiresAt: "2026-07-26T12:00:00.000Z",
      scopes: ["Calendars.Read"],
      tenantId: "t1",
    };

    const client = createProductionGraphClient({
      app,
      getTokens: () => tokens,
      setTokens: (next) => {
        tokens = next;
      },
      transport,
      asOf: "2026-07-26T08:00:00.000Z",
    });

    const items = await client.paginate("/me/events");
    expect(items).toHaveLength(1);
    expect(client.telemetry().some((e) => e.throttled)).toBe(true);

    const batch = await createProductionGraphClient({
      app,
      getTokens: () => tokens,
      setTokens: (next) => {
        tokens = next;
      },
      transport: createMockGraphHttpTransport(),
      asOf: "2026-07-26T08:00:00.000Z",
    }).batch([{ id: "1", method: "GET", url: "/me/events" }]);
    expect(batch[0]?.status).toBe(200);
  });

  it("supports delta sync simulation and large tenants", () => {
    let state = createDeltaState("/me/events");
    const applied = applyDeltaPage(
      state,
      {
        items: [{ id: "a" }],
        deltaLink:
          "https://graph.microsoft.com/v1.0/me/events/delta?$deltatoken=tok-1",
        nextLink: null,
      },
      "2026-07-26T08:00:00.000Z",
    );
    expect(applied.page.complete).toBe(true);
    expect(applied.state.deltaToken).toContain("tok-1");

    const large = simulateLargeTenantDelta({
      resource: "/me/events",
      pages: 5,
      itemsPerPage: 100,
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(large.totalItems).toBe(500);
    expect(large.states.at(-1)?.deltaToken).toBeTruthy();
  });

  it("accepts webhook notifications and supports replay", () => {
    const store = createWebhookStore();
    const sub = store.subscribe({
      resource: "/me/events",
      notificationUrl: "https://app.executiveos.test/hooks/m365",
      clientState: "cs-1",
      expirationDateTime: "2026-07-27T08:00:00.000Z",
    });
    const ok = store.receive(
      {
        subscriptionId: sub.id,
        clientState: "cs-1",
        changeType: "updated",
        resource: "/me/events",
      },
      "2026-07-26T08:00:00.000Z",
    );
    expect(ok.accepted).toBe(true);
    expect(store.replay(sub.id)).toHaveLength(1);

    const bad = store.receive(
      {
        subscriptionId: sub.id,
        clientState: "wrong",
        changeType: "updated",
        resource: "/me/events",
      },
      "2026-07-26T08:01:00.000Z",
    );
    expect(bad.accepted).toBe(false);
  });

  it("connects, syncs live context, and isolates tenants", async () => {
    const registry = createM365ConnectionRegistry();
    const asOf = "2026-07-26T08:00:00.000Z";
    const tokens = await exchangeAuthorizationCode({
      app,
      code: "code-a",
      codeVerifier: createPkcePair().codeVerifier,
      microsoftTenantId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      asOf,
    });

    registry.connect({
      executiveosTenantId: "tenant-a",
      microsoftTenantId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      tokens,
      userId: "admin@a.test",
      scopes: [...PRODUCTION_GRAPH_SCOPES],
      asOf,
    });

    const tokensB = await exchangeAuthorizationCode({
      app,
      code: "code-b",
      codeVerifier: createPkcePair().codeVerifier,
      microsoftTenantId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      asOf,
    });
    registry.connect({
      executiveosTenantId: "tenant-b",
      microsoftTenantId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      tokens: tokensB,
      userId: "admin@b.test",
      scopes: [...PRODUCTION_GRAPH_SCOPES],
      asOf,
    });

    const syncA = await registry.sync({
      executiveosTenantId: "tenant-a",
      mode: "full",
      asOf,
    });
    expect(syncA?.ok).toBe(true);
    expect(registry.getLiveBrief("tenant-a")).toBeTruthy();
    expect(registry.getLiveBrief("tenant-b")).toBeNull();

    const isolation = assertTenantIsolation(
      createSecurityContext({ tenantId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" }),
      "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    );
    expect(isolation.ok).toBe(false);

    registry.revokeConsent("tenant-a", asOf);
    expect(registry.adminStatus("tenant-a")?.authenticationStatus).toBe("revoked");
  });

  it("detects authentication expiry and consent revocation", async () => {
    const expired = {
      accessToken: "x",
      refreshToken: "revoked",
      idToken: null,
      tokenType: "Bearer",
      expiresAt: "2026-07-26T07:00:00.000Z",
      scopes: ["Calendars.Read"],
      tenantId: "t1",
    };
    expect(
      validateAccessToken({
        token: expired,
        asOf: "2026-07-26T08:00:00.000Z",
      }).ok,
    ).toBe(false);

    await expect(
      refreshAccessToken({
        app,
        refreshToken: "revoked",
        microsoftTenantId: "t1",
        transport: createMockTokenTransport(),
        asOf: "2026-07-26T08:00:00.000Z",
      }),
    ).rejects.toThrow(/consent revoked|invalid_grant/i);
  });

  it("live sync engine checkpoints and prefers live brief in Today pipeline", async () => {
    const engine = createLiveSyncEngine();
    const config = createDefaultConnectorConfiguration("tenant-northline");
    const connected = {
      ...config,
      connected: true,
      microsoftTenantId: "northline-m365",
      consentedScopes: [...PRODUCTION_GRAPH_SCOPES],
    };
    const run = await engine.run({
      mode: "delta",
      config: connected,
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(run.ok).toBe(true);
    expect(run.checkpoints.every((c) => c.status === "succeeded")).toBe(true);

    const tokens = await exchangeAuthorizationCode({
      app,
      code: "live",
      codeVerifier: createPkcePair().codeVerifier,
      microsoftTenantId: "northline-m365",
      asOf: "2026-07-26T08:00:00.000Z",
    });
    const globalRegistry = getM365ConnectionRegistry();
    globalRegistry.connect({
      executiveosTenantId: "tenant-northline",
      microsoftTenantId: "northline-m365",
      tokens,
      userId: "alex@northline.test",
      scopes: [...PRODUCTION_GRAPH_SCOPES],
      asOf: "2026-07-26T08:00:00.000Z",
    });
    await globalRegistry.sync({
      executiveosTenantId: "tenant-northline",
      mode: "incremental",
      asOf: "2026-07-26T08:00:00.000Z",
    });

    const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
    const applied = applyMicrosoft365ExecutiveContext({
      snapshot,
      options: { executiveosTenantId: "tenant-northline" },
    });
    expect(applied.executiveContextBrief.providerId).toBe("microsoft365");
    expect(applied.executiveContextBrief.commitments.length).toBeGreaterThan(0);
  });
});
