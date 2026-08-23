/**
 * Experience filter — Today respects tenant/role/workspace/flags without Core changes.
 */

import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { TenantContext } from "@/runtime/context";
import { authorize, authorizeFeature } from "@/runtime/context";
import {
  projectProfileExperience,
  type BriefSectionDescriptor,
  type IntelligenceProfile,
} from "@/profiles";
import { attachScenariosToTodayActions } from "@/scenarios";
import { attachMemoryRecallToTodayActions } from "@/memory";
import {
  attachStrategicOutcomesToTodayActions,
  attachStrategicOutcomesToCouncil,
} from "@/strategy";
import { attachTrustExplanationsToTodayActions } from "@/trust";
import { attachAdaptiveLearningToTodayActions } from "@/adaptive";

export type RuntimeExperienceView = {
  tenantId: string;
  tenantName: string;
  workspaceName: string;
  workspaceKind: string;
  role: string;
  region: string;
  features: {
    council: boolean;
    futures: boolean;
    agenda: boolean;
    executiveContext: boolean;
    operationalContext: boolean;
    commercialContext: boolean;
  };
  /** Intelligence Profile — role outcome packaging */
  intelligenceProfile: IntelligenceProfile;
  briefingMode: string;
  briefLayout: BriefSectionDescriptor[];
  snapshot: ExecutiveSnapshot;
  denied: string[];
};

/**
 * Project a Core ExecutiveSnapshot through tenant runtime controls.
 * Core engines remain unchanged — this only gates presentation.
 */
export function projectExperienceForTenant(
  ctx: TenantContext,
  snapshot: ExecutiveSnapshot,
): RuntimeExperienceView {
  const denied: string[] = [];

  const canBrief = authorize(ctx, "intelligence:brief");
  if (!canBrief.ok) denied.push(canBrief.reason);

  const futuresOk = authorizeFeature(ctx, "futures");
  const agendaOk = authorizeFeature(ctx, "agenda");
  const contextOk = authorizeFeature(ctx, "microsoft365_context");
  const operationalOk = authorizeFeature(ctx, "simpro_context");
  const commercialOk = authorizeFeature(ctx, "salesforce_context");
  const councilOk = authorize(ctx, "council:read");

  if (!futuresOk.ok) denied.push(futuresOk.reason);
  if (!agendaOk.ok) denied.push(agendaOk.reason);
  if (!contextOk.ok) denied.push(contextOk.reason);
  if (!operationalOk.ok) denied.push(operationalOk.reason);
  if (!commercialOk.ok) denied.push(commercialOk.reason);
  if (!councilOk.ok) denied.push(councilOk.reason);

  const projected: ExecutiveSnapshot = {
    ...snapshot,
    executiveCouncil:
      councilOk.ok && canBrief.ok ? snapshot.executiveCouncil : undefined,
    possibleFutures:
      futuresOk.ok && canBrief.ok ? snapshot.possibleFutures : undefined,
    executiveAgenda:
      agendaOk.ok && canBrief.ok ? snapshot.executiveAgenda : undefined,
    executiveContext:
      contextOk.ok && canBrief.ok ? snapshot.executiveContext : undefined,
    operationalContext:
      operationalOk.ok && canBrief.ok
        ? snapshot.operationalContext
        : undefined,
    commercialContext:
      commercialOk.ok && canBrief.ok
        ? snapshot.commercialContext
        : undefined,
  };

  const profileIdRaw =
    typeof ctx.tenant.configuration.intelligenceProfileId === "string"
      ? ctx.tenant.configuration.intelligenceProfileId
      : undefined;

  if (profileIdRaw === "executive_snapshot") {
    throw new Error(
      'The snapshot\'s business profile could not be resolved. "executive_snapshot" is a Snapshot Studio workflow identifier, not an intelligence profile.',
    );
  }

  const profileProjection = projectProfileExperience({
    tenantId: ctx.tenant.id,
    snapshot: projected,
    profileId:
      profileIdRaw === "operations_executive" ||
      profileIdRaw === "commercial_executive"
        ? profileIdRaw
        : undefined,
  });

  const withScenarios = attachScenariosToTodayActions(
    projected,
    profileProjection.profile.id,
    ctx.tenant.id,
  );
  const withMemory = attachMemoryRecallToTodayActions(
    withScenarios,
    ctx.tenant.id,
    profileProjection.profile.id,
  );
  const withStrategy = attachStrategicOutcomesToTodayActions(
    withMemory,
    ctx.tenant.id,
    profileProjection.profile.id,
  );
  const withTrust = attachTrustExplanationsToTodayActions(
    withStrategy,
    ctx.tenant.id,
    profileProjection.profile.id,
  );
  const withAdaptive = attachAdaptiveLearningToTodayActions(
    withTrust,
    ctx.tenant.id,
    profileProjection.profile.id,
    ctx.identity.userId,
  );
  const withCouncilStrategy = attachStrategicOutcomesToCouncil(
    withAdaptive,
    ctx.tenant.id,
  );

  ctx.audit.append({
    tenantId: ctx.tenant.id,
    workspaceId: ctx.workspace.id,
    actorUserId: ctx.identity.userId,
    action: "workspace_access",
    resourceType: "today",
    resourceId: "executive-snapshot",
    summary: "Projected Today experience for tenant",
    metadata: {
      deniedCount: denied.length,
      workspace: ctx.workspace.kind,
      intelligenceProfile: profileProjection.profile.id,
    },
    at: ctx.asOf,
  });

  return {
    tenantId: ctx.tenant.id,
    tenantName: ctx.tenant.branding.displayName,
    workspaceName: ctx.workspace.name,
    workspaceKind: ctx.workspace.kind,
    role: ctx.role,
    region: ctx.tenant.dataResidency,
    features: {
      council: councilOk.ok && canBrief.ok,
      futures: futuresOk.ok && canBrief.ok,
      agenda: agendaOk.ok && canBrief.ok,
      executiveContext: contextOk.ok && canBrief.ok,
      operationalContext: operationalOk.ok && canBrief.ok,
      commercialContext: commercialOk.ok && canBrief.ok,
    },
    intelligenceProfile: profileProjection.profile,
    briefingMode: profileProjection.briefingMode,
    briefLayout: profileProjection.briefLayout,
    snapshot: withCouncilStrategy,
    denied,
  };
}
