import {
  deleteOAuthTokens,
  insertOAuthState,
  consumeOAuthState,
  updateOrganizationIntegration,
  upsertOAuthTokens,
  upsertOrganizationIntegration,
} from "@/lib/integrations/mutations";
import {
  createOAuthStateToken,
  buildOAuthAuthorizationUrl,
  decryptOAuthTokens,
  encryptOAuthTokens,
  exchangeOAuthCode,
  isTokenExpired,
  refreshOAuthTokens,
} from "@/lib/integrations/oauth";
import {
  getIntegrationProvider,
  getOAuthConfigForProvider,
} from "@/lib/integrations/registry";
import { buildProviderRuntimeContext } from "@/lib/integrations/runtime";
import {
  fetchIntegrationProviderById,
  fetchIntegrationProviders,
  fetchOAuthTokens,
  fetchOrganizationIntegrationById,
  fetchOrganizationIntegrationByProvider,
  fetchOrganizationIntegrations,
  fetchRecentSyncJobs,
} from "@/lib/integrations/queries";
import {
  logIntegrationConnected,
  logIntegrationDisconnected,
  logIntegrationError,
  logTokenRefreshed,
} from "@/lib/integrations/events";
import { calculateNextSyncAt, runIntegrationSync } from "@/lib/integrations/sync";
import type {
  IntegrationView,
  IntegrationsPageData,
  OrganizationIntegrationRecord,
  ProviderId,
} from "@/lib/integrations/types";
import {
  IntegrationError,
  buildHealthSnapshot,
} from "@/lib/integrations/types";
import {
  validateConnectInput,
  validateDisconnectInput,
  validateSyncInput,
} from "@/lib/integrations/validation";
import { requireFeatureEntitlements } from "@/lib/features/FeatureProvider";
import { hasFeature } from "@/lib/features/types";
import { fetchActiveMembership } from "@/lib/organizations/queries";
import { canUpdateOrganizationSettings } from "@/lib/organizations/permissions";
import type { OrganizationMembership } from "@/lib/organizations/types";
import { OrganizationError } from "@/lib/organizations/types";

const OAUTH_STATE_TTL_MINUTES = 15;

async function requireIntegrationAdmin(userId: string): Promise<OrganizationMembership> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    throw new OrganizationError("Organization membership required.", "NOT_MEMBER");
  }

  if (!canUpdateOrganizationSettings(membership.member.role)) {
    throw new IntegrationError(
      "Only organization owners can manage integrations.",
      "FORBIDDEN",
    );
  }

  return membership;
}

async function assertIntegrationsFeature(userId: string): Promise<OrganizationMembership> {
  const membership = await requireIntegrationAdmin(userId);
  const entitlements = await requireFeatureEntitlements(userId);

  if (!hasFeature(entitlements, "future_integrations")) {
    throw new IntegrationError(
      "Integrations require an Enterprise plan. Upgrade to connect external systems.",
      "FEATURE_DISABLED",
    );
  }

  return membership;
}

export async function getIntegrationsPageData(
  userId: string,
): Promise<IntegrationsPageData> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    throw new OrganizationError("Organization membership required.", "NOT_MEMBER");
  }

  const entitlements = await requireFeatureEntitlements(userId);
  const [providers, integrations] = await Promise.all([
    fetchIntegrationProviders(),
    fetchOrganizationIntegrations(membership.organization.id),
  ]);

  const integrationMap = new Map(
    integrations.map((integration) => [integration.provider_id, integration]),
  );

  const views = await Promise.all(
    providers.map(async (provider) => {
      const integration = integrationMap.get(provider.id) ?? null;
      const recentSyncJobs = integration
        ? await fetchRecentSyncJobs(integration.id, 5)
        : [];

      return {
        provider,
        integration,
        health: buildHealthSnapshot(integration),
        recentSyncJobs,
      } satisfies IntegrationView;
    }),
  );

  return {
    integrations: views,
    canManage: canUpdateOrganizationSettings(membership.member.role),
    hasIntegrationsFeature: hasFeature(entitlements, "future_integrations"),
  };
}

export async function startIntegrationConnect(
  userId: string,
  input: { providerId: string },
): Promise<{ authorizationUrl: string }> {
  const { providerId } = validateConnectInput(input);
  const membership = await assertIntegrationsFeature(userId);
  const provider = await fetchIntegrationProviderById(providerId);

  if (!provider) {
    throw new IntegrationError("Integration provider not found.", "PROVIDER_NOT_FOUND");
  }

  const integrationId = await upsertOrganizationIntegration({
    organizationId: membership.organization.id,
    providerId,
    connectedBy: userId,
    status: "disconnected",
    healthStatus: "disconnected",
  });

  const oauthConfig = getOAuthConfigForProvider(providerId);
  const stateToken = createOAuthStateToken();
  const expiresAt = new Date(
    Date.now() + OAUTH_STATE_TTL_MINUTES * 60 * 1000,
  ).toISOString();

  await insertOAuthState({
    stateToken,
    organizationId: membership.organization.id,
    providerId,
    userId,
    expiresAt,
  });

  try {
    const authorizationUrl = buildOAuthAuthorizationUrl({
      providerId,
      authorizationUrl: oauthConfig.authorizationUrl,
      scopes: oauthConfig.scopes,
      state: stateToken,
    });

    return { authorizationUrl };
  } catch (error) {
    await logIntegrationError(
      integrationId,
      error instanceof Error ? error.message : "OAuth configuration error.",
      { providerId },
    );
    throw error;
  }
}

export async function completeIntegrationOAuth(input: {
  code: string;
  state: string;
}): Promise<{ redirectPath: string }> {
  const oauthState = await consumeOAuthState(input.state);

  if (!oauthState) {
    throw new IntegrationError("OAuth state is invalid or expired.", "INVALID_STATE");
  }

  const providerId = oauthState.provider_id;
  const oauthConfig = getOAuthConfigForProvider(providerId);
  const tokens = await exchangeOAuthCode({
    providerId,
    tokenUrl: oauthConfig.tokenUrl,
    code: input.code,
  });

  const integration = await fetchOrganizationIntegrationByProvider(
    oauthState.organization_id,
    providerId,
  );

  if (!integration) {
    throw new IntegrationError("Integration record not found.", "NOT_FOUND");
  }

  const encrypted = encryptOAuthTokens(tokens);

  await upsertOAuthTokens({
    integrationId: integration.id,
    accessTokenEncrypted: encrypted.accessTokenEncrypted,
    refreshTokenEncrypted: encrypted.refreshTokenEncrypted,
    tokenType: tokens.tokenType,
    expiresAt: tokens.expiresAt,
    scopes: tokens.scopes,
  });

  await updateOrganizationIntegration(integration.id, {
    status: "connected",
    health_status: "connected",
    health_message: null,
    connected_by: oauthState.user_id,
    last_error_at: null,
    last_error_message: null,
    next_sync_at: calculateNextSyncAt(),
  });

  await logIntegrationConnected(integration.id, providerId);

  try {
    await runIntegrationSync({
      integrationId: integration.id,
      triggerType: "manual",
    });
  } catch {
    // Initial sync failure should not block OAuth completion.
  }

  return { redirectPath: oauthState.redirect_path };
}

export async function disconnectIntegration(
  userId: string,
  input: { integrationId: string },
): Promise<void> {
  const { integrationId } = validateDisconnectInput(input);
  await assertIntegrationsFeature(userId);

  const integration = await fetchOrganizationIntegrationById(integrationId);

  if (!integration) {
    throw new IntegrationError("Integration not found.", "NOT_FOUND");
  }

  const provider = getIntegrationProvider(integration.provider_id);
  const ctx = await buildProviderRuntimeContext(integration);
  await provider.disconnect(ctx);
  await deleteOAuthTokens(integration.id);

  await updateOrganizationIntegration(integration.id, {
    status: "disconnected",
    health_status: "disconnected",
    health_message: null,
    sync_cursor: {},
    last_sync_at: null,
    next_sync_at: null,
    last_error_at: null,
    last_error_message: null,
  });

  await logIntegrationDisconnected(integration.id, integration.provider_id);
}

export async function refreshIntegrationTokens(
  userId: string,
  integrationId: string,
): Promise<void> {
  await assertIntegrationsFeature(userId);

  const integration = await fetchOrganizationIntegrationById(integrationId);

  if (!integration) {
    throw new IntegrationError("Integration not found.", "NOT_FOUND");
  }

  const ctx = await buildProviderRuntimeContext(integration);

  if (!ctx.tokens?.refreshToken) {
    throw new IntegrationError("No refresh token available.", "NO_REFRESH_TOKEN");
  }

  const oauthConfig = getOAuthConfigForProvider(integration.provider_id);
  const refreshed = await refreshOAuthTokens({
    providerId: integration.provider_id,
    tokenUrl: oauthConfig.tokenUrl,
    refreshToken: ctx.tokens.refreshToken,
  });
  const encrypted = encryptOAuthTokens(refreshed);

  await upsertOAuthTokens({
    integrationId: integration.id,
    accessTokenEncrypted: encrypted.accessTokenEncrypted,
    refreshTokenEncrypted: encrypted.refreshTokenEncrypted,
    tokenType: refreshed.tokenType,
    expiresAt: refreshed.expiresAt,
    scopes: refreshed.scopes,
  });

  await logTokenRefreshed(integration.id, integration.provider_id);
}

export async function ensureValidIntegrationTokens(
  integration: OrganizationIntegrationRecord,
): Promise<void> {
  const tokenRecord = await fetchOAuthTokens(integration.id);

  if (!tokenRecord) {
    return;
  }

  const tokens = decryptOAuthTokens(tokenRecord);

  if (!isTokenExpired(tokens.expiresAt) || !tokens.refreshToken) {
    return;
  }

  const oauthConfig = getOAuthConfigForProvider(integration.provider_id);
  const refreshed = await refreshOAuthTokens({
    providerId: integration.provider_id,
    tokenUrl: oauthConfig.tokenUrl,
    refreshToken: tokens.refreshToken,
  });
  const encrypted = encryptOAuthTokens(refreshed);

  await upsertOAuthTokens({
    integrationId: integration.id,
    accessTokenEncrypted: encrypted.accessTokenEncrypted,
    refreshTokenEncrypted: encrypted.refreshTokenEncrypted,
    tokenType: refreshed.tokenType,
    expiresAt: refreshed.expiresAt,
    scopes: refreshed.scopes,
  });

  await logTokenRefreshed(integration.id, integration.provider_id);
}

export async function syncIntegration(
  userId: string,
  input: { integrationId: string; triggerType?: string },
): Promise<void> {
  const validated = validateSyncInput(input);
  await assertIntegrationsFeature(userId);

  const integration = await fetchOrganizationIntegrationById(validated.integrationId);

  if (!integration) {
    throw new IntegrationError("Integration not found.", "NOT_FOUND");
  }

  await ensureValidIntegrationTokens(integration);

  await runIntegrationSync({
    integrationId: integration.id,
    triggerType: validated.triggerType,
  });
}

export async function getIntegrationHealth(
  userId: string,
  integrationId: string,
): Promise<IntegrationView["health"]> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    throw new OrganizationError("Organization membership required.", "NOT_MEMBER");
  }

  const integration = await fetchOrganizationIntegrationById(integrationId);

  if (!integration) {
    throw new IntegrationError("Integration not found.", "NOT_FOUND");
  }

  await ensureValidIntegrationTokens(integration);
  const ctx = await buildProviderRuntimeContext(integration);
  const provider = getIntegrationProvider(integration.provider_id);

  return provider.health(ctx);
}

export async function listConnectedIntegrations(
  organizationId: string,
): Promise<OrganizationIntegrationRecord[]> {
  const integrations = await fetchOrganizationIntegrations(organizationId);
  return integrations.filter((integration) => integration.status === "connected");
}
