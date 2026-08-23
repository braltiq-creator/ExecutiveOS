/**
 * Simpro authentication — OAuth and API key strategies.
 * Credentials encrypted at rest; never plaintext.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type SimproAuthStrategy = "oauth2" | "api_key";

export type SimproOAuthCredentials = {
  strategy: "oauth2";
  clientId: string;
  clientSecretRef: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string;
  scopes: string[];
};

export type SimproApiKeyCredentials = {
  strategy: "api_key";
  apiKeyRef: string;
  /** Resolved secret — only in memory after vault decrypt */
  apiKey?: string;
};

export type SimproCredentials = SimproOAuthCredentials | SimproApiKeyCredentials;

export type EncryptedSimproCredentials = {
  strategy: SimproAuthStrategy;
  payloadEncrypted: string;
  companyId: string;
  expiresAt: string | null;
};

export type SimproAuthSession = {
  id: string;
  executiveosTenantId: string;
  companyId: string;
  strategy: SimproAuthStrategy;
  status: "active" | "expired" | "revoked";
  scopes: string[];
  acquiredAt: string;
  expiresAt: string | null;
};

export const SIMPRO_OAUTH_SCOPES = [
  "jobs:read",
  "quotes:read",
  "customers:read",
  "sites:read",
  "assets:read",
  "staff:read",
  "projects:read",
  "invoices:read",
  "purchase_orders:read",
  "schedules:read",
] as const;

export type SimproTokenVault = {
  encrypt(credentials: SimproCredentials, companyId: string): EncryptedSimproCredentials;
  decrypt(encrypted: EncryptedSimproCredentials): SimproCredentials;
  rotateKey(newKeyRef: string): void;
  keyRef(): string;
};

function deriveKey(raw: string): Buffer {
  return createHash("sha256").update(raw).digest();
}

export function createSimproTokenVault(
  keyRef = "vault:simpro-default",
): SimproTokenVault {
  let rawKey =
    process.env.SIMPRO_TOKEN_ENCRYPTION_KEY ??
    process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY ??
    "executiveos-dev-simpro-key-not-for-production";
  let currentKeyRef = keyRef;

  const encryptValue = (value: string) => {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", deriveKey(rawKey), iv);
    const encrypted = Buffer.concat([
      cipher.update(value, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return [
      iv.toString("base64url"),
      tag.toString("base64url"),
      encrypted.toString("base64url"),
    ].join(".");
  };

  const decryptValue = (payload: string) => {
    const [ivPart, tagPart, dataPart] = payload.split(".");
    if (!ivPart || !tagPart || !dataPart) {
      throw new Error("Invalid encrypted Simpro credential payload");
    }
    const decipher = createDecipheriv(
      "aes-256-gcm",
      deriveKey(rawKey),
      Buffer.from(ivPart, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(dataPart, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  };

  return {
    encrypt(credentials, companyId) {
      return {
        strategy: credentials.strategy,
        payloadEncrypted: encryptValue(JSON.stringify(credentials)),
        companyId,
        expiresAt:
          credentials.strategy === "oauth2" ? credentials.expiresAt : null,
      };
    },
    decrypt(encrypted) {
      return JSON.parse(decryptValue(encrypted.payloadEncrypted)) as SimproCredentials;
    },
    rotateKey(newKeyRef) {
      currentKeyRef = newKeyRef;
      rawKey = `${rawKey}:${newKeyRef}`;
    },
    keyRef: () => currentKeyRef,
  };
}

export function validateSimproCredentials(
  credentials: SimproCredentials,
  asOf = new Date().toISOString(),
): { ok: boolean; reason: string } {
  if (credentials.strategy === "api_key") {
    if (!credentials.apiKey && !credentials.apiKeyRef) {
      return { ok: false, reason: "Missing API key" };
    }
    return { ok: true, reason: "API key present" };
  }
  if (!credentials.accessToken) {
    return { ok: false, reason: "Missing access token" };
  }
  if (new Date(credentials.expiresAt).getTime() <= new Date(asOf).getTime()) {
    return { ok: false, reason: "Access token expired" };
  }
  return { ok: true, reason: "OAuth token valid" };
}

export function createSimproAuthSession(input: {
  executiveosTenantId: string;
  companyId: string;
  strategy: SimproAuthStrategy;
  scopes?: string[];
  expiresAt?: string | null;
  asOf?: string;
}): SimproAuthSession {
  const asOf = input.asOf ?? new Date().toISOString();
  return {
    id: `simpro-session-${input.executiveosTenantId}-${input.companyId}`,
    executiveosTenantId: input.executiveosTenantId,
    companyId: input.companyId,
    strategy: input.strategy,
    status: "active",
    scopes: input.scopes ?? [...SIMPRO_OAUTH_SCOPES],
    acquiredAt: asOf,
    expiresAt: input.expiresAt ?? null,
  };
}

export function logoutSimproSession(session: SimproAuthSession): SimproAuthSession {
  return { ...session, status: "revoked" };
}

/** Mock OAuth refresh for tests / offline. */
export async function refreshSimproOAuth(input: {
  credentials: SimproOAuthCredentials;
  asOf?: string;
}): Promise<SimproOAuthCredentials> {
  if (input.credentials.refreshToken === "revoked") {
    throw new Error("invalid_grant: authentication expired or consent revoked");
  }
  const asOf = input.asOf ?? new Date().toISOString();
  const base = new Date(asOf).getTime();
  return {
    ...input.credentials,
    accessToken: `access_refreshed_${base}`,
    expiresAt: new Date(base + 3600_000).toISOString(),
  };
}
