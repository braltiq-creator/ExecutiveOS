"use server";

import {
  PRODUCTION_GRAPH_SCOPES,
  buildAuthorizationRequest,
  createPkcePair,
  exchangeAuthorizationCode,
  getM365ConnectionRegistry,
  updateEnabledServices,
  type M365ServiceId,
  type SyncFrequency,
  type EntraAppRegistration,
} from "@/providers/microsoft365";

function appRegistration(): EntraAppRegistration {
  return {
    clientId: process.env.M365_CLIENT_ID ?? "executiveos-m365",
    clientSecretRef: process.env.M365_CLIENT_SECRET_REF ?? "vault:m365-secret",
    redirectUri:
      process.env.M365_REDIRECT_URI ??
      "http://localhost:3000/api/integrations/oauth/callback",
    authority:
      process.env.M365_AUTHORITY ??
      "https://login.microsoftonline.com/organizations",
  };
}

/** Begin Entra authorize URL (admin UI). */
export async function beginMicrosoft365Connect(input?: {
  executiveosTenantId?: string;
  tenantHint?: string;
}): Promise<{ authorizationUrl: string; state: string }> {
  const auth = buildAuthorizationRequest({
    app: appRegistration(),
    tenantHint: input?.tenantHint,
    state: input?.executiveosTenantId ?? "tenant-northline",
  });
  return { authorizationUrl: auth.url, state: auth.state };
}

/**
 * Complete connection using authorization code.
 * Uses mock token transport when live Entra is not configured (dev / Reality Lab).
 */
export async function completeMicrosoft365Connect(input: {
  executiveosTenantId?: string;
  microsoftTenantId: string;
  code: string;
  userId: string;
  asOf?: string;
}): Promise<{ ok: boolean; message: string }> {
  const asOf = input.asOf ?? new Date().toISOString();
  const executiveosTenantId = input.executiveosTenantId ?? "tenant-northline";
  const pkce = createPkcePair();
  try {
    const tokens = await exchangeAuthorizationCode({
      app: appRegistration(),
      code: input.code,
      codeVerifier: pkce.codeVerifier,
      microsoftTenantId: input.microsoftTenantId,
      asOf,
    });
    const registry = getM365ConnectionRegistry();
    registry.connect({
      executiveosTenantId,
      microsoftTenantId: input.microsoftTenantId,
      tokens,
      userId: input.userId,
      scopes: tokens.scopes.length > 0 ? tokens.scopes : [...PRODUCTION_GRAPH_SCOPES],
      asOf,
    });
    const sync = await registry.sync({
      executiveosTenantId,
      mode: "full",
      asOf,
    });
    return {
      ok: sync?.ok ?? true,
      message: sync?.message ?? "Connected",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Connect failed",
    };
  }
}

export async function disconnectMicrosoft365(input?: {
  executiveosTenantId?: string;
}): Promise<{ ok: boolean }> {
  const registry = getM365ConnectionRegistry();
  registry.disconnect(input?.executiveosTenantId ?? "tenant-northline");
  return { ok: true };
}

export async function updateMicrosoft365Services(input: {
  executiveosTenantId?: string;
  services: M365ServiceId[];
  syncFrequency?: SyncFrequency;
}): Promise<{ ok: boolean }> {
  const registry = getM365ConnectionRegistry();
  const tenantId = input.executiveosTenantId ?? "tenant-northline";
  const record = registry.getOrCreate(tenantId);
  record.config = updateEnabledServices(record.config, input.services);
  if (input.syncFrequency) {
    record.config = { ...record.config, syncFrequency: input.syncFrequency };
  }
  return { ok: true };
}

export async function runMicrosoft365Sync(input?: {
  executiveosTenantId?: string;
  mode?: "full" | "incremental" | "delta";
}): Promise<{ ok: boolean; message: string }> {
  const registry = getM365ConnectionRegistry();
  const result = await registry.sync({
    executiveosTenantId: input?.executiveosTenantId ?? "tenant-northline",
    mode: input?.mode ?? "incremental",
  });
  if (!result) {
    return { ok: false, message: "Not connected" };
  }
  return { ok: result.ok, message: result.message };
}
