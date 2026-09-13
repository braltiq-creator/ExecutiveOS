/**
 * In-memory connection + evidence store for tests and local DX.
 * Production SoT remains Supabase organization_integrations / organization_evidence.
 */

import {
  PHASE37_PROVIDERS,
  type OrganizationClaim,
  type OrganizationConnection,
  type OrganizationEvidence,
  type VerifiedProviderId,
} from "@/verified-evidence/types";
import { assertProvenanceAllowed } from "@/verified-evidence/safety";
import { buildClaim } from "@/verified-evidence/claims";

type OrgBucket = {
  connections: Map<VerifiedProviderId, OrganizationConnection>;
  evidence: Map<string, OrganizationEvidence>;
  claims: Map<string, OrganizationClaim>;
};

const orgs = new Map<string, OrgBucket>();

function bucket(organizationId: string): OrgBucket {
  let b = orgs.get(organizationId);
  if (!b) {
    b = {
      connections: new Map(),
      evidence: new Map(),
      claims: new Map(),
    };
    orgs.set(organizationId, b);
  }
  return b;
}

function defaultConnection(
  organizationId: string,
  provider: VerifiedProviderId,
): OrganizationConnection {
  const meta = PHASE37_PROVIDERS.find((p) => p.id === provider)!;
  return {
    id: `conn-${organizationId}-${provider}`,
    organizationId,
    provider,
    integrationProviderId: meta.integrationProviderId,
    connectionStatus: "not_connected",
    authenticationStatus: "none",
    verificationStatus: "unverified",
    health: "unknown",
    scopes: [],
    connectedAt: null,
    lastVerifiedAt: null,
    lastSyncAt: null,
    errorMessage: null,
    createdBy: null,
    updatedAt: new Date().toISOString(),
  };
}

export function resetVerifiedEvidenceMemory(): void {
  orgs.clear();
}

export function listMemoryConnections(
  organizationId: string,
): OrganizationConnection[] {
  const b = bucket(organizationId);
  return PHASE37_PROVIDERS.map((p) => {
    return b.connections.get(p.id) ?? defaultConnection(organizationId, p.id);
  });
}

export function upsertMemoryConnection(
  connection: OrganizationConnection,
): OrganizationConnection {
  const b = bucket(connection.organizationId);
  const next = { ...connection, updatedAt: new Date().toISOString() };
  b.connections.set(connection.provider, next);
  return next;
}

export function registerAuthenticatedConnection(input: {
  organizationId: string;
  provider: VerifiedProviderId;
  scopes?: string[];
  createdBy?: string | null;
  asOf?: string;
}): OrganizationConnection {
  const asOf = input.asOf ?? new Date().toISOString();
  const existing =
    bucket(input.organizationId).connections.get(input.provider) ??
    defaultConnection(input.organizationId, input.provider);
  return upsertMemoryConnection({
    ...existing,
    connectionStatus: "verification_required",
    authenticationStatus: "authenticated",
    verificationStatus: "verification_required",
    health: "unknown",
    scopes: input.scopes ?? existing.scopes,
    connectedAt: existing.connectedAt ?? asOf,
    createdBy: input.createdBy ?? existing.createdBy,
    errorMessage: null,
  });
}

/**
 * Mark source access verified — does NOT create business evidence.
 * Connection ≠ evidence.
 */
export function markConnectionVerified(input: {
  organizationId: string;
  provider: VerifiedProviderId;
  asOf?: string;
}): OrganizationConnection {
  const asOf = input.asOf ?? new Date().toISOString();
  const existing =
    bucket(input.organizationId).connections.get(input.provider) ??
    defaultConnection(input.organizationId, input.provider);
  if (existing.authenticationStatus !== "authenticated") {
    throw new Error("Cannot verify a connection that is not authenticated.");
  }
  return upsertMemoryConnection({
    ...existing,
    connectionStatus: "connected",
    verificationStatus: "verified",
    health: "healthy",
    lastVerifiedAt: asOf,
    errorMessage: null,
  });
}

export function listMemoryEvidence(
  organizationId: string,
): OrganizationEvidence[] {
  return [...bucket(organizationId).evidence.values()].sort((a, b) =>
    b.retrievedAt.localeCompare(a.retrievedAt),
  );
}

export function recordMemoryEvidence(
  evidence: Omit<OrganizationEvidence, "createdAt"> & { createdAt?: string },
): OrganizationEvidence {
  assertProvenanceAllowed(evidence.provenance);
  const b = bucket(evidence.organizationId);
  const next: OrganizationEvidence = {
    ...evidence,
    createdAt: evidence.createdAt ?? new Date().toISOString(),
  };
  b.evidence.set(next.id, next);
  return next;
}

export function listMemoryClaims(organizationId: string): OrganizationClaim[] {
  return [...bucket(organizationId).claims.values()];
}

export function recordMemoryClaim(input: {
  id: string;
  organizationId: string;
  claimKind: string;
  statement: string;
  evidenceIds: string[];
  classification?: OrganizationClaim["classification"];
  confidence?: number | null;
  createdBy?: string | null;
}): OrganizationClaim {
  const b = bucket(input.organizationId);
  const evidence = input.evidenceIds.map((id) => {
    const row = b.evidence.get(id);
    if (!row || row.organizationId !== input.organizationId) {
      throw new Error(`Evidence ${id} not found for organisation.`);
    }
    return row;
  });
  const claim = buildClaim({
    id: input.id,
    organizationId: input.organizationId,
    claimKind: input.claimKind,
    statement: input.statement,
    evidence,
    classification: input.classification,
    confidence: input.confidence,
    createdBy: input.createdBy,
  });
  b.claims.set(claim.id, claim);
  return claim;
}

/** Discovery eligibility: verified evidence only — never connection state alone. */
export function getDiscoveryEvidenceContext(organizationId: string): {
  connections: OrganizationConnection[];
  verifiedProviders: VerifiedProviderId[];
  evidence: OrganizationEvidence[];
  hasVerifiedEvidence: boolean;
} {
  const connections = listMemoryConnections(organizationId);
  const verifiedProviders = connections
    .filter((c) => c.verificationStatus === "verified")
    .map((c) => c.provider);
  const evidence = listMemoryEvidence(organizationId).filter(
    (e) =>
      e.evidenceStatus === "active" &&
      (e.provenance === "DIRECT" || e.provenance === "USER_PROVIDED"),
  );
  return {
    connections,
    verifiedProviders,
    evidence,
    hasVerifiedEvidence: evidence.length > 0,
  };
}
