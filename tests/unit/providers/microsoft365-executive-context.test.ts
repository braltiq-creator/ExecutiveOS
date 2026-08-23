import { describe, expect, it } from "vitest";
import {
  applyMicrosoft365ExecutiveContext,
  syncMicrosoft365ExecutiveContext,
  toExecutiveContextView,
  createMicrosoftGraphClient,
  EXECUTIVE_SIGNAL_IDS,
  assertTenantIsolation,
  assertLeastPrivilege,
  createSecurityContext,
  rotateSecret,
  enrichRelationshipGraph,
} from "@/providers/microsoft365";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { KnowledgeGraph } from "@/knowledge-graph";
import { EnterpriseDigitalTwin } from "@/digital-twin";
import { conveneExecutiveCouncil, createAgentContext } from "@/agents";

describe("Microsoft 365 Executive Context Provider", () => {
  const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);

  it("authenticates via Graph client with token refresh and delta support", async () => {
    const client = createMicrosoftGraphClient({
      tenantId: "northline-tenant",
      credentials: {
        strategy: "oauth2",
        clientId: "eos",
        clientSecretRef: "secret:m365",
      },
      asOf: "2026-07-26T07:00:00.000Z",
    });
    const auth = client.authenticate();
    expect(auth.ok).toBe(true);
    const refreshed = client.refreshToken();
    expect(refreshed.ok).toBe(true);
    const delta = await client.delta(" /me/calendarView".trim());
    expect(delta.items.length).toBeGreaterThan(0);
    expect(delta.deltaLink).toBeTruthy();
    const hook = client.registerWebhook({
      resource: "/me/events",
      notificationUrl: "https://example.invalid/hooks/m365",
      clientState: "state",
    });
    expect(hook.ok).toBe(true);
  });

  it("produces executive insight instead of Microsoft objects", async () => {
    const result = await syncMicrosoft365ExecutiveContext({
      snapshot,
      options: { tenantId: "northline-tenant", asOf: snapshot.asOf },
    });

    expect(result.brief.providerId).toBe("microsoft365");
    expect(result.brief.commitments.length).toBeGreaterThan(0);
    expect(result.brief.commitments.some((c) => c.kind === "governance_event")).toBe(
      true,
    );
    expect(result.brief.signals.map((s) => s.id).sort()).toEqual(
      [...EXECUTIVE_SIGNAL_IDS].sort(),
    );

    // No vendor leakage in BusinessEvents
    for (const event of result.events) {
      expect(event.sourceSystem).toBe("microsoft365");
      expect(JSON.stringify(event.payload)).not.toMatch(/odata|GraphCalendar|bodyPreview/i);
    }
  });

  it("enriches the Knowledge Graph with executive relationships", async () => {
    const graph = new KnowledgeGraph({
      asOf: snapshot.asOf,
      source: "m365-test",
    });
    const twin = new EnterpriseDigitalTwin({ source: "m365-test" });
    const result = await syncMicrosoft365ExecutiveContext({
      snapshot,
      graph,
      twin,
      options: { tenantId: "northline-tenant", asOf: snapshot.asOf },
    });
    expect(result.relationshipEnrichment?.entitiesUpserted).toBeGreaterThan(0);
    expect(graph.listEntities("Meeting").length).toBeGreaterThan(0);
    expect(graph.listEntities("Person").length).toBeGreaterThan(0);
    expect(graph.listEntities("Document").length).toBeGreaterThan(0);
    expect(twin.getState().eventCount).toBeGreaterThan(0);
  });

  it("lets Council members reference Microsoft context without vendor objects", () => {
    const withContext = applyMicrosoft365ExecutiveContext({ snapshot }).snapshot;
    const brief = conveneExecutiveCouncil(withContext);
    const ceo = brief.perspectives.find((p) => p.agentId === "ceo");
    const cfo = brief.perspectives.find((p) => p.agentId === "cfo");
    const coo = brief.perspectives.find((p) => p.agentId === "coo");
    const cso = brief.perspectives.find((p) => p.agentId === "cso");

    expect(ceo?.review.summary).toMatch(/board|attention|sequence/i);
    expect(cfo?.review.summary).toMatch(/finance/i);
    expect(coo?.review.summary).toMatch(/operating|operations|delivery/i);
    expect(cso?.review.summary.length).toBeGreaterThan(10);

    const ctx = createAgentContext(withContext);
    expect(ctx.executiveContext).toBeDefined();
    expect(JSON.stringify(ctx.executiveContext)).not.toMatch(/@odata|GraphCalendar/);
  });

  it("wires into Today presentation for a pre-8am briefing", () => {
    const ui = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    expect(ui.executiveContext).toBeDefined();
    expect(ui.executiveContext!.calendar.length).toBeGreaterThan(0);
    expect(ui.executiveContext!.boardReadiness.label.length).toBeGreaterThan(0);
    expect(ui.executiveContext!.keyRelationships.length).toBeGreaterThan(0);
    expect(ui.executiveContext!.criticalDocuments.length).toBeGreaterThan(0);
    expect(ui.executiveContext!.strategicConversations.length).toBeGreaterThan(0);

    const view = toExecutiveContextView(
      applyMicrosoft365ExecutiveContext({ snapshot }).executiveContextBrief,
    );
    expect(view.signals.length).toBe(EXECUTIVE_SIGNAL_IDS.length);
  });

  it("keeps executive context vendor-independent (Google Workspace-shaped)", () => {
    const brief = applyMicrosoft365ExecutiveContext({ snapshot }).executiveContextBrief;
    // A Google provider would only need to change providerId and source of commitments
    const portable = {
      ...brief,
      providerId: "google_workspace" as const,
      framing: brief.framing.replace("Microsoft", "Workspace"),
    };
    expect(portable.commitments[0].kind).toBeTruthy();
    expect(portable.signals[0].id).toBeTruthy();
    expect(toExecutiveContextView(portable).calendar.length).toBeGreaterThan(0);
  });

  it("enforces least privilege, tenant isolation, audit, and secret rotation", () => {
    let security = createSecurityContext({ tenantId: "tenant-a" });
    expect(assertTenantIsolation(security, "tenant-b").ok).toBe(false);
    expect(assertTenantIsolation(security, "tenant-a").ok).toBe(true);
    expect(assertLeastPrivilege(security).ok).toBe(true);
    security = rotateSecret(security, "2026-07-26T08:00:00.000Z");
    expect(security.secretRotatedAt).toBe("2026-07-26T08:00:00.000Z");
    expect(security.auditLog.some((e) => e.action === "secret_rotation")).toBe(
      true,
    );
  });

  it("can enrich relationships from a portable brief without Graph", () => {
    const graph = new KnowledgeGraph({
      asOf: snapshot.asOf,
      source: "enrich-only",
    });
    const brief = applyMicrosoft365ExecutiveContext({ snapshot }).executiveContextBrief;
    const result = enrichRelationshipGraph(graph, brief);
    expect(result.entitiesUpserted).toBeGreaterThan(0);
    expect(result.relationshipsUpserted).toBeGreaterThan(0);
  });
});
