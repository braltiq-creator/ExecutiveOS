/**
 * Policy engine — configurable tenant governance.
 */

export type PolicyKind =
  | "retention"
  | "privacy"
  | "connector_permissions"
  | "executive_approvals"
  | "knowledge_pack_activation"
  | "context_provider_activation"
  | "audit_requirements"
  | "data_export"
  | "regional_restrictions";

export type PolicyRule = {
  id: string;
  kind: PolicyKind;
  tenantId: string;
  enabled: boolean;
  config: Record<string, string | number | boolean | string[]>;
  description: string;
};

export type PolicyDecision = {
  allowed: boolean;
  policyId: string;
  kind: PolicyKind;
  reason: string;
};

export function createDefaultPolicies(tenantId: string): PolicyRule[] {
  return [
    {
      id: `${tenantId}-pol-retention`,
      kind: "retention",
      tenantId,
      enabled: true,
      config: { auditDays: 2555, eventDays: 730 },
      description: "Retention aligned to enterprise compliance",
    },
    {
      id: `${tenantId}-pol-privacy`,
      kind: "privacy",
      tenantId,
      enabled: true,
      config: { piiMinimisation: true, mailBodyForbidden: true },
      description: "Privacy — minimise PII in executive artefacts",
    },
    {
      id: `${tenantId}-pol-connectors`,
      kind: "connector_permissions",
      tenantId,
      enabled: true,
      config: { allowed: ["microsoft365", "sap", "maximo", "simpro", "jira"] },
      description: "Approved connector systems",
    },
    {
      id: `${tenantId}-pol-approvals`,
      kind: "executive_approvals",
      tenantId,
      enabled: true,
      config: { dualControlForExport: true },
      description: "Executive approvals for sensitive actions",
    },
    {
      id: `${tenantId}-pol-packs`,
      kind: "knowledge_pack_activation",
      tenantId,
      enabled: true,
      config: { requiresAdmin: true },
      description: "Knowledge Pack activation requires administrator",
    },
    {
      id: `${tenantId}-pol-providers`,
      kind: "context_provider_activation",
      tenantId,
      enabled: true,
      config: { requiresAdmin: true },
      description: "Context Provider activation requires administrator",
    },
    {
      id: `${tenantId}-pol-audit`,
      kind: "audit_requirements",
      tenantId,
      enabled: true,
      config: { immutable: true, searchable: true },
      description: "Immutable searchable audit log",
    },
    {
      id: `${tenantId}-pol-export`,
      kind: "data_export",
      tenantId,
      enabled: true,
      config: { requirePermission: "export:data" },
      description: "Data export gated by permission",
    },
    {
      id: `${tenantId}-pol-region`,
      kind: "regional_restrictions",
      tenantId,
      enabled: true,
      config: { residency: "au", denyCrossRegion: true },
      description: "Australian data residency",
    },
  ];
}

export function evaluatePolicy(input: {
  policies: PolicyRule[];
  kind: PolicyKind;
  action: string;
  hasAdmin?: boolean;
  hasExportPermission?: boolean;
  connectorSystem?: string;
  region?: string;
}): PolicyDecision {
  const policy = input.policies.find((p) => p.kind === input.kind && p.enabled);
  if (!policy) {
    return {
      allowed: true,
      policyId: "none",
      kind: input.kind,
      reason: "No policy configured — default allow",
    };
  }

  if (input.kind === "connector_permissions" && input.connectorSystem) {
    const allowed = (policy.config.allowed as string[]) ?? [];
    const ok = allowed.includes(input.connectorSystem);
    return {
      allowed: ok,
      policyId: policy.id,
      kind: policy.kind,
      reason: ok
        ? "Connector permitted"
        : `Connector ${input.connectorSystem} not in allow-list`,
    };
  }

  if (
    (input.kind === "knowledge_pack_activation" ||
      input.kind === "context_provider_activation") &&
    policy.config.requiresAdmin
  ) {
    return {
      allowed: Boolean(input.hasAdmin),
      policyId: policy.id,
      kind: policy.kind,
      reason: input.hasAdmin
        ? "Administrator authorised"
        : "Administrator required",
    };
  }

  if (input.kind === "data_export") {
    return {
      allowed: Boolean(input.hasExportPermission),
      policyId: policy.id,
      kind: policy.kind,
      reason: input.hasExportPermission
        ? "Export permitted"
        : "Missing export:data permission",
    };
  }

  if (input.kind === "regional_restrictions" && input.region) {
    const residency = String(policy.config.residency ?? "global");
    const ok = !policy.config.denyCrossRegion || input.region === residency;
    return {
      allowed: ok,
      policyId: policy.id,
      kind: policy.kind,
      reason: ok
        ? "Region permitted"
        : `Region ${input.region} violates residency ${residency}`,
    };
  }

  return {
    allowed: true,
    policyId: policy.id,
    kind: policy.kind,
    reason: policy.description,
  };
}
