"use server";

import {
  SALESFORCE_OAUTH_SCOPES,
  getSalesforceConnectionRegistry,
} from "@/providers/salesforce";

export async function completeSalesforceConnect(input: {
  executiveosTenantId?: string;
  orgId: string;
  instanceUrl?: string;
  userId: string;
  asOf?: string;
}): Promise<{ ok: boolean; message: string }> {
  const asOf = input.asOf ?? new Date().toISOString();
  const executiveosTenantId = input.executiveosTenantId ?? "tenant-northline";
  const registry = getSalesforceConnectionRegistry();
  registry.connect({
    executiveosTenantId,
    orgId: input.orgId,
    credentials: {
      strategy: "oauth2",
      clientId: "connected-app-client",
      clientSecretRef: "vault:sf-client-secret",
      accessToken: "sf_access_mock",
      refreshToken: "sf_refresh_mock",
      instanceUrl: input.instanceUrl ?? "https://northline.my.salesforce.com",
      expiresAt: new Date(new Date(asOf).getTime() + 3600_000).toISOString(),
      scopes: [...SALESFORCE_OAUTH_SCOPES],
    },
    userId: input.userId,
    scopes: [...SALESFORCE_OAUTH_SCOPES],
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
}

export async function disconnectSalesforce(input?: {
  executiveosTenantId?: string;
}): Promise<{ ok: boolean }> {
  getSalesforceConnectionRegistry().disconnect(
    input?.executiveosTenantId ?? "tenant-northline",
  );
  return { ok: true };
}

export async function runSalesforceSync(input?: {
  executiveosTenantId?: string;
  mode?: "full" | "incremental" | "cdc" | "webhook" | "replay";
}): Promise<{ ok: boolean; message: string }> {
  const result = await getSalesforceConnectionRegistry().sync({
    executiveosTenantId: input?.executiveosTenantId ?? "tenant-northline",
    mode: input?.mode ?? "incremental",
  });
  if (!result) return { ok: false, message: "Not connected" };
  return { ok: result.ok, message: result.message };
}

export async function replaySalesforceCdc(input?: {
  executiveosTenantId?: string;
}): Promise<{ ok: boolean; message: string; events: number }> {
  const registry = getSalesforceConnectionRegistry();
  const tenant = input?.executiveosTenantId ?? "tenant-northline";
  const events = registry.engine().replay(
    `${tenant}:${registry.get(tenant)?.config.orgId ?? "pending"}`,
  );
  return {
    ok: true,
    message: `Replayed ${events.length} BusinessEvents from journal`,
    events: events.length,
  };
}
