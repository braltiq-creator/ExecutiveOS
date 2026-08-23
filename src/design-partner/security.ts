/**
 * Honest Design Partner security posture — no unsupported certifications.
 */

import type { DesignPartnerSecurityPosture } from "./types";
import { retentionPolicyLabel } from "./environment";

export function buildDesignPartnerSecurityPosture(input?: {
  retentionConfigured?: boolean;
  auditDays?: number | null;
}): DesignPartnerSecurityPosture {
  return {
    retentionLabel: retentionPolicyLabel({
      configured: input?.retentionConfigured,
      auditDays: input?.auditDays,
    }),
    forbiddenClaims: [
      "SOC 2 certified",
      "ISO 27001 certified",
      "Enterprise compliant",
      "Guaranteed encryption at rest",
      "Automatic deletion SLA",
    ],
    claims: [
      {
        id: "ingestion",
        title: "DATA INGESTION",
        statement:
          "Uploaded files are processed through the ExecutiveOS Universal Data Gateway.",
        status: "implemented",
      },
      {
        id: "source-access",
        title: "SOURCE SYSTEM ACCESS",
        statement:
          "No direct source-system credentials are required for the pilot. Excel / CSV export is the first connector.",
        status: "implemented",
      },
      {
        id: "source-data",
        title: "SOURCE DATA",
        statement:
          "ExecutiveOS works from customer-provided exports for the Design Partner pilot.",
        status: "implemented",
      },
      {
        id: "snapshots",
        title: "SNAPSHOTS",
        statement:
          "Imported datasets are stored as immutable Executive Snapshots.",
        status: "implemented",
      },
      {
        id: "audit",
        title: "AUDIT",
        statement:
          "Ingestion and snapshot lineage are recorded in the gateway audit trail.",
        status: "implemented",
      },
      {
        id: "tenant-isolation",
        title: "TENANT ISOLATION",
        statement:
          "Snapshot library and audit listings are scoped by organisation id. Cross-tenant access is refused.",
        status: "supported_by_architecture",
      },
      {
        id: "retention",
        title: "RETENTION",
        statement: retentionPolicyLabel({
          configured: input?.retentionConfigured,
          auditDays: input?.auditDays,
        }),
        status: input?.retentionConfigured
          ? "supported_by_architecture"
          : "not_yet_implemented",
      },
      {
        id: "role-permissions",
        title: "ROLE-BASED PERMISSIONS",
        statement:
          "Organisation roles exist in the product model. Fine-grained executive RBAC for Design Partner pilots is not fully enforced in every surface.",
        status: "not_yet_implemented",
      },
    ],
  };
}
