/**
 * Security controls for the Microsoft 365 Executive Context Provider.
 */

export const M365_SECURITY_CONTROLS = [
  "least_privilege",
  "consent",
  "tenant_isolation",
  "audit_logging",
  "secret_rotation",
  "encrypted_tokens",
  "key_vault",
  "permission_validation",
] as const;

export type M365SecurityControl = (typeof M365_SECURITY_CONTROLS)[number];

export type SecurityAuditEntry = {
  id: string;
  at: string;
  action: string;
  tenantId: string;
  detail: string;
};

export type M365SecurityContext = {
  tenantId: string;
  consentedScopes: string[];
  leastPrivilegeScopes: string[];
  secretRotatedAt: string | null;
  auditLog: SecurityAuditEntry[];
};

/** Recommended least-privilege scopes for executive context (not full mailbox dump). */
export const LEAST_PRIVILEGE_SCOPES = [
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

/** Assert no plaintext credential material is persisted. */
export function assertNoPlaintextCredentials(payload: unknown): {
  ok: boolean;
  message: string;
} {
  const text = JSON.stringify(payload);
  const suspicious =
    /"accessToken"\s*:\s*"[^"]+"|"refreshToken"\s*:\s*"[^"]+"|"client_secret"\s*:\s*"[^"]+"/.test(
      text,
    );
  return {
    ok: !suspicious,
    message: suspicious
      ? "Plaintext credentials detected — refuse persistence"
      : "No plaintext credentials in payload",
  };
}

export function createSecurityContext(input: {
  tenantId: string;
  consentedScopes?: string[];
  secretRotatedAt?: string | null;
}): M365SecurityContext {
  return {
    tenantId: input.tenantId,
    consentedScopes: input.consentedScopes ?? [...LEAST_PRIVILEGE_SCOPES],
    leastPrivilegeScopes: [...LEAST_PRIVILEGE_SCOPES],
    secretRotatedAt: input.secretRotatedAt ?? null,
    auditLog: [],
  };
}

export function assertTenantIsolation(
  context: M365SecurityContext,
  requestedTenantId: string,
): { ok: boolean; message: string } {
  if (context.tenantId !== requestedTenantId) {
    return {
      ok: false,
      message: "Tenant isolation violation — refusing cross-tenant access",
    };
  }
  return { ok: true, message: "Tenant isolation satisfied" };
}

export function assertLeastPrivilege(
  context: M365SecurityContext,
): { ok: boolean; excess: string[]; message: string } {
  const excess = context.consentedScopes.filter(
    (scope) =>
      !context.leastPrivilegeScopes.includes(scope) &&
      scope !== "offline_access",
  );
  return {
    ok: excess.length === 0,
    excess,
    message:
      excess.length === 0
        ? "Consent matches least-privilege baseline"
        : `Excess scopes present: ${excess.join(", ")}`,
  };
}

export function recordAudit(
  context: M365SecurityContext,
  action: string,
  detail: string,
  at = new Date().toISOString(),
): M365SecurityContext {
  return {
    ...context,
    auditLog: [
      ...context.auditLog,
      {
        id: `audit-${context.auditLog.length + 1}`,
        at,
        action,
        tenantId: context.tenantId,
        detail,
      },
    ].slice(-100),
  };
}

export function rotateSecret(
  context: M365SecurityContext,
  at = new Date().toISOString(),
): M365SecurityContext {
  return recordAudit(
    { ...context, secretRotatedAt: at },
    "secret_rotation",
    "Provider secret rotated",
    at,
  );
}
