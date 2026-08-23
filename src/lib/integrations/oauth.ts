import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { DecryptedOAuthTokens } from "@/lib/integrations/types";
import { IntegrationError } from "@/lib/integrations/types";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

export type SecretsProvider = {
  getEncryptionKey: () => string;
  getOAuthClientId: (providerId: string) => string | null;
  getOAuthClientSecret: (providerId: string) => string | null;
};

function defaultSecretsProvider(): SecretsProvider {
  return {
    getEncryptionKey: () =>
      process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      "",
    getOAuthClientId: (providerId) =>
      process.env[`${providerId.toUpperCase()}_CLIENT_ID`] ?? null,
    getOAuthClientSecret: (providerId) =>
      process.env[`${providerId.toUpperCase()}_CLIENT_SECRET`] ?? null,
  };
}

let secretsProvider: SecretsProvider = defaultSecretsProvider();

export function setSecretsProvider(provider: SecretsProvider): void {
  secretsProvider = provider;
}

export function getSecretsProvider(): SecretsProvider {
  return secretsProvider;
}

function deriveKey(rawKey: string): Buffer {
  if (!rawKey) {
    throw new IntegrationError(
      "Integration token encryption is not configured. Set INTEGRATION_TOKEN_ENCRYPTION_KEY.",
      "ENCRYPTION_NOT_CONFIGURED",
    );
  }

  return createHash("sha256").update(rawKey).digest();
}

export function encryptSecret(value: string): string {
  const key = deriveKey(secretsProvider.getEncryptionKey());
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptSecret(payload: string): string {
  const key = deriveKey(secretsProvider.getEncryptionKey());
  const [ivPart, authTagPart, encryptedPart] = payload.split(".");

  if (!ivPart || !authTagPart || !encryptedPart) {
    throw new IntegrationError("Invalid encrypted token payload.", "DECRYPTION_FAILED");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTagPart, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function encryptOAuthTokens(tokens: DecryptedOAuthTokens): {
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string | null;
} {
  return {
    accessTokenEncrypted: encryptSecret(tokens.accessToken),
    refreshTokenEncrypted: tokens.refreshToken
      ? encryptSecret(tokens.refreshToken)
      : null,
  };
}

export function decryptOAuthTokens(record: {
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_type: string;
  expires_at: string | null;
  scopes: string[];
}): DecryptedOAuthTokens {
  return {
    accessToken: decryptSecret(record.access_token_encrypted),
    refreshToken: record.refresh_token_encrypted
      ? decryptSecret(record.refresh_token_encrypted)
      : null,
    tokenType: record.token_type,
    expiresAt: record.expires_at,
    scopes: record.scopes,
  };
}

export function getOAuthRedirectUri(): string {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");

  return `${baseUrl}/api/integrations/oauth/callback`;
}

export function buildOAuthAuthorizationUrl(input: {
  providerId: string;
  authorizationUrl: string;
  scopes: string[];
  state: string;
}): string {
  const clientId = secretsProvider.getOAuthClientId(input.providerId);

  if (!clientId) {
    throw new IntegrationError(
      `OAuth is not configured for ${input.providerId}. Set ${input.providerId.toUpperCase()}_CLIENT_ID.`,
      "OAUTH_NOT_CONFIGURED",
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getOAuthRedirectUri(),
    response_type: "code",
    scope: input.scopes.join(" "),
    state: input.state,
    access_type: "offline",
    prompt: "consent",
  });

  return `${input.authorizationUrl}?${params.toString()}`;
}

export async function exchangeOAuthCode(input: {
  providerId: string;
  tokenUrl: string;
  code: string;
}): Promise<DecryptedOAuthTokens> {
  const clientId = secretsProvider.getOAuthClientId(input.providerId);
  const clientSecret = secretsProvider.getOAuthClientSecret(input.providerId);

  if (!clientId || !clientSecret) {
    throw new IntegrationError(
      `OAuth credentials are not configured for ${input.providerId}.`,
      "OAUTH_NOT_CONFIGURED",
    );
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: getOAuthRedirectUri(),
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(input.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new IntegrationError(
      "Unable to exchange OAuth authorization code.",
      "OAUTH_EXCHANGE_FAILED",
    );
  }

  const payload = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    scope?: string;
  };

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    tokenType: payload.token_type ?? "Bearer",
    expiresAt: payload.expires_in
      ? new Date(Date.now() + payload.expires_in * 1000).toISOString()
      : null,
    scopes: payload.scope ? payload.scope.split(" ") : [],
  };
}

export async function refreshOAuthTokens(input: {
  providerId: string;
  tokenUrl: string;
  refreshToken: string;
}): Promise<DecryptedOAuthTokens> {
  const clientId = secretsProvider.getOAuthClientId(input.providerId);
  const clientSecret = secretsProvider.getOAuthClientSecret(input.providerId);

  if (!clientId || !clientSecret) {
    throw new IntegrationError(
      `OAuth credentials are not configured for ${input.providerId}.`,
      "OAUTH_NOT_CONFIGURED",
    );
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: input.refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(input.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new IntegrationError(
      "Unable to refresh OAuth tokens.",
      "OAUTH_REFRESH_FAILED",
    );
  }

  const payload = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    scope?: string;
  };

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? input.refreshToken,
    tokenType: payload.token_type ?? "Bearer",
    expiresAt: payload.expires_in
      ? new Date(Date.now() + payload.expires_in * 1000).toISOString()
      : null,
    scopes: payload.scope ? payload.scope.split(" ") : [],
  };
}

export function createOAuthStateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isTokenExpired(expiresAt: string | null, bufferMs = 60_000): boolean {
  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() - bufferMs <= Date.now();
}
