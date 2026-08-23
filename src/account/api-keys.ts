import {
  getApiKeys,
  nextKeyId,
  setApiKeys,
} from "@/account/store";
import type { AccountApiKey } from "@/account/types";
import type { ProvisionedApiKey } from "@/provisioning/types";

export function listOrganisationApiKeys(
  organisationId: string,
): AccountApiKey[] {
  return getApiKeys(organisationId);
}

export function importProvisionedApiKeys(
  organisationId: string,
  keys: ProvisionedApiKey[],
): AccountApiKey[] {
  const existing = getApiKeys(organisationId);
  if (existing.length > 0) return existing;
  const imported = keys.map((key) => ({
    id: nextKeyId(),
    organisationId,
    label: key.label,
    keyId: key.keyId,
    secretPreview: key.secretPreview,
    createdAt: key.createdAt,
    lastUsedAt: null,
    status: "active" as const,
  }));
  return setApiKeys(organisationId, imported);
}

export function createApiKey(input: {
  organisationId: string;
  label: string;
  asOf?: string;
}): { key: AccountApiKey; secret: string } {
  const asOf = input.asOf ?? new Date().toISOString();
  const secret = `sk_live_${Math.random().toString(36).slice(2, 14)}`;
  const key: AccountApiKey = {
    id: nextKeyId(),
    organisationId: input.organisationId,
    label: input.label,
    keyId: `eos_${input.organisationId.replace("org-", "").slice(0, 12)}_live`,
    secretPreview: `${secret.slice(0, 10)}…${secret.slice(-4)}`,
    createdAt: asOf,
    lastUsedAt: null,
    status: "active",
  };
  setApiKeys(input.organisationId, [
    ...getApiKeys(input.organisationId),
    key,
  ]);
  return { key, secret };
}

export function revokeApiKey(
  organisationId: string,
  keyId: string,
): AccountApiKey | undefined {
  const next = getApiKeys(organisationId).map((k) =>
    k.id === keyId ? { ...k, status: "revoked" as const } : k,
  );
  setApiKeys(organisationId, next);
  return next.find((k) => k.id === keyId);
}
