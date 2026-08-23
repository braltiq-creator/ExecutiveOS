"use server";

import {
  SIMPRO_OAUTH_SCOPES,
  getSimproConnectionRegistry,
} from "@/providers/simpro";

export async function completeSimproConnect(input: {
  executiveosTenantId?: string;
  companyId: string;
  userId: string;
  apiKey?: string;
  asOf?: string;
}): Promise<{ ok: boolean; message: string }> {
  const asOf = input.asOf ?? new Date().toISOString();
  const executiveosTenantId = input.executiveosTenantId ?? "tenant-northline";
  const registry = getSimproConnectionRegistry();
  registry.connect({
    executiveosTenantId,
    companyId: input.companyId,
    credentials: {
      strategy: "api_key",
      apiKeyRef: "vault:simpro-api-key",
      apiKey: input.apiKey ?? "mock-simpro-key",
    },
    userId: input.userId,
    scopes: [...SIMPRO_OAUTH_SCOPES],
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

export async function disconnectSimpro(input?: {
  executiveosTenantId?: string;
}): Promise<{ ok: boolean }> {
  getSimproConnectionRegistry().disconnect(
    input?.executiveosTenantId ?? "tenant-northline",
  );
  return { ok: true };
}

export async function runSimproSync(input?: {
  executiveosTenantId?: string;
  mode?: "full" | "incremental" | "webhook";
}): Promise<{ ok: boolean; message: string }> {
  const result = await getSimproConnectionRegistry().sync({
    executiveosTenantId: input?.executiveosTenantId ?? "tenant-northline",
    mode: input?.mode ?? "incremental",
  });
  if (!result) return { ok: false, message: "Not connected" };
  return { ok: result.ok, message: result.message };
}
