import type { BusinessEvent } from "@/connectors/types";
import type {
  TwinApplyResult,
  TwinChangeEvent,
  TwinEntity,
  TwinQuery,
  TwinRelationship,
  TwinSnapshotVersion,
  TwinState,
} from "@/digital-twin/types";

type Listener = (change: TwinChangeEvent) => void;

/**
 * Enterprise Digital Twin — canonical operational model.
 * Intelligence reasons over the Twin, never over SaaS APIs.
 */
export class EnterpriseDigitalTwin {
  private readonly entities = new Map<string, TwinEntity>();
  private readonly relationships = new Map<string, TwinRelationship>();
  private readonly events: BusinessEvent[] = [];
  private readonly eventIds = new Set<string>();
  private readonly versions: TwinSnapshotVersion[] = [];
  private readonly listeners = new Set<Listener>();
  private versionCounter = 0;
  private readonly source: string;

  constructor(meta?: { asOf?: string; source?: string }) {
    this.source = meta?.source ?? "enterprise-digital-twin";
    if (meta?.asOf) {
      // asOf is derived from latest event; seed marker only
      void meta.asOf;
    }
  }

  /** Incremental update from canonical BusinessEvents. */
  apply(events: BusinessEvent[]): TwinApplyResult {
    let entitiesUpserted = 0;
    let relationshipsAsserted = 0;
    let ignoredDuplicates = 0;
    const changeEvents: TwinChangeEvent[] = [];

    for (const event of events) {
      if (this.eventIds.has(event.id)) {
        ignoredDuplicates += 1;
        continue;
      }
      this.eventIds.add(event.id);
      this.events.push(event);

      const entity = this.upsertEntityFromEvent(event);
      entitiesUpserted += 1;
      const change: TwinChangeEvent = {
        kind: "entity_upserted",
        at: event.timestamp,
        entityId: entity.id,
        eventId: event.id,
        detail: `${entity.type} ${entity.id} upserted from ${event.sourceSystem}`,
      };
      changeEvents.push(change);
      this.publish(change);

      for (const rel of event.relationships) {
        // Ensure target stub exists so relationships are valid for graph bridge
        if (!this.entities.has(rel.targetEntityId)) {
          this.entities.set(rel.targetEntityId, {
            id: rel.targetEntityId,
            type: rel.targetEntityType ?? "Signal",
            label: rel.targetEntityId,
            importance: Math.max(0, event.importance - 10),
            confidence: Math.max(0, event.confidence - 15),
            sourceSystems: [String(event.sourceSystem)],
            properties: { stub: true },
            relatedIds: [],
            updatedAt: event.timestamp,
            version: 1,
          });
          entitiesUpserted += 1;
        }

        const relId = `twin-rel-${event.id}-${rel.type}-${rel.targetEntityId}`;
        if (!this.relationships.has(relId)) {
          const relationship: TwinRelationship = {
            id: relId,
            type: rel.type,
            fromId: event.entityId,
            toId: rel.targetEntityId,
            weight: rel.weight,
            sourceEventId: event.id,
            sourceSystem: String(event.sourceSystem),
          };
          this.relationships.set(relId, relationship);
          relationshipsAsserted += 1;

          const from = this.entities.get(event.entityId);
          if (from && !from.relatedIds.includes(rel.targetEntityId)) {
            from.relatedIds.push(rel.targetEntityId);
          }
          const to = this.entities.get(rel.targetEntityId);
          if (to && !to.relatedIds.includes(event.entityId)) {
            to.relatedIds.push(event.entityId);
          }

          const relChange: TwinChangeEvent = {
            kind: "relationship_asserted",
            at: event.timestamp,
            entityId: event.entityId,
            eventId: event.id,
            detail: `${rel.type}: ${event.entityId} → ${rel.targetEntityId}`,
          };
          changeEvents.push(relChange);
          this.publish(relChange);
        }
      }
    }

    this.versionCounter += 1;
    return {
      eventsApplied: events.length - ignoredDuplicates,
      entitiesUpserted,
      relationshipsAsserted,
      ignoredDuplicates,
      changeEvents,
    };
  }

  getState(): TwinState {
    return {
      asOf: this.latestTimestamp(),
      source: this.source,
      entities: [...this.entities.values()].sort((a, b) =>
        a.id.localeCompare(b.id),
      ),
      relationships: [...this.relationships.values()].sort((a, b) =>
        a.id.localeCompare(b.id),
      ),
      eventCount: this.events.length,
      version: this.versionCounter,
    };
  }

  getEntity(id: string): TwinEntity | undefined {
    return this.entities.get(id);
  }

  query(query: TwinQuery = {}): TwinEntity[] {
    let items = [...this.entities.values()];
    if (query.type) items = items.filter((entity) => entity.type === query.type);
    if (query.sourceSystem) {
      items = items.filter((entity) =>
        entity.sourceSystems.includes(query.sourceSystem!),
      );
    }
    if (query.ids?.length) {
      const set = new Set(query.ids);
      items = items.filter((entity) => set.has(entity.id));
    }
    if (typeof query.minImportance === "number") {
      items = items.filter(
        (entity) => entity.importance >= query.minImportance!,
      );
    }
    if (query.labelIncludes) {
      const needle = query.labelIncludes.toLowerCase();
      items = items.filter((entity) =>
        entity.label.toLowerCase().includes(needle),
      );
    }
    items.sort((a, b) => b.importance - a.importance);
    return items.slice(0, query.limit ?? items.length);
  }

  /** Versioned snapshot of current organisational state. */
  snapshot(label = "manual"): TwinSnapshotVersion {
    const createdAt = this.latestTimestamp();
    const version: TwinSnapshotVersion = {
      id: `twin-snap-${this.versions.length + 1}`,
      label,
      createdAt,
      state: this.getState(),
      eventIds: this.events.map((event) => event.id),
    };
    this.versions.push(version);
    this.publish({
      kind: "snapshot_taken",
      at: createdAt,
      versionId: version.id,
      detail: `Snapshot ${version.id} (${label})`,
    });
    return version;
  }

  listVersions(): TwinSnapshotVersion[] {
    return [...this.versions];
  }

  getVersion(versionId: string): TwinSnapshotVersion | undefined {
    return this.versions.find((version) => version.id === versionId);
  }

  /** Full event history, optionally for one entity. */
  history(entityId?: string): BusinessEvent[] {
    const items = entityId
      ? this.events.filter(
          (event) =>
            event.entityId === entityId ||
            event.relationships.some((rel) => rel.targetEntityId === entityId),
        )
      : [...this.events];
    return items.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
  }

  /**
   * Replay events into a fresh state projection.
   * If toVersionId is set, replay only events captured in that snapshot.
   */
  replay(toVersionId?: string): TwinState {
    const twin = new EnterpriseDigitalTwin({ source: `${this.source}:replay` });
    const eventIds = toVersionId
      ? new Set(this.getVersion(toVersionId)?.eventIds ?? [])
      : null;
    const events = eventIds
      ? this.events.filter((event) => eventIds.has(event.id))
      : this.events;
    twin.apply(events);
    if (toVersionId) twin.snapshot(`replay:${toVersionId}`);
    this.publish({
      kind: "replayed",
      at: twin.getState().asOf,
      versionId: toVersionId,
      detail: `Replayed ${events.length} event(s)`,
    });
    return twin.getState();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private upsertEntityFromEvent(event: BusinessEvent): TwinEntity {
    const existing = this.entities.get(event.entityId);
    const label =
      stringProp(event.payload, "name") ??
      stringProp(event.payload, "subject") ??
      stringProp(event.payload, "summary") ??
      stringProp(event.payload, "label") ??
      stringProp(event.payload, "question") ??
      event.entityId;

    const status =
      stringProp(event.payload, "status") ??
      stringProp(event.payload, "stage") ??
      existing?.status;

    const sourceSystems = unique([
      ...(existing?.sourceSystems ?? []),
      String(event.sourceSystem),
    ]);

    const entity: TwinEntity = {
      id: event.entityId,
      type: event.entityType,
      label,
      status,
      importance: Math.max(existing?.importance ?? 0, event.importance),
      confidence: Math.max(existing?.confidence ?? 0, event.confidence),
      sourceSystems,
      properties: {
        ...(existing?.properties ?? {}),
        ...event.payload,
        lastEventType: event.eventType,
        lastEventId: event.id,
      },
      relatedIds: existing?.relatedIds ?? [],
      updatedAt: event.timestamp,
      version: (existing?.version ?? 0) + 1,
    };

    this.entities.set(entity.id, entity);
    return entity;
  }

  private publish(change: TwinChangeEvent): void {
    for (const listener of this.listeners) listener(change);
  }

  private latestTimestamp(): string {
    if (this.events.length === 0) return new Date(0).toISOString();
    return this.events.reduce(
      (latest, event) => (event.timestamp > latest ? event.timestamp : latest),
      this.events[0].timestamp,
    );
  }
}

function stringProp(
  payload: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
