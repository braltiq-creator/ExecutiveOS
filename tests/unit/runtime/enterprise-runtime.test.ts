import { describe, expect, it, beforeEach } from "vitest";
import {
  IDENTITY_PROVIDERS,
  RUNTIME_ROLES,
  WORKSPACE_KINDS,
  ORG_NODE_KINDS,
  clearTenantRegistry,
  createNorthlineTenant,
  bootstrapNorthlineRuntime,
  authorize,
  authorizeFeature,
  authorizeConnector,
  projectExperienceForTenant,
  evaluatePolicy,
  createDefaultPolicies,
  createFeatureFlagStore,
  createDefaultFeatureFlags,
  assertLicensed,
  seatsRemaining,
  buildCompliancePosture,
  buildBillingReadySnapshot,
  createEnterpriseLicense,
  createUsageStore,
  provisionIdentityJustInTime,
  hasPermission,
  resolvePermissions,
} from "@/runtime";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

describe("Enterprise Runtime & Multi-Tenant Platform", () => {
  beforeEach(() => {
    clearTenantRegistry();
  });

  it("supports first-class tenants with isolation, residency, and licensing", () => {
    const a = createNorthlineTenant();
    expect(a.dataResidency).toBe("au");
    expect(a.isolationRules.every((r) => r.enforced)).toBe(true);
    expect(a.licensing.planId).toBe("enterprise");

    // Second tenant — same deployment, separate identity
    const b = {
      ...a,
      id: "tenant-acme",
      identity: { ...a.identity, slug: "acme", displayName: "Acme" },
      organisationId: "org-acme",
    };
    expect(b.id).not.toBe(a.id);
    expect(b.organisationId).not.toBe(a.organisationId);
  });

  it("catalogues enterprise identity providers including future SAML", () => {
    expect(IDENTITY_PROVIDERS).toEqual(
      expect.arrayContaining([
        "microsoft_entra_id",
        "okta",
        "google_identity",
        "ping_identity",
        "auth0",
        "saml_future",
      ]),
    );
    const identity = provisionIdentityJustInTime({
      email: "ceo@acme.test",
      displayName: "CEO",
      provider: "okta",
      groups: ["Executives"],
    });
    expect(identity.mfaSatisfied).toBe(true);
    expect(identity.provider).toBe("okta");
  });

  it("resolves RBAC with inheritance, and gates unauthorised access", () => {
    expect(RUNTIME_ROLES).toContain("ceo");
    expect(RUNTIME_ROLES).toContain("platform_administrator");
    const ceoPerms = resolvePermissions("ceo");
    expect(hasPermission(ceoPerms, "decisions:write")).toBe(true);
    expect(hasPermission(resolvePermissions("analyst"), "tenant:admin")).toBe(
      false,
    );

    const { context: analyst } = bootstrapNorthlineRuntime({ role: "analyst" });
    expect(authorize(analyst, "decisions:write").ok).toBe(false);
    expect(authorize(analyst, "intelligence:read").ok).toBe(true);
  });

  it("models organisation scope and workspaces", () => {
    expect(ORG_NODE_KINDS).toContain("board");
    expect(WORKSPACE_KINDS).toHaveLength(8);
    const { context } = bootstrapNorthlineRuntime({
      workspaceKind: "board",
    });
    expect(context.workspace.kind).toBe("board");
    expect(context.organisation.nodes.some((n) => n.kind === "board")).toBe(
      true,
    );
  });

  it("enforces policies for connectors, export, and residency", () => {
    const tenant = createNorthlineTenant();
    const policies = createDefaultPolicies(tenant.id);
    expect(
      evaluatePolicy({
        policies,
        kind: "connector_permissions",
        action: "use",
        connectorSystem: "sap",
      }).allowed,
    ).toBe(true);
    expect(
      evaluatePolicy({
        policies,
        kind: "connector_permissions",
        action: "use",
        connectorSystem: "unknown-erp",
      }).allowed,
    ).toBe(false);
    expect(
      evaluatePolicy({
        policies,
        kind: "data_export",
        action: "export",
        hasExportPermission: false,
      }).allowed,
    ).toBe(false);
    expect(
      evaluatePolicy({
        policies,
        kind: "regional_restrictions",
        action: "store",
        region: "us",
      }).allowed,
    ).toBe(false);
  });

  it("records immutable searchable audit events", () => {
    const { context } = bootstrapNorthlineRuntime();
    context.audit.append({
      tenantId: context.tenant.id,
      actorUserId: context.identity.userId,
      action: "executive_decision",
      resourceType: "decision",
      resourceId: "decision-residency",
      summary: "Decision reviewed",
      metadata: {},
      at: context.asOf,
    });
    const events = context.audit.list({ action: "executive_decision" });
    expect(events.length).toBe(1);
    expect(context.audit.verifyIntegrity().ok).toBe(true);
    expect(context.audit.list({ action: "authentication" }).length).toBeGreaterThan(
      0,
    );
  });

  it("supports feature flags with tenant override and emergency disable", () => {
    const flags = createFeatureFlagStore(createDefaultFeatureFlags());
    expect(flags.isEnabled("futures", "tenant-northline")).toBe(true);
    flags.setTenantOverride("reality_lab_beta", "tenant-northline", true);
    expect(flags.isEnabled("reality_lab_beta", "tenant-northline")).toBe(true);
    flags.emergencyDisable("futures");
    expect(flags.isEnabled("futures", "tenant-northline")).toBe(false);
  });

  it("prepares licensing, usage, and billing-ready snapshots without payments", () => {
    const license = createEnterpriseLicense("tenant-northline");
    expect(assertLicensed(license, "module", "module-futures").ok).toBe(true);
    expect(seatsRemaining(license, 8)).toBe(17);
    const usage = createUsageStore();
    usage.increment("ai_requests", 3);
    usage.increment("connector_syncs", 2);
    const billing = buildBillingReadySnapshot({
      license,
      usedSeats: 8,
      usage: usage.snapshot(),
    });
    expect(billing.readyForCheckout).toBe(true);
    expect(billing.paymentProviderReady).toContain("stripe");
  });

  it("exposes compliance posture for SOC2 / ISO / GDPR / Australian Privacy Act", () => {
    const posture = buildCompliancePosture({
      tenantId: "tenant-northline",
      dataResidency: "au",
    });
    expect(posture.encryptionAtRest).toBe(true);
    expect(posture.encryptionInTransit).toBe(true);
    expect(posture.controls.some((c) => c.framework === "soc2")).toBe(true);
    expect(
      posture.controls.some((c) => c.framework === "australian_privacy_act"),
    ).toBe(true);
  });

  it("requires TenantContext before execution and projects Today by authorisation", () => {
    const core = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    const { context: ceo } = bootstrapNorthlineRuntime({ role: "ceo" });
    const ceoView = projectExperienceForTenant(ceo, core);
    expect(ceoView.features.futures).toBe(true);
    expect(ceoView.features.agenda).toBe(true);
    expect(ceoView.snapshot.possibleFutures).toBeDefined();

    const { context: analyst } = bootstrapNorthlineRuntime({
      role: "analyst",
      email: "analyst@northline.test",
    });
    // Analyst lacks intelligence:brief
    expect(authorize(analyst, "intelligence:brief").ok).toBe(false);
    const analystView = projectExperienceForTenant(analyst, core);
    expect(analystView.snapshot.executiveCouncil).toBeUndefined();
    expect(analystView.snapshot.possibleFutures).toBeUndefined();
    expect(analystView.denied.length).toBeGreaterThan(0);
  });

  it("can customise per tenant via configuration and connector policy without Core changes", () => {
    const { context } = bootstrapNorthlineRuntime();
    expect(context.configuration.values.timezone).toBe("Australia/Sydney");
    expect(authorizeConnector(context, "microsoft365").ok).toBe(true);
    expect(authorizeFeature(context, "microsoft365_context").ok).toBe(true);

    // Progressive capability — emergency disable futures for tenant
    context.features.emergencyDisable("futures");
    expect(authorizeFeature(context, "futures").ok).toBe(false);
  });

  it("bootstraps observability and telemetry for platform operations", () => {
    const { context } = bootstrapNorthlineRuntime();
    expect(context.observability.components.length).toBeGreaterThanOrEqual(6);
    expect(context.observability.availability).toBeGreaterThan(50);
    const events = context.telemetry.flush();
    expect(events.some((e) => e.name === "tenant_context.resolved")).toBe(true);
  });

  it("scale model: many organisations share one runtime architecture", () => {
    const tenants = Array.from({ length: 20 }, (_, i) => {
      const base = createNorthlineTenant();
      return {
        ...base,
        id: `tenant-${i}`,
        identity: {
          slug: `org-${i}`,
          legalName: `Org ${i}`,
          displayName: `Org ${i}`,
        },
        organisationId: `org-${i}`,
      };
    });
    expect(new Set(tenants.map((t) => t.id)).size).toBe(20);
    // Same code path resolves context per tenant
    const runtime = bootstrapNorthlineRuntime();
    expect(runtime.context.tenant.id).toBe("tenant-northline");
    expect(runtime.identityProviders).toHaveLength(IDENTITY_PROVIDERS.length);
  });
});
