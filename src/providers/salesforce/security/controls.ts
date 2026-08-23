/**
 * Security controls for the Salesforce Commercial Executive Context Provider.
 */

export const SALESFORCE_SECURITY_CONTROLS = [
  "least_privilege",
  "encrypted_credentials",
  "tenant_isolation",
  "audit_logging",
  "permission_validation",
  "secret_rotation",
] as const;

export type SalesforceSecurityControl =
  (typeof SALESFORCE_SECURITY_CONTROLS)[number];

export type SalesforceSecurityAuditEntry = {
  id: string;
  at: string;
  action: string;
  tenantId: string;
  detail: string;
};

export type SalesforceSecurityContext = {
  tenantId: string;
  orgId: string;
  consentedScopes: string[];
  leastPrivilegeScopes: string[];
  secretRotatedAt: string | null;
  auditLog: SalesforceSecurityAuditEntry[];
};

export const SALESFORCE_LEAST_PRIVILEGE_SCOPES = [
  "api",
  "refresh_token",
  "offline_access",
  "id",
  "profile",
] as const;

export function createSalesforceSecurityContext(input: {
  tenantId: string;
  orgId: string;
  consentedScopes?: string[];
  secretRotatedAt?: string | null;
}): SalesforceSecurityContext {
  return {
    tenantId: input.tenantId,
    orgId: input.orgId,
    consentedScopes:
      input.consentedScopes ?? [...SALESFORCE_LEAST_PRIVILEGE_SCOPES],
    leastPrivilegeScopes: [...SALESFORCE_LEAST_PRIVILEGE_SCOPES],
    secretRotatedAt: input.secretRotatedAt ?? null,
    auditLog: [],
  };
}

export function assertSalesforceTenantIsolation(
  context: SalesforceSecurityContext,
  requestedTenantId: string,
): { ok: boolean; message: string } {
  if (context.tenantId !== requestedTenantId) {
    return {
      ok: false,
      message:
        "Tenant isolation violation — refusing cross-tenant Salesforce access",
    };
  }
  return { ok: true, message: "Tenant isolation satisfied" };
}

export function assertSalesforceLeastPrivilege(
  context: SalesforceSecurityContext,
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

export function assertNoPlaintextSalesforceCredentials(payload: unknown): {
  ok: boolean;
  message: string;
} {
  const text = JSON.stringify(payload);
  const suspicious =
    /"accessToken"\s*:\s*"[^"]+"|"clientSecret"\s*:\s*"[^"]+"|"client_secret"\s*:\s*"[^"]+"|"refreshToken"\s*:\s*"[^"]+"/.test(
      text,
    );
  return {
    ok: !suspicious,
    message: suspicious
      ? "Plaintext credentials detected — refuse persistence"
      : "No plaintext credentials in payload",
  };
}

export function recordSalesforceAudit(
  context: SalesforceSecurityContext,
  action: string,
  detail: string,
  at = new Date().toISOString(),
): SalesforceSecurityContext {
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

export function rotateSalesforceSecret(
  context: SalesforceSecurityContext,
  at = new Date().toISOString(),
): SalesforceSecurityContext {
  return recordSalesforceAudit(
    { ...context, secretRotatedAt: at },
    "secret_rotation",
    "Salesforce provider secret rotated",
    at,
  );
}
