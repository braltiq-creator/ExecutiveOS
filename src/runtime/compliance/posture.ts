/**
 * Compliance readiness — SOC2, ISO27001, GDPR, Australian Privacy Act.
 */

export const COMPLIANCE_FRAMEWORKS = [
  "soc2",
  "iso27001",
  "gdpr",
  "australian_privacy_act",
] as const;

export type ComplianceFramework = (typeof COMPLIANCE_FRAMEWORKS)[number];

export type ComplianceControl = {
  id: string;
  framework: ComplianceFramework;
  label: string;
  status: "ready" | "partial" | "planned";
  evidence: string;
};

export type CompliancePosture = {
  tenantId: string;
  dataResidency: string;
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  secretRotationEnabled: boolean;
  keyManagement: "platform_kms" | "customer_managed" | "mock";
  controls: ComplianceControl[];
};

export function buildCompliancePosture(input: {
  tenantId: string;
  dataResidency: string;
}): CompliancePosture {
  return {
    tenantId: input.tenantId,
    dataResidency: input.dataResidency,
    encryptionAtRest: true,
    encryptionInTransit: true,
    secretRotationEnabled: true,
    keyManagement: "platform_kms",
    controls: [
      {
        id: "soc2-cc6",
        framework: "soc2",
        label: "Logical access — RBAC + MFA",
        status: "ready",
        evidence: "Runtime RBAC + identity MFA flags",
      },
      {
        id: "soc2-cc7",
        framework: "soc2",
        label: "System monitoring — observability",
        status: "ready",
        evidence: "PlatformObservability + telemetry bus",
      },
      {
        id: "iso-a8",
        framework: "iso27001",
        label: "Asset management — tenant isolation",
        status: "ready",
        evidence: "Tenant isolation rules enforced",
      },
      {
        id: "gdpr-art32",
        framework: "gdpr",
        label: "Security of processing — encryption",
        status: "ready",
        evidence: "Encryption at rest and in transit",
      },
      {
        id: "apa-13",
        framework: "australian_privacy_act",
        label: "APP 11 — security of personal information",
        status: "ready",
        evidence: "AU residency + audit + least privilege",
      },
      {
        id: "gdpr-art17",
        framework: "gdpr",
        label: "Right to erasure — retention policies",
        status: "partial",
        evidence: "Retention policy configured; deletion workflows planned",
      },
    ],
  };
}
