/**
 * Microsoft Entra ID — production OAuth 2.0 Authorization Code + PKCE.
 * Tokens are stored as encrypted refs — never plaintext.
 */

import { createHash, randomBytes } from "node:crypto";

export const ENTRA_AUTHORITY_COMMON =
  "https://login.microsoftonline.com/common";
export const ENTRA_AUTHORITY_ORGANIZATIONS =
  "https://login.microsoftonline.com/organizations";

export const PRODUCTION_GRAPH_SCOPES = [
  "openid",
  "profile",
  "offline_access",
  "User.Read",
  "Calendars.Read",
  "Mail.Read",
  "People.Read",
  "Files.Read.All",
  "Sites.Read.All",
  "Tasks.Read",
  "Presence.Read",
  "Chat.Read",
] as const;

export type PkcePair = {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: "S256";
};

export type EntraAppRegistration = {
  clientId: string;
  /** Secret held in Key Vault / env — never logged */
  clientSecretRef: string;
  redirectUri: string;
  /** multi-tenant uses /common or /organizations */
  authority: string;
};

export type AuthorizationRequest = {
  url: string;
  state: string;
  nonce: string;
  pkce: PkcePair;
  scopes: string[];
  tenantHint?: string;
};

export type TokenSet = {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  tokenType: string;
  expiresAt: string;
  scopes: string[];
  tenantId: string;
};

export type EncryptedTokenSet = {
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string | null;
  idTokenEncrypted: string | null;
  tokenType: string;
  expiresAt: string;
  scopes: string[];
  tenantId: string;
};

export type AuthSession = {
  id: string;
  executiveosTenantId: string;
  microsoftTenantId: string;
  userPrincipalName: string;
  status: "active" | "expired" | "revoked";
  consentedScopes: string[];
  acquiredAt: string;
  expiresAt: string;
};

function base64Url(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createPkcePair(): PkcePair {
  const codeVerifier = base64Url(randomBytes(32));
  const codeChallenge = base64Url(
    createHash("sha256").update(codeVerifier).digest(),
  );
  return { codeVerifier, codeChallenge, codeChallengeMethod: "S256" };
}

export function buildAuthorizationRequest(input: {
  app: EntraAppRegistration;
  scopes?: string[];
  tenantHint?: string;
  loginHint?: string;
  state?: string;
}): AuthorizationRequest {
  const pkce = createPkcePair();
  const state = input.state ?? base64Url(randomBytes(16));
  const nonce = base64Url(randomBytes(16));
  const scopes = input.scopes ?? [...PRODUCTION_GRAPH_SCOPES];
  const authority = input.tenantHint
    ? `https://login.microsoftonline.com/${input.tenantHint}`
    : input.app.authority;

  const params = new URLSearchParams({
    client_id: input.app.clientId,
    response_type: "code",
    redirect_uri: input.app.redirectUri,
    response_mode: "query",
    scope: scopes.join(" "),
    state,
    nonce,
    code_challenge: pkce.codeChallenge,
    code_challenge_method: pkce.codeChallengeMethod,
    prompt: "consent",
  });
  if (input.loginHint) params.set("login_hint", input.loginHint);

  return {
    url: `${authority}/oauth2/v2.0/authorize?${params.toString()}`,
    state,
    nonce,
    pkce,
    scopes,
    tenantHint: input.tenantHint,
  };
}

export type TokenEndpointTransport = {
  exchange(input: {
    tokenUrl: string;
    body: Record<string, string>;
  }): Promise<Record<string, unknown>>;
};

/** Deterministic mock token endpoint for tests / offline. */
export function createMockTokenTransport(): TokenEndpointTransport {
  return {
    async exchange({ body }) {
      const now = Date.now();
      if (body.grant_type === "refresh_token" && body.refresh_token === "revoked") {
        throw new Error("invalid_grant: consent revoked");
      }
      return {
        access_token: `access_${body.code ?? body.refresh_token ?? "mock"}`,
        refresh_token: body.refresh_token ?? `refresh_${body.code ?? "mock"}`,
        id_token: "id_mock",
        token_type: "Bearer",
        expires_in: 3600,
        scope: body.scope ?? PRODUCTION_GRAPH_SCOPES.join(" "),
        ext_expires_in: 3600,
      };
    },
  };
}

export async function exchangeAuthorizationCode(input: {
  app: EntraAppRegistration;
  code: string;
  codeVerifier: string;
  scopes?: string[];
  microsoftTenantId?: string;
  transport?: TokenEndpointTransport;
  asOf?: string;
}): Promise<TokenSet> {
  const authority = input.microsoftTenantId
    ? `https://login.microsoftonline.com/${input.microsoftTenantId}`
    : input.app.authority;
  const transport = input.transport ?? createMockTokenTransport();
  const raw = await transport.exchange({
    tokenUrl: `${authority}/oauth2/v2.0/token`,
    body: {
      client_id: input.app.clientId,
      client_secret: input.app.clientSecretRef,
      grant_type: "authorization_code",
      code: input.code,
      redirect_uri: input.app.redirectUri,
      code_verifier: input.codeVerifier,
      scope: (input.scopes ?? [...PRODUCTION_GRAPH_SCOPES]).join(" "),
    },
  });
  return toTokenSet(raw, input.microsoftTenantId ?? "common", input.asOf);
}

export async function refreshAccessToken(input: {
  app: EntraAppRegistration;
  refreshToken: string;
  microsoftTenantId: string;
  transport?: TokenEndpointTransport;
  asOf?: string;
}): Promise<TokenSet> {
  const authority = `https://login.microsoftonline.com/${input.microsoftTenantId}`;
  const transport = input.transport ?? createMockTokenTransport();
  const raw = await transport.exchange({
    tokenUrl: `${authority}/oauth2/v2.0/token`,
    body: {
      client_id: input.app.clientId,
      client_secret: input.app.clientSecretRef,
      grant_type: "refresh_token",
      refresh_token: input.refreshToken,
      scope: PRODUCTION_GRAPH_SCOPES.join(" "),
    },
  });
  return toTokenSet(raw, input.microsoftTenantId, input.asOf);
}

function toTokenSet(
  raw: Record<string, unknown>,
  tenantId: string,
  asOf?: string,
): TokenSet {
  const base = asOf ? new Date(asOf).getTime() : Date.now();
  const expiresIn = Number(raw.expires_in ?? 3600);
  return {
    accessToken: String(raw.access_token ?? ""),
    refreshToken: raw.refresh_token ? String(raw.refresh_token) : null,
    idToken: raw.id_token ? String(raw.id_token) : null,
    tokenType: String(raw.token_type ?? "Bearer"),
    expiresAt: new Date(base + expiresIn * 1000).toISOString(),
    scopes: String(raw.scope ?? "")
      .split(" ")
      .filter(Boolean),
    tenantId,
  };
}

export function validateAccessToken(input: {
  token: TokenSet;
  asOf?: string;
}): { ok: boolean; reason: string } {
  if (!input.token.accessToken) {
    return { ok: false, reason: "Missing access token" };
  }
  const asOf = input.asOf ?? new Date().toISOString();
  if (new Date(input.token.expiresAt).getTime() <= new Date(asOf).getTime()) {
    return { ok: false, reason: "Access token expired" };
  }
  return { ok: true, reason: "Token valid" };
}

export function discoverTenantFromIss(issuer: string): string | null {
  const match = issuer.match(
    /https:\/\/login\.microsoftonline\.com\/([0-9a-fA-F-]{36}|common|organizations)/,
  );
  return match?.[1] ?? null;
}

export function createAuthSession(input: {
  executiveosTenantId: string;
  microsoftTenantId: string;
  userPrincipalName: string;
  scopes: string[];
  expiresAt: string;
  asOf?: string;
}): AuthSession {
  const asOf = input.asOf ?? new Date().toISOString();
  return {
    id: `m365-session-${input.executiveosTenantId}-${input.microsoftTenantId}`,
    executiveosTenantId: input.executiveosTenantId,
    microsoftTenantId: input.microsoftTenantId,
    userPrincipalName: input.userPrincipalName,
    status: "active",
    consentedScopes: input.scopes,
    acquiredAt: asOf,
    expiresAt: input.expiresAt,
  };
}

export function logoutSession(session: AuthSession): AuthSession {
  return { ...session, status: "revoked" };
}
