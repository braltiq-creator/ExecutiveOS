import type { BusinessEvent, CanonicalEntityType } from "@/connectors/types";

export type TwinEntity = {
  id: string;
  type: CanonicalEntityType;
  label: string;
  status?: string;
  importance: number;
  confidence: number;
  sourceSystems: string[];
  properties: Record<string, unknown>;
  relatedIds: string[];
  updatedAt: string;
  version: number;
};

export type TwinRelationship = {
  id: string;
  type: string;
  fromId: string;
  toId: string;
  weight?: number;
  sourceEventId: string;
  sourceSystem: string;
};

export type TwinState = {
  asOf: string;
  source: string;
  entities: TwinEntity[];
  relationships: TwinRelationship[];
  eventCount: number;
  version: number;
};

export type TwinSnapshotVersion = {
  id: string;
  label: string;
  createdAt: string;
  state: TwinState;
  eventIds: string[];
};

export type TwinChangeEvent = {
  kind: "entity_upserted" | "relationship_asserted" | "snapshot_taken" | "replayed";
  at: string;
  entityId?: string;
  eventId?: string;
  versionId?: string;
  detail: string;
};

export type TwinQuery = {
  type?: CanonicalEntityType;
  sourceSystem?: string;
  ids?: string[];
  minImportance?: number;
  labelIncludes?: string;
  limit?: number;
};

export type TwinApplyResult = {
  eventsApplied: number;
  entitiesUpserted: number;
  relationshipsAsserted: number;
  ignoredDuplicates: number;
  changeEvents: TwinChangeEvent[];
};
