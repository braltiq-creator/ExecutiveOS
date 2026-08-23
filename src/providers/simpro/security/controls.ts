/**
 * Security controls for the Simpro Executive Context Provider.
 */

export const SIMPRO_SECURITY_CONTROLS = [
  "least_privilege",
  "encrypted_credentials",
  "tenant_isolation",
  "audit_logging",
  "permission_validation",
  "secret_rotation",
] as const;

export type SimproSecurityControl = (typeof SIMPRO_SECURITY_CONTROLS)[number];

export type SimproSecurityAuditEntry = {
  id: string;
  at: string;
  action: string;
  tenantId: string;
  detail: string;
};

export type SimproSecurityContext = {
  tenantId: string;
  companyId: string;
  consentedScopes: string[];
  leastPrivilegeScopes: string[];
  secretRotatedAt: string | null;
  auditLog: SimproSecurityAuditEntry[];
};

export const SIMPRO_LEAST_PRIVILEGE_SCOPES = [
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

export function createSimproSecurityContext(input: {
  tenantId: string;
  companyId: string;
  consentedScopes?: string[];
  secretRotatedAt?: string | null;
}): SimproSecurityContext {
  return {
    tenantId: input.tenantId,
    companyId: input.companyId,
    consentedScopes: input.consentedScopes ?? [...SIMPRO_LEAST_PRIVILEGE_SCOPES],
    leastPrivilegeScopes: [...SIMPRO_LEAST_PRIVILEGE_SCOPES],
    secretRotatedAt: input.secretRotatedAt ?? null,
    auditLog: [],
  };
}

export function assertSimproTenantIsolation(
  context: SimproSecurityContext,
  requestedTenantId: string,
): { ok: boolean; message: string } {
  if (context.tenantId !== requestedTenantId) {
    return {
      ok: false,
      message: "Tenant isolation violation — refusing cross-tenant Simpro access",
    };
  }
  return { ok: true, message: "Tenant isolation satisfied" };
}

export function assertSimproLeastPrivilege(
  context: SimproSecurityContext,
): { ok: boolean; excess: string[]; message: string } {
  const excess = context.consentedScopes.filter(
    (scope) => !context.leastPrivilegeScopes.includes(scope),
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

export function assertNoPlaintextSimproCredentials(payload: unknown): {
  ok: boolean;
  message: string;
} {
  const text = JSON.stringify(payload);
  const suspicious =
    /"accessToken"\s*:\s*"[^"]+"|"apiKey"\s*:\s*"[^"]+"|"client_secret"\s*:\s*"[^"]+"|"refreshToken"\s*:\s*"[^"]+"/.test(
      text,
    );
  return {
    ok: !suspicious,
    message: suspicious
      ? "Plaintext credentials detected — refuse persistence"
      : "No plaintext credentials in payload",
  };
}

export function recordSimproAudit(
  context: SimproSecurityContext,
  action: string,
  detail: string,
  at = new Date().toISOString(),
): SimproSecurityContext {
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

export function rotateSimproSecret(
  context: SimproSecurityContext,
  at = new Date().toISOString(),
): SimproSecurityContext {
  return recordSimproAudit(
    { ...context, secretRotatedAt: at },
    "secret_rotation",
    "Simpro provider secret rotated",
    at,
  );
}
