import {
  MANUFACTURING_GRAPH_REBIND_ERROR,
  resolveBoundEvidenceId,
} from "./binding";
import { compareManufacturingGraphs } from "./compare";
import { factId } from "./identity";
import { projectManufacturingEvidenceGraph } from "./project";
import { MANUFACTURING_GRAPH_PROVENANCE } from "./types";
import type {
  ManufacturingFact,
  ManufacturingFactDraft,
  ManufacturingGraphComparison,
  ManufacturingGraphEntity,
  ManufacturingGraphRelationship,
  ManufacturingRelationshipEvidence,
  ManufacturingSnapshotScope,
} from "./types";

type MemoryState = {
  scopes: Map<string, ManufacturingSnapshotScope>;
  facts: Map<string, ManufacturingFact>;
  entities: Map<string, ManufacturingGraphEntity>;
  relationships: Map<string, ManufacturingGraphRelationship>;
};

const state: MemoryState = {
  scopes: new Map(),
  facts: new Map(),
  entities: new Map(),
  relationships: new Map(),
};

type GraphWriteFault = "after-entities" | null;
let graphWriteFault: GraphWriteFault = null;

/** One-shot fault for retry tests. Ignored in production. */
export function armManufacturingGraphWriteFaultForTests(
  fault: GraphWriteFault,
): void {
  if (process.env.NODE_ENV === "production") return;
  graphWriteFault = fault;
}

function consumeWriteFault(point: Exclude<GraphWriteFault, null>): void {
  if (graphWriteFault !== point) return;
  graphWriteFault = null;
  throw new Error(
    "Manufacturing evidence graph write failed before completion.",
  );
}

function scopeKey(organisationId: string, snapshotId: string): string {
  return `${organisationId}\u001f${snapshotId}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function clearManufacturingEvidenceGraphMemory(): void {
  state.scopes.clear();
  state.facts.clear();
  state.entities.clear();
  state.relationships.clear();
  graphWriteFault = null;
}

export function saveManufacturingFactGrainMemory(input: {
  organisationId: string;
  snapshotId: string;
  organisationLabel: string | null;
  facts: readonly ManufacturingFactDraft[];
}): { created: boolean; factCount: number } {
  const organisationId = input.organisationId.trim();
  const snapshotId = input.snapshotId.trim();
  const key = scopeKey(organisationId, snapshotId);
  const existing = state.scopes.get(key);
  if (existing) {
    return {
      created: false,
      factCount: factsFor(organisationId, snapshotId).length,
    };
  }

  const label = input.organisationLabel?.trim() || null;
  state.scopes.set(key, {
    organisationId,
    snapshotId,
    organisationLabel: label,
    evidenceId: null,
    provenance: MANUFACTURING_GRAPH_PROVENANCE,
  });

  for (const draft of input.facts) {
    const fact: ManufacturingFact = {
      ...draft,
      id: factId(organisationId, snapshotId, draft.sourceRecordId),
      organisationId,
      snapshotId,
      evidenceId: null,
      provenance: MANUFACTURING_GRAPH_PROVENANCE,
    };
    state.facts.set(fact.id, fact);
  }

  return { created: true, factCount: input.facts.length };
}

export function materializeManufacturingEvidenceGraphMemory(input: {
  organisationId: string;
  snapshotId: string;
  evidenceId: string;
}): {
  materialized: boolean;
  missingGrain: boolean;
  entityCount: number;
  relationshipCount: number;
} {
  const organisationId = input.organisationId.trim();
  const snapshotId = input.snapshotId.trim();
  const evidenceId = input.evidenceId.trim();
  const scope = state.scopes.get(scopeKey(organisationId, snapshotId));
  if (!scope) {
    return {
      materialized: false,
      missingGrain: true,
      entityCount: 0,
      relationshipCount: 0,
    };
  }
  const facts = factsFor(organisationId, snapshotId);
  const existingEntities = entitiesFor(organisationId, snapshotId);
  const existingRelationships = relationshipsFor(organisationId, snapshotId);
  resolveBoundEvidenceId(evidenceId, [
    scope.evidenceId,
    ...facts.map((fact) => fact.evidenceId),
    ...existingEntities.map((entity) => entity.evidenceId),
    ...existingRelationships.map((relationship) => relationship.evidenceId),
  ]);

  if (scope.evidenceId == null) {
    scope.evidenceId = evidenceId;
  }
  for (const fact of facts) {
    const stored = state.facts.get(fact.id);
    if (stored && stored.evidenceId == null) {
      stored.evidenceId = evidenceId;
    }
  }

  const projection = projectManufacturingEvidenceGraph({
    organisationId,
    snapshotId,
    evidenceId,
    organisationLabel: scope.organisationLabel,
    facts,
  });

  for (const entity of projection.entities) {
    const existing = state.entities.get(entity.id);
    if (!existing) {
      state.entities.set(entity.id, clone(entity));
      continue;
    }
    assertExistingGraphRow(existing, organisationId, snapshotId, evidenceId);
  }
  consumeWriteFault("after-entities");
  for (const relationship of projection.relationships) {
    const existing = state.relationships.get(relationship.id);
    if (!existing) {
      state.relationships.set(relationship.id, clone(relationship));
      continue;
    }
    assertExistingGraphRow(existing, organisationId, snapshotId, evidenceId);
  }

  const entities = entitiesFor(organisationId, snapshotId);
  const relationships = relationshipsFor(organisationId, snapshotId);
  return {
    materialized: true,
    missingGrain: false,
    entityCount: entities.length,
    relationshipCount: relationships.length,
  };
}

export function listManufacturingGraphEntitiesMemory(
  organisationId: string,
  snapshotId: string,
): ManufacturingGraphEntity[] {
  return clone(entitiesFor(organisationId, snapshotId));
}

export function listManufacturingGraphRelationshipsMemory(
  organisationId: string,
  snapshotId: string,
): ManufacturingGraphRelationship[] {
  return clone(relationshipsFor(organisationId, snapshotId));
}

export function listManufacturingGraphRelationshipsForEntityMemory(
  organisationId: string,
  snapshotId: string,
  entityId: string,
): ManufacturingGraphRelationship[] {
  return clone(
    relationshipsFor(organisationId, snapshotId).filter(
      (relationship) =>
        relationship.fromEntityId === entityId ||
        relationship.toEntityId === entityId,
    ),
  );
}

export function getManufacturingGraphRelationshipEvidenceMemory(
  organisationId: string,
  snapshotId: string,
  relationshipId: string,
): ManufacturingRelationshipEvidence | null {
  const relationship = relationshipsFor(organisationId, snapshotId).find(
    (item) => item.id === relationshipId,
  );
  if (!relationship) return null;
  const supportingFacts = factsFor(organisationId, snapshotId).filter((fact) =>
    relationship.sourceRecordIds.includes(fact.sourceRecordId),
  );
  return clone({
    relationship,
    evidenceId: relationship.evidenceId,
    provenance: relationship.provenance,
    sourceRecordIds: relationship.sourceRecordIds,
    supportingFacts,
  });
}

export function compareManufacturingEvidenceGraphsMemory(input: {
  organisationId: string;
  snapshotId: string;
  previousSnapshotId: string;
}): ManufacturingGraphComparison {
  return compareManufacturingGraphs({
    currentSnapshotId: input.snapshotId,
    previousSnapshotId: input.previousSnapshotId,
    current: {
      entities: entitiesFor(input.organisationId, input.snapshotId),
      relationships: relationshipsFor(input.organisationId, input.snapshotId),
    },
    previous: {
      entities: entitiesFor(input.organisationId, input.previousSnapshotId),
      relationships: relationshipsFor(
        input.organisationId,
        input.previousSnapshotId,
      ),
    },
  });
}

function assertExistingGraphRow(
  existing: {
    organisationId: string;
    snapshotId: string;
    evidenceId: string;
  },
  organisationId: string,
  snapshotId: string,
  evidenceId: string,
): void {
  if (
    existing.organisationId !== organisationId ||
    existing.snapshotId !== snapshotId ||
    existing.evidenceId !== evidenceId
  ) {
    throw new Error(MANUFACTURING_GRAPH_REBIND_ERROR);
  }
}

function factsFor(organisationId: string, snapshotId: string): ManufacturingFact[] {
  return [...state.facts.values()]
    .filter(
      (fact) =>
        fact.organisationId === organisationId && fact.snapshotId === snapshotId,
    )
    .sort((a, b) => a.sourceRecordId.localeCompare(b.sourceRecordId));
}

function entitiesFor(
  organisationId: string,
  snapshotId: string,
): ManufacturingGraphEntity[] {
  return [...state.entities.values()]
    .filter(
      (entity) =>
        entity.organisationId === organisationId &&
        entity.snapshotId === snapshotId,
    )
    .sort(
      (a, b) =>
        a.entityType.localeCompare(b.entityType) ||
        a.entityKey.localeCompare(b.entityKey),
    );
}

function relationshipsFor(
  organisationId: string,
  snapshotId: string,
): ManufacturingGraphRelationship[] {
  return [...state.relationships.values()]
    .filter(
      (relationship) =>
        relationship.organisationId === organisationId &&
        relationship.snapshotId === snapshotId,
    )
    .sort(
      (a, b) =>
        a.relationshipType.localeCompare(b.relationshipType) ||
        a.fromEntityKey.localeCompare(b.fromEntityKey) ||
        a.toEntityKey.localeCompare(b.toEntityKey),
    );
}
