import type { SecurityPack } from "@/commercial/framework/types";

export function buildSecurityPack(asOf?: string): SecurityPack {
  return {
    version: "1.0",
    asOf: asOf ?? new Date().toISOString(),
    sections: [
      {
        id: "architecture",
        title: "Architecture overview",
        summary:
          "ExecutiveOS is a multi-tenant Next.js application with isolated tenant runtime context and presentation layers above Core intelligence engines.",
        bullets: [
          "Tenant-scoped runtime context for every request path",
          "Core engines unchanged by commercial packaging",
          "Presentation and commercial layers sit above intelligence",
        ],
      },
      {
        id: "tenant_isolation",
        title: "Tenant isolation",
        summary:
          "Customer business data is never shared across tenants. Internal Braltiq tooling uses anonymised aggregate telemetry only.",
        bullets: [
          "Tenant ID required for data access",
          "Operations/experiments platforms forbid business payloads",
          "Partner labels anonymised in internal analytics",
        ],
      },
      {
        id: "identity",
        title: "Identity",
        summary:
          "Authentication via organisation identity providers with role-based access for executives and administrators.",
        bullets: [
          "Session-based application access",
          "System admin gate for Braltiq tooling",
          "Enterprise path supports SSO-ready entitlements",
        ],
      },
      {
        id: "encryption",
        title: "Encryption",
        summary:
          "Data encrypted in transit (TLS) with platform encryption controls for data at rest in the deployment environment.",
        bullets: [
          "TLS for all external traffic",
          "Secrets managed via environment configuration",
          "No plaintext provider secrets in client bundles",
        ],
      },
      {
        id: "audit",
        title: "Audit",
        summary:
          "Auditable recommendation explainability, trust provenance, and operational access events support governance review.",
        bullets: [
          "Trust & Explainability audit packs",
          "Runtime workspace access audit events",
          "Exportable audit paths on enterprise entitlements",
        ],
      },
      {
        id: "backups",
        title: "Backups",
        summary:
          "Deployment backups follow the hosting environment’s retention policy with periodic restore verification.",
        bullets: [
          "Scheduled backups in the deployment environment",
          "Retention aligned to customer contract tier",
        ],
      },
      {
        id: "recovery",
        title: "Recovery",
        summary:
          "Documented recovery objectives for platform availability and tenant restore procedures.",
        bullets: [
          "RTO/RPO defined per environment",
          "Provider reconnect playbooks for pilot and production",
        ],
      },
      {
        id: "compliance",
        title: "Compliance roadmap",
        summary:
          "Roadmap toward formal enterprise attestations as production footprint expands.",
        bullets: [
          "Security questionnaire pack for procurement",
          "SOC 2 / ISO roadmap tracked by Braltiq",
          "Data residency selectable per tenant region",
        ],
      },
      {
        id: "governance",
        title: "Operational governance",
        summary:
          "Braltiq internal platforms (Operations, Experiments, Commercial) are admin-gated and isolated from customer UI.",
        bullets: [
          "System admin authentication required",
          "No Design Partner visibility into internal tooling",
          "Change control via implementation methodology",
        ],
      },
    ],
  };
}
