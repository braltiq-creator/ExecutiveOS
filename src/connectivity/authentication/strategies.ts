/**
 * Reusable authentication strategies for enterprise connectors.
 * Strategies are connector-agnostic — one OAuth client can serve many systems.
 */

export const AUTH_STRATEGY_IDS = [
  "oauth2",
  "oidc",
  "api_key",
  "bearer",
  "basic",
  "jwt",
  "client_credentials",
  "certificate",
  "sso_future",
] as const;

export type AuthStrategyId = (typeof AUTH_STRATEGY_IDS)[number];

export type AuthCredentials = {
  strategy: AuthStrategyId;
  /** Opaque — never log raw secrets */
  clientId?: string;
  clientSecretRef?: string;
  apiKeyRef?: string;
  bearerTokenRef?: string;
  usernameRef?: string;
  passwordRef?: string;
  jwtRef?: string;
  certificateRef?: string;
  scopes?: string[];
  tokenUrl?: string;
  authorizeUrl?: string;
  audience?: string;
  /** Future SSO provider key */
  ssoProvider?: string;
};

export type AuthSession = {
  id: string;
  strategy: AuthStrategyId;
  connectorId: string;
  status: "active" | "expired" | "revoked" | "error";
  acquiredAt: string;
  expiresAt: string | null;
  scopes: string[];
  message: string;
};

export type AuthResult = {
  ok: boolean;
  session?: AuthSession;
  message: string;
};

export type AuthStrategy = {
  readonly id: AuthStrategyId;
  readonly label: string;
  authenticate(input: {
    connectorId: string;
    credentials: AuthCredentials;
    asOf?: string;
  }): AuthResult;
  refresh?(session: AuthSession, credentials: AuthCredentials): AuthResult;
  revoke?(session: AuthSession): { ok: boolean; message: string };
  validateSession(session: AuthSession, asOf?: string): boolean;
};

function sessionId(connectorId: string, strategy: AuthStrategyId): string {
  return `auth-${strategy}-${connectorId}`;
}

function baseSession(
  connectorId: string,
  strategy: AuthStrategyId,
  asOf: string,
  ttlMinutes: number | null,
  scopes: string[],
  message: string,
): AuthSession {
  const expiresAt =
    ttlMinutes === null
      ? null
      : new Date(new Date(asOf).getTime() + ttlMinutes * 60_000).toISOString();
  return {
    id: sessionId(connectorId, strategy),
    strategy,
    connectorId,
    status: "active",
    acquiredAt: asOf,
    expiresAt,
    scopes,
    message,
  };
}

function createSimpleStrategy(
  id: AuthStrategyId,
  label: string,
  ttlMinutes: number | null,
  required: (c: AuthCredentials) => boolean,
  missingMessage: string,
): AuthStrategy {
  return {
    id,
    label,
    authenticate({ connectorId, credentials, asOf = new Date().toISOString() }) {
      if (credentials.strategy !== id) {
        return { ok: false, message: `Strategy mismatch: expected ${id}` };
      }
      if (!required(credentials)) {
        return { ok: false, message: missingMessage };
      }
      const session = baseSession(
        connectorId,
        id,
        asOf,
        ttlMinutes,
        credentials.scopes ?? [],
        `${label} authenticated`,
      );
      return { ok: true, session, message: session.message };
    },
    refresh(session, credentials) {
      return this.authenticate({
        connectorId: session.connectorId,
        credentials,
        asOf: new Date().toISOString(),
      });
    },
    revoke(session) {
      return { ok: true, message: `Revoked session ${session.id}` };
    },
    validateSession(session, asOf = new Date().toISOString()) {
      if (session.status !== "active") return false;
      if (!session.expiresAt) return true;
      return new Date(session.expiresAt).getTime() > new Date(asOf).getTime();
    },
  };
}

export const oauth2Strategy = createSimpleStrategy(
  "oauth2",
  "OAuth 2.0",
  60,
  (c) => Boolean(c.clientId && c.clientSecretRef),
  "OAuth 2.0 requires clientId and clientSecretRef",
);

export const oidcStrategy = createSimpleStrategy(
  "oidc",
  "OpenID Connect",
  60,
  (c) => Boolean(c.clientId && c.clientSecretRef && c.authorizeUrl),
  "OIDC requires clientId, clientSecretRef, and authorizeUrl",
);

export const apiKeyStrategy = createSimpleStrategy(
  "api_key",
  "API Key",
  null,
  (c) => Boolean(c.apiKeyRef),
  "API Key strategy requires apiKeyRef",
);

export const bearerStrategy = createSimpleStrategy(
  "bearer",
  "Bearer Token",
  120,
  (c) => Boolean(c.bearerTokenRef),
  "Bearer strategy requires bearerTokenRef",
);

export const basicStrategy = createSimpleStrategy(
  "basic",
  "Basic Authentication",
  null,
  (c) => Boolean(c.usernameRef && c.passwordRef),
  "Basic auth requires usernameRef and passwordRef",
);

export const jwtStrategy = createSimpleStrategy(
  "jwt",
  "JWT",
  30,
  (c) => Boolean(c.jwtRef),
  "JWT strategy requires jwtRef",
);

export const clientCredentialsStrategy = createSimpleStrategy(
  "client_credentials",
  "Client Credentials",
  60,
  (c) => Boolean(c.clientId && c.clientSecretRef && c.tokenUrl),
  "Client credentials require clientId, clientSecretRef, and tokenUrl",
);

export const certificateStrategy = createSimpleStrategy(
  "certificate",
  "Certificate Authentication",
  240,
  (c) => Boolean(c.certificateRef),
  "Certificate strategy requires certificateRef",
);

export const ssoFutureStrategy = createSimpleStrategy(
  "sso_future",
  "Future SSO Provider",
  60,
  (c) => Boolean(c.ssoProvider),
  "SSO strategy requires ssoProvider identifier",
);

export const AUTH_STRATEGIES: Record<AuthStrategyId, AuthStrategy> = {
  oauth2: oauth2Strategy,
  oidc: oidcStrategy,
  api_key: apiKeyStrategy,
  bearer: bearerStrategy,
  basic: basicStrategy,
  jwt: jwtStrategy,
  client_credentials: clientCredentialsStrategy,
  certificate: certificateStrategy,
  sso_future: ssoFutureStrategy,
};

export function getAuthStrategy(id: AuthStrategyId): AuthStrategy {
  return AUTH_STRATEGIES[id];
}

export function listAuthStrategies(): AuthStrategy[] {
  return Object.values(AUTH_STRATEGIES);
}

/** Authenticate using any registered strategy — reusable across connectors. */
export function authenticateWithStrategy(input: {
  connectorId: string;
  credentials: AuthCredentials;
  asOf?: string;
}): AuthResult {
  const strategy = getAuthStrategy(input.credentials.strategy);
  return strategy.authenticate(input);
}
