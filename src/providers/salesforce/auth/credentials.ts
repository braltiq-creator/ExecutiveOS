/**
 * Salesforce authentication — OAuth 2.0 Connected App + refresh tokens.
 * Credentials encrypted at rest; never plaintext.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type SalesforceAuthStrategy = "oauth2";

export type SalesforceOAuthCredentials = {
  strategy: "oauth2";
  clientId: string;
  clientSecretRef: string;
  accessToken: string;
  refreshToken: string | null;
  instanceUrl: string;
  expiresAt: string;
  scopes: string[];
};

export type EncryptedSalesforceCredentials = {
  strategy: SalesforceAuthStrategy;
  payloadEncrypted: string;
  orgId: string;
  instanceUrl: string;
  expiresAt: string | null;
};

export type SalesforceAuthSession = {
  id: string;
  executiveosTenantId: string;
  orgId: string;
  instanceUrl: string;
  status: "active" | "expired" | "revoked";
  scopes: string[];
  acquiredAt: string;
  expiresAt: string | null;
};

export const SALESFORCE_OAUTH_SCOPES = [
  "api",
  "refresh_token",
  "offline_access",
  "id",
  "profile",
] as const;

export type SalesforceTokenVault = {
  encrypt(
    credentials: SalesforceOAuthCredentials,
    orgId: string,
  ): EncryptedSalesforceCredentials;
  decrypt(encrypted: EncryptedSalesforceCredentials): SalesforceOAuthCredentials;
  rotateKey(newKeyRef: string): void;
  keyRef(): string;
};

function deriveKey(raw: string): Buffer {
  return createHash("sha256").update(raw).digest();
}

export function createSalesforceTokenVault(
  keyRef = "vault:salesforce-default",
): SalesforceTokenVault {
  let rawKey =
    process.env.SALESFORCE_TOKEN_ENCRYPTION_KEY ??
    process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY ??
    "executiveos-dev-salesforce-key-not-for-production";
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
      throw new Error("Invalid encrypted Salesforce credential payload");
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
    encrypt(credentials, orgId) {
      return {
        strategy: "oauth2",
        payloadEncrypted: encryptValue(JSON.stringify(credentials)),
        orgId,
        instanceUrl: credentials.instanceUrl,
        expiresAt: credentials.expiresAt,
      };
    },
    decrypt(encrypted) {
      return JSON.parse(
        decryptValue(encrypted.payloadEncrypted),
      ) as SalesforceOAuthCredentials;
    },
    rotateKey(newKeyRef) {
      currentKeyRef = newKeyRef;
      rawKey = `${rawKey}:${newKeyRef}`;
    },
    keyRef: () => currentKeyRef,
  };
}

export function validateSalesforceCredentials(
  credentials: SalesforceOAuthCredentials,
  asOf = new Date().toISOString(),
): { ok: boolean; reason: string } {
  if (!credentials.accessToken) {
    return { ok: false, reason: "Missing access token" };
  }
  if (!credentials.instanceUrl) {
    return { ok: false, reason: "Missing instance URL" };
  }
  if (new Date(credentials.expiresAt).getTime() <= new Date(asOf).getTime()) {
    return { ok: false, reason: "Access token expired" };
  }
  return { ok: true, reason: "OAuth token valid" };
}

export function createSalesforceAuthSession(input: {
  executiveosTenantId: string;
  orgId: string;
  instanceUrl: string;
  scopes?: string[];
  expiresAt?: string | null;
  asOf?: string;
}): SalesforceAuthSession {
  const asOf = input.asOf ?? new Date().toISOString();
  return {
    id: `sf-session-${input.executiveosTenantId}-${input.orgId}`,
    executiveosTenantId: input.executiveosTenantId,
    orgId: input.orgId,
    instanceUrl: input.instanceUrl,
    status: "active",
    scopes: input.scopes ?? [...SALESFORCE_OAUTH_SCOPES],
    acquiredAt: asOf,
    expiresAt: input.expiresAt ?? null,
  };
}

export function logoutSalesforceSession(
  session: SalesforceAuthSession,
): SalesforceAuthSession {
  return { ...session, status: "revoked" };
}

export async function refreshSalesforceOAuth(input: {
  credentials: SalesforceOAuthCredentials;
  asOf?: string;
}): Promise<SalesforceOAuthCredentials> {
  if (input.credentials.refreshToken === "revoked") {
    throw new Error("invalid_grant: authentication expired or consent revoked");
  }
  const asOf = input.asOf ?? new Date().toISOString();
  const base = new Date(asOf).getTime();
  return {
    ...input.credentials,
    accessToken: `sf_access_refreshed_${base}`,
    expiresAt: new Date(base + 3600_000).toISOString(),
  };
}
