/**
 * Phase 37 — Verified Connections & Evidence Infrastructure
 *
 * Principle: A CONNECTION IS NOT EVIDENCE.
 * Authentication ≠ verification ≠ business evidence.
 */

export type VerifiedProviderId = "microsoft365" | "simpro";

export type ConnectionLifecycleStatus =
  | "not_connected"
  | "connecting"
  | "connected"
  | "verification_required"
  | "degraded"
  | "revoked"
  | "error";

export type AuthenticationStatus =
  | "none"
  | "pending"
  | "authenticated"
  | "expired"
  | "revoked"
  | "error";

export type VerificationStatus =
  | "unverified"
  | "verification_required"
  | "verified"
  | "failed"
  | "stale";

export type ConnectionHealth =
  | "unknown"
  | "healthy"
  | "degraded"
  | "unhealthy";

/** Durable organisation-scoped connection view (SoT: organization_integrations). */
export type OrganizationConnection = {
  id: string;
  organizationId: string;
  provider: VerifiedProviderId;
  integrationProviderId: string;
  connectionStatus: ConnectionLifecycleStatus;
  authenticationStatus: AuthenticationStatus;
  verificationStatus: VerificationStatus;
  health: ConnectionHealth;
  scopes: string[];
  connectedAt: string | null;
  lastVerifiedAt: string | null;
  lastSyncAt: string | null;
  errorMessage: string | null;
  createdBy: string | null;
  updatedAt: string;
};

export type EvidenceProvenance =
  | "DIRECT"
  | "USER_PROVIDED"
  | "DERIVED"
  | "INFERRED"
  | "SYNTHETIC";

export type EvidenceStatus = "draft" | "active" | "superseded" | "rejected";

export type EvidenceProvider =
  | VerifiedProviderId
  | "user_upload"
  | "executiveos";

/** Durable evidence item — every fact must answer "where did this come from?" */
export type OrganizationEvidence = {
  id: string;
  organizationId: string;
  connectionId: string | null;
  provider: EvidenceProvider;
  sourceSystem: string;
  sourceObjectType: string;
  sourceIdentifier: string;
  observedAt: string | null;
  retrievedAt: string;
  provenance: EvidenceProvenance;
  evidenceStatus: EvidenceStatus;
  confidence: number | null;
  contentPayload: Record<string, unknown>;
  schemaVersion: string;
  createdBy: string | null;
  createdAt: string;
};

export type ClaimClassification = "DIRECT" | "DERIVED" | "INFERRED";

export type ClaimStatus = "proposed" | "accepted" | "rejected" | "superseded";

/** A Claim must retain references to supporting evidence. */
export type OrganizationClaim = {
  id: string;
  organizationId: string;
  claimKind: string;
  statement: string;
  classification: ClaimClassification;
  evidenceIds: string[];
  confidence: number | null;
  claimStatus: ClaimStatus;
  createdBy: string | null;
  createdAt: string;
};

/** Knowledge Graph preparation — evidence-backed entity stub. */
export type EvidenceBackedEntity = {
  id: string;
  organizationId: string;
  evidenceId: string;
  entityType: string;
  entityKey: string;
  label: string;
  properties: Record<string, unknown>;
};

export type EvidenceBackedRelationship = {
  id: string;
  organizationId: string;
  evidenceId: string;
  fromEntityId: string;
  toEntityId: string;
  relationshipType: string;
  properties: Record<string, unknown>;
};

export const PHASE37_PROVIDERS: Array<{
  id: VerifiedProviderId;
  integrationProviderId: string;
  label: string;
}> = [
  {
    id: "microsoft365",
    integrationProviderId: "microsoft_365",
    label: "Microsoft 365",
  },
  {
    id: "simpro",
    integrationProviderId: "simpro",
    label: "Simpro",
  },
];

export function integrationProviderIdFor(
  provider: VerifiedProviderId,
): string {
  return provider === "microsoft365" ? "microsoft_365" : "simpro";
}

export function verifiedProviderFromIntegrationId(
  integrationProviderId: string,
): VerifiedProviderId | null {
  if (integrationProviderId === "microsoft_365") return "microsoft365";
  if (integrationProviderId === "simpro") return "simpro";
  return null;
}
