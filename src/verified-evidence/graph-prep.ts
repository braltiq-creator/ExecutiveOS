/**
 * Knowledge Graph preparation — evidence → entity → relationship stubs.
 */

import type {
  EvidenceBackedEntity,
  EvidenceBackedRelationship,
  OrganizationEvidence,
} from "@/verified-evidence/types";

export function entityFromEvidence(input: {
  id: string;
  evidence: OrganizationEvidence;
  entityType: string;
  entityKey: string;
  label: string;
  properties?: Record<string, unknown>;
}): EvidenceBackedEntity {
  return {
    id: input.id,
    organizationId: input.evidence.organizationId,
    evidenceId: input.evidence.id,
    entityType: input.entityType,
    entityKey: input.entityKey,
    label: input.label,
    properties: {
      provenance: input.evidence.provenance,
      provider: input.evidence.provider,
      ...(input.properties ?? {}),
    },
  };
}

export function relationshipFromEvidence(input: {
  id: string;
  evidence: OrganizationEvidence;
  fromEntityId: string;
  toEntityId: string;
  relationshipType: string;
  properties?: Record<string, unknown>;
}): EvidenceBackedRelationship {
  return {
    id: input.id,
    organizationId: input.evidence.organizationId,
    evidenceId: input.evidence.id,
    fromEntityId: input.fromEntityId,
    toEntityId: input.toEntityId,
    relationshipType: input.relationshipType,
    properties: {
      provenance: input.evidence.provenance,
      ...(input.properties ?? {}),
    },
  };
}
