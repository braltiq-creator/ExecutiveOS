import type {
  EntityType,
  GraphEntity,
  GraphRelationship,
  GraphSnapshot,
  NeighborHit,
  RelationshipType,
  TraversalOptions,
} from "@/knowledge-graph/types";

/**
 * In-memory adjacency graph.
 * Swap for Neo4j by implementing the same query surface over a driver.
 */
export class KnowledgeGraph {
  private readonly entities = new Map<string, GraphEntity>();
  private readonly relationships = new Map<string, GraphRelationship>();
  private readonly out = new Map<string, string[]>();
  private readonly inn = new Map<string, string[]>();

  constructor(
    readonly meta: { asOf: string; source: string } = {
      asOf: new Date().toISOString(),
      source: "memory",
    },
  ) {}

  addEntity(entity: GraphEntity): void {
    this.entities.set(entity.id, entity);
    if (!this.out.has(entity.id)) this.out.set(entity.id, []);
    if (!this.inn.has(entity.id)) this.inn.set(entity.id, []);
  }

  addRelationship(relationship: GraphRelationship): void {
    if (!this.entities.has(relationship.fromId)) {
      throw new Error(
        `Unknown from entity: ${relationship.fromId} (${relationship.id})`,
      );
    }
    if (!this.entities.has(relationship.toId)) {
      throw new Error(
        `Unknown to entity: ${relationship.toId} (${relationship.id})`,
      );
    }
    this.relationships.set(relationship.id, relationship);
    this.out.get(relationship.fromId)!.push(relationship.id);
    this.inn.get(relationship.toId)!.push(relationship.id);
  }

  getEntity(id: string): GraphEntity | undefined {
    return this.entities.get(id);
  }

  requireEntity(id: string): GraphEntity {
    const entity = this.entities.get(id);
    if (!entity) throw new Error(`Unknown entity: ${id}`);
    return entity;
  }

  getRelationship(id: string): GraphRelationship | undefined {
    return this.relationships.get(id);
  }

  listEntities(type?: EntityType): GraphEntity[] {
    const all = [...this.entities.values()];
    return type ? all.filter((entity) => entity.type === type) : all;
  }

  listRelationships(type?: RelationshipType): GraphRelationship[] {
    const all = [...this.relationships.values()];
    return type ? all.filter((rel) => rel.type === type) : all;
  }

  neighbors(
    entityId: string,
    options: TraversalOptions = {},
  ): NeighborHit[] {
    const direction = options.direction ?? "both";
    const hits: NeighborHit[] = [];

    if (direction === "outgoing" || direction === "both") {
      for (const relId of this.out.get(entityId) ?? []) {
        const relationship = this.relationships.get(relId)!;
        if (
          options.relationshipTypes &&
          !options.relationshipTypes.includes(relationship.type)
        ) {
          continue;
        }
        const entity = this.entities.get(relationship.toId)!;
        if (options.entityTypes && !options.entityTypes.includes(entity.type)) {
          continue;
        }
        hits.push({ entity, relationship, direction: "outgoing" });
      }
    }

    if (direction === "incoming" || direction === "both") {
      for (const relId of this.inn.get(entityId) ?? []) {
        const relationship = this.relationships.get(relId)!;
        if (
          options.relationshipTypes &&
          !options.relationshipTypes.includes(relationship.type)
        ) {
          continue;
        }
        const entity = this.entities.get(relationship.fromId)!;
        if (options.entityTypes && !options.entityTypes.includes(entity.type)) {
          continue;
        }
        hits.push({ entity, relationship, direction: "incoming" });
      }
    }

    const limit = options.limit ?? hits.length;
    return hits.slice(0, limit);
  }

  snapshot(): GraphSnapshot {
    return {
      entities: this.listEntities(),
      relationships: this.listRelationships(),
      asOf: this.meta.asOf,
      source: this.meta.source,
    };
  }

  entityCount(): number {
    return this.entities.size;
  }

  relationshipCount(): number {
    return this.relationships.size;
  }
}
