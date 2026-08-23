/**
 * Bootstrap a complete in-memory enterprise runtime for a tenant.
 */

import { createNorthlineTenant, registerTenant } from "@/runtime/tenant";
import {
  createIdentityProviderConfig,
  provisionIdentityJustInTime,
} from "@/runtime/identity";
import type { RuntimeRole } from "@/runtime/rbac";
import {
  createNorthlineOrganisation,
  type OrganisationModel,
} from "@/runtime/organisation";
import type { IntelligenceProfileId } from "@/profiles";
import { isSnapshotWorkflowId } from "@/executive-snapshot-studio/launch/resolve-intelligence-profile";
import { createDefaultWorkspaces } from "@/runtime/workspace";
import { createDefaultPolicies } from "@/runtime/policy";
import { createAuditStore } from "@/runtime/audit";
import { buildPlatformObservability } from "@/runtime/observability";
import { createTelemetryBus } from "@/runtime/telemetry";
import { createTenantConfiguration } from "@/runtime/configuration";
import {
  createDefaultFeatureFlags,
  createFeatureFlagStore,
} from "@/runtime/feature-flags";
import { createEnterpriseLicense } from "@/runtime/licensing";
import { createUsageStore } from "@/runtime/usage";
import { buildBillingReadySnapshot } from "@/runtime/billing-ready";
import { buildCompliancePosture } from "@/runtime/compliance";
import {
  resolveTenantContext,
  type TenantContext,
} from "@/runtime/context";

export type BootstrappedRuntime = {
  context: TenantContext;
  identityProviders: ReturnType<typeof createIdentityProviderConfig>[];
};

export function bootstrapNorthlineRuntime(input?: {
  role?: RuntimeRole;
  workspaceKind?: string;
  email?: string;
  asOf?: string;
}): BootstrappedRuntime {
  const asOf = input?.asOf ?? "2026-07-26T08:00:00+10:00";
  const tenant = createNorthlineTenant(asOf);
  const organisation = createNorthlineOrganisation(tenant.id);
  return finishBootstrap({
    tenant,
    organisation,
    role: input?.role ?? "ceo",
    workspaceKind: input?.workspaceKind,
    email: input?.email ?? "alex@northline.test",
    displayName: "Alex",
    asOf,
  });
}

/**
 * Bootstrap runtime from an Executive Snapshot — never Northline / Helix / Alex.
 * Requires a real Intelligence Profile catalogue id (never "executive_snapshot").
 */
export function bootstrapExecutiveSnapshotRuntime(input: {
  organisationId: string;
  organisationName?: string;
  profileLabel: string;
  snapshotId: string;
  /** Existing catalogue id — commercial_executive | operations_executive. */
  intelligenceProfileId: IntelligenceProfileId;
  role?: RuntimeRole;
  asOf?: string;
}): BootstrappedRuntime {
  if (
    !input.intelligenceProfileId ||
    isSnapshotWorkflowId(input.intelligenceProfileId)
  ) {
    throw new Error(
      'The snapshot\'s business profile could not be resolved. "executive_snapshot" is a Snapshot Studio workflow identifier, not an intelligence profile.',
    );
  }

  const asOf = input.asOf ?? new Date().toISOString();
  const displayName =
    input.organisationName?.trim() ||
    input.profileLabel ||
    "Executive Snapshot";
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "snapshot";
  const tenantId = `tenant-snap-${input.snapshotId.slice(0, 24)}`;

  const tenant = registerTenant({
    id: tenantId,
    identity: {
      slug,
      legalName: displayName,
      displayName,
    },
    organisationId: input.organisationId,
    businessUnitIds: [],
    regions: [],
    executiveTeamIds: [],
    connectorRegistryIds: [],
    knowledgePackIds: [],
    contextProviderIds: [],
    configuration: {
      timezone: "Australia/Sydney",
      briefingHour: 7,
      intelligenceProfileId: input.intelligenceProfileId,
      snapshotId: input.snapshotId,
      snapshotWorkflowId: "executive_snapshot",
    },
    branding: {
      displayName,
    },
    licensing: {
      planId: "enterprise",
      status: "active",
      seats: 5,
      modules: ["command_centre", "snapshot_studio"],
    },
    dataResidency: "au",
    retention: {
      auditDays: 365,
      eventDays: 90,
      knowledgeDays: 365,
      softDeleteDays: 30,
    },
    isolationRules: [
      {
        id: "iso-snapshot",
        kind: "data",
        description: "Isolated from demo Northline / Helix context",
        enforced: true,
      },
    ],
    createdAt: asOf,
    status: "active",
  });

  const organisation: OrganisationModel = {
    tenantId,
    nodes: [
      {
        id: input.organisationId,
        kind: "enterprise",
        name: displayName,
        parentId: null,
        tenantId,
      },
    ],
  };

  return finishBootstrap({
    tenant,
    organisation,
    role: input.role ?? "ceo",
    email: `executive@${slug || "snapshot"}.local`,
    displayName: "Executive",
    asOf,
    intelligenceProfileId: input.intelligenceProfileId,
  });
}

function finishBootstrap(input: {
  tenant: ReturnType<typeof createNorthlineTenant>;
  organisation: OrganisationModel;
  role: RuntimeRole;
  workspaceKind?: string;
  email: string;
  displayName: string;
  asOf: string;
  intelligenceProfileId?: IntelligenceProfileId;
}): BootstrappedRuntime {
  const { tenant, organisation, asOf } = input;
  const workspaces = createDefaultWorkspaces(tenant.id);
  const policies = createDefaultPolicies(tenant.id);
  const configuration = createTenantConfiguration(tenant.id, {
    ...(input.intelligenceProfileId
      ? { intelligenceProfileId: input.intelligenceProfileId }
      : {}),
  });
  const license = createEnterpriseLicense(tenant.id, asOf);
  const features = createFeatureFlagStore(createDefaultFeatureFlags());
  const audit = createAuditStore(tenant.id);
  const telemetry = createTelemetryBus();
  const usage = createUsageStore("2026-07");
  usage.increment("active_users", 1);
  const observability = buildPlatformObservability({
    tenantId: tenant.id,
    asOf,
  });
  const billing = buildBillingReadySnapshot({
    license,
    usedSeats: 8,
    usage: usage.snapshot(),
  });
  const compliance = buildCompliancePosture({
    tenantId: tenant.id,
    dataResidency: tenant.dataResidency,
  });

  const identity = provisionIdentityJustInTime({
    email: input.email,
    displayName: input.displayName,
    provider: "microsoft_entra_id",
    groups: ["ELT", "CEO"],
    asOf,
  });

  const workspace =
    workspaces.find((w) => w.kind === (input.workspaceKind ?? "corporate")) ??
    workspaces[0];

  const context = resolveTenantContext({
    tenant,
    identity,
    role: input.role,
    organisation,
    workspaces,
    workspaceId: workspace.id,
    policies,
    configuration,
    license,
    features,
    audit,
    telemetry,
    usage,
    observability,
    billing,
    compliance,
    asOf,
  });

  const identityProviders = (
    [
      "microsoft_entra_id",
      "okta",
      "google_identity",
      "ping_identity",
      "auth0",
      "saml_future",
    ] as const
  ).map((id) => createIdentityProviderConfig({ id, tenantId: tenant.id }));

  return { context, identityProviders };
}
