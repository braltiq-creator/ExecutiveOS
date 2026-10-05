import { createHash } from "node:crypto";

/**
 * Deterministic ids. The same organisation, snapshot, and canonical key
 * always hash to the same id. Snapshot id is part of the hash, so a later
 * weekly upload cannot reuse or overwrite an earlier snapshot's ids.
 */
export function manufacturingGraphId(
  kind: "f" | "e" | "r",
  parts: readonly string[],
): string {
  const hash = createHash("sha256")
    .update(parts.join("\u001f"))
    .digest("hex")
    .slice(0, 32);
  return `meg${kind}_${hash}`;
}

export function factId(
  organisationId: string,
  snapshotId: string,
  sourceRecordId: string,
): string {
  return manufacturingGraphId("f", [organisationId, snapshotId, sourceRecordId]);
}

export function entityId(
  organisationId: string,
  snapshotId: string,
  entityType: string,
  entityKey: string,
): string {
  return manufacturingGraphId("e", [
    organisationId,
    snapshotId,
    entityType,
    entityKey,
  ]);
}

export function relationshipId(
  organisationId: string,
  snapshotId: string,
  relationshipType: string,
  fromEntityType: string,
  fromEntityKey: string,
  toEntityType: string,
  toEntityKey: string,
): string {
  return manufacturingGraphId("r", [
    organisationId,
    snapshotId,
    relationshipType,
    fromEntityType,
    fromEntityKey,
    toEntityType,
    toEntityKey,
  ]);
}

export function dimensionKey(label: string): string {
  return `v:${label}`;
}

export function measureKey(sourceRecordId: string): string {
  return `rec:${sourceRecordId}`;
}

export function organisationKey(organisationId: string): string {
  return `org:${organisationId}`;
}
