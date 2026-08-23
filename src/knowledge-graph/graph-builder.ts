import { KnowledgeGraph } from "@/knowledge-graph/memory-graph";
import type {
  EntityType,
  GraphEntity,
  GraphRelationship,
  GraphSnapshot,
  RelationshipType,
} from "@/knowledge-graph/types";

type EntityInput = {
  id: string;
  type: EntityType;
  label: string;
  properties?: GraphEntity["properties"];
};

type RelationshipInput = {
  id?: string;
  type: RelationshipType;
  from: string;
  to: string;
  weight?: number;
  properties?: GraphRelationship["properties"];
};

/**
 * Fluent graph builder — assemble organisational reality as relationships.
 */
export class GraphBuilder {
  private readonly entityInputs: EntityInput[] = [];
  private readonly relationshipInputs: RelationshipInput[] = [];
  private asOf = new Date().toISOString();
  private source = "builder";

  withMeta(meta: { asOf?: string; source?: string }): this {
    if (meta.asOf) this.asOf = meta.asOf;
    if (meta.source) this.source = meta.source;
    return this;
  }

  entity(input: EntityInput): this {
    this.entityInputs.push(input);
    return this;
  }

  entities(inputs: EntityInput[]): this {
    for (const input of inputs) this.entity(input);
    return this;
  }

  relate(input: RelationshipInput): this {
    this.relationshipInputs.push(input);
    return this;
  }

  relateMany(inputs: RelationshipInput[]): this {
    for (const input of inputs) this.relate(input);
    return this;
  }

  build(): KnowledgeGraph {
    const graph = new KnowledgeGraph({ asOf: this.asOf, source: this.source });
    for (const entity of this.entityInputs) {
      graph.addEntity({
        id: entity.id,
        type: entity.type,
        label: entity.label,
        properties: entity.properties,
      });
    }
    let auto = 0;
    for (const rel of this.relationshipInputs) {
      auto += 1;
      graph.addRelationship({
        id: rel.id ?? `rel-auto-${auto}`,
        type: rel.type,
        fromId: rel.from,
        toId: rel.to,
        weight: rel.weight,
        properties: rel.properties,
      });
    }
    return graph;
  }

  /** Build from a portable snapshot (Neo4j export / fixture). */
  static fromSnapshot(snapshot: GraphSnapshot): KnowledgeGraph {
    const builder = new GraphBuilder().withMeta({
      asOf: snapshot.asOf,
      source: snapshot.source,
    });
    for (const entity of snapshot.entities) {
      builder.entity(entity);
    }
    for (const relationship of snapshot.relationships) {
      builder.relate({
        id: relationship.id,
        type: relationship.type,
        from: relationship.fromId,
        to: relationship.toId,
        weight: relationship.weight,
        properties: relationship.properties,
      });
    }
    return builder.build();
  }
}
