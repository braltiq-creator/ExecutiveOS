/**
 * Tenant Context — resolved before every execution.
 */

import type { Tenant } from "@/runtime/tenant";
import type { RuntimeIdentity } from "@/runtime/identity";
import type {
  RuntimePermission,
  RuntimeRole,
  TemporaryAccessGrant,
  DelegatedAdminGrant,
} from "@/runtime/rbac";
import {
  hasPermission,
  isTemporaryAccessActive,
  mergeDelegatedPermissions,
  resolvePermissions,
} from "@/runtime/rbac";
import type { OrganisationModel } from "@/runtime/organisation";
import type { Workspace } from "@/runtime/workspace";
import type { PolicyRule } from "@/runtime/policy";
import { evaluatePolicy } from "@/runtime/policy";
import type { AuditStore } from "@/runtime/audit";
import type { PlatformObservability } from "@/runtime/observability";
import type { TelemetryBus } from "@/runtime/telemetry";
import type { TenantConfiguration } from "@/runtime/configuration";
import type { FeatureFlagStore } from "@/runtime/feature-flags";
import type { TenantLicense } from "@/runtime/licensing";
import { assertLicensed } from "@/runtime/licensing";
import type { UsageStore } from "@/runtime/usage";
import type { BillingReadySnapshot } from "@/runtime/billing-ready";
import type { CompliancePosture } from "@/runtime/compliance";

export type TenantContext = {
  tenant: Tenant;
  identity: RuntimeIdentity;
  role: RuntimeRole;
  permissions: RuntimePermission[];
  organisation: OrganisationModel;
  workspace: Workspace;
  workspaces: Workspace[];
  policies: PolicyRule[];
  configuration: TenantConfiguration;
  license: TenantLicense;
  features: FeatureFlagStore;
  audit: AuditStore;
  telemetry: TelemetryBus;
  usage: UsageStore;
  observability: PlatformObservability;
  billing: BillingReadySnapshot;
  compliance: CompliancePosture;
  asOf: string;
};

export type ResolveTenantContextInput = {
  tenant: Tenant;
  identity: RuntimeIdentity;
  role: RuntimeRole;
  organisation: OrganisationModel;
  workspaces: Workspace[];
  workspaceId?: string;
  policies: PolicyRule[];
  configuration: TenantConfiguration;
  license: TenantLicense;
  features: FeatureFlagStore;
  audit: AuditStore;
  telemetry: TelemetryBus;
  usage: UsageStore;
  observability: PlatformObservability;
  billing: BillingReadySnapshot;
  compliance: CompliancePosture;
  temporaryAccess?: TemporaryAccessGrant[];
  delegatedAdmin?: DelegatedAdminGrant[];
  customPermissions?: RuntimePermission[];
  asOf?: string;
};

/**
 * Every request must resolve a Tenant Context before execution.
 */
export function resolveTenantContext(
  input: ResolveTenantContextInput,
): TenantContext {
  const asOf = input.asOf ?? new Date().toISOString();

  if (input.tenant.status !== "active" && input.tenant.status !== "provisioning") {
    throw new Error(`Tenant ${input.tenant.id} is ${input.tenant.status}`);
  }

  const workspace =
    input.workspaces.find((w) => w.id === input.workspaceId) ??
    input.workspaces.find((w) => w.kind === "corporate") ??
    input.workspaces[0];

  if (!workspace || workspace.tenantId !== input.tenant.id) {
    throw new Error("Workspace does not belong to tenant");
  }

  let permissions = resolvePermissions(
    input.role,
    input.customPermissions ?? [],
  );

  for (const grant of input.temporaryAccess ?? []) {
    if (
      grant.userId === input.identity.userId &&
      isTemporaryAccessActive(grant, asOf)
    ) {
      permissions = [...new Set([...permissions, ...grant.permissions])];
    }
  }

  permissions = mergeDelegatedPermissions(
    permissions,
    input.delegatedAdmin ?? [],
    input.identity.userId,
  );

  input.audit.append({
    tenantId: input.tenant.id,
    workspaceId: workspace.id,
    actorUserId: input.identity.userId,
    action: "authentication",
    resourceType: "tenant_context",
    resourceId: input.tenant.id,
    summary: `Resolved tenant context for ${input.identity.email} as ${input.role}`,
    metadata: {
      workspace: workspace.id,
      role: input.role,
      mfa: input.identity.mfaSatisfied,
    },
    at: asOf,
  });

  input.telemetry.emit({
    name: "tenant_context.resolved",
    tenantId: input.tenant.id,
    at: asOf,
    attributes: {
      role: input.role,
      workspace: workspace.kind,
    },
  });

  input.usage.increment("active_users", 0); // touch store

  return {
    tenant: input.tenant,
    identity: input.identity,
    role: input.role,
    permissions,
    organisation: input.organisation,
    workspace,
    workspaces: input.workspaces.filter((w) => w.tenantId === input.tenant.id),
    policies: input.policies,
    configuration: input.configuration,
    license: input.license,
    features: input.features,
    audit: input.audit,
    telemetry: input.telemetry,
    usage: input.usage,
    observability: input.observability,
    billing: input.billing,
    compliance: input.compliance,
    asOf,
  };
}

export function authorize(
  ctx: TenantContext,
  permission: RuntimePermission,
): { ok: boolean; reason: string } {
  if (!hasPermission(ctx.permissions, permission)) {
    ctx.audit.append({
      tenantId: ctx.tenant.id,
      workspaceId: ctx.workspace.id,
      actorUserId: ctx.identity.userId,
      action: "security_event",
      resourceType: "permission",
      resourceId: permission,
      summary: `Denied ${permission}`,
      metadata: { role: ctx.role },
      at: ctx.asOf,
    });
    return { ok: false, reason: `Missing permission ${permission}` };
  }
  return { ok: true, reason: "Authorised" };
}

export function authorizeFeature(
  ctx: TenantContext,
  featureKey: string,
): { ok: boolean; reason: string } {
  if (!ctx.features.isEnabled(featureKey, ctx.tenant.id, ctx.identity.userId)) {
    return { ok: false, reason: `Feature ${featureKey} disabled for tenant` };
  }
  // Module license check when feature maps to a module sku
  const moduleSku = `module-${featureKey.replace(/_context$/, "").replace(/microsoft365/, "connectivity")}`;
  if (featureKey === "futures") {
    const licensed = assertLicensed(ctx.license, "module", "module-futures");
    if (!licensed.ok) return licensed;
  }
  if (featureKey === "agenda") {
    const licensed = assertLicensed(ctx.license, "module", "module-agenda");
    if (!licensed.ok) return licensed;
  }
  if (featureKey === "microsoft365_context") {
    const licensed = assertLicensed(
      ctx.license,
      "provider",
      "provider-microsoft365",
    );
    if (!licensed.ok) return licensed;
  }
  if (featureKey === "simpro_context") {
    const licensed = assertLicensed(ctx.license, "provider", "provider-simpro");
    if (!licensed.ok) return licensed;
  }
  if (featureKey === "salesforce_context") {
    const licensed = assertLicensed(
      ctx.license,
      "provider",
      "provider-salesforce",
    );
    if (!licensed.ok) return licensed;
  }
  void moduleSku;
  return { ok: true, reason: "Feature available" };
}

export function authorizeConnector(
  ctx: TenantContext,
  connectorSystem: string,
): { ok: boolean; reason: string } {
  const admin = hasPermission(ctx.permissions, "connectors:admin");
  const read = hasPermission(ctx.permissions, "connectors:read");
  if (!admin && !read) {
    return { ok: false, reason: "Missing connectors permission" };
  }
  const decision = evaluatePolicy({
    policies: ctx.policies,
    kind: "connector_permissions",
    action: "use_connector",
    connectorSystem,
  });
  return { ok: decision.allowed, reason: decision.reason };
}
