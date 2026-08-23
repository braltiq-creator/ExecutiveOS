/**
 * Knowledge Graph bootstrap from discoveries — confidence improves with evidence.
 */

import type { KnowledgeGraph } from "@/knowledge-graph";
import type { EntityType } from "@/knowledge-graph/types";
import type { DiscoveryItem } from "@/onboarding/types";

export type BootstrapResult = {
  tenantId: string;
  entitiesCreated: number;
  relationshipsCreated: number;
  completeness: number;
};

const KIND_TO_ENTITY: Partial<Record<DiscoveryItem["kind"], EntityType>> = {
  organisation_name: "Team",
  business_unit: "Department",
  department: "Department",
  executive_team_member: "Person",
  committee: "Team",
  board_meeting: "Meeting",
  leadership_meeting: "Meeting",
  governance_meeting: "Meeting",
  customer: "Customer",
  site: "System",
  asset: "System",
  project: "Project",
  job: "Action",
  technician: "Person",
  supplier: "Supplier",
  connector: "System",
  strategic_theme: "Objective",
  recurring_workflow: "Policy",
};

export function bootstrapKnowledgeGraph(input: {
  tenantId: string;
  graph: KnowledgeGraph;
  discoveries: DiscoveryItem[];
}): BootstrapResult {
  let entitiesCreated = 0;
  let relationshipsCreated = 0;

  // Tenant root — isolation anchor
  const orgId = `org-${input.tenantId}`;
  if (!input.graph.getEntity(orgId)) {
    input.graph.addEntity({
      id: orgId,
      type: "Team",
      label:
        input.discoveries.find((d) => d.kind === "organisation_name")?.label ??
        "Organisation",
      properties: { tenantId: input.tenantId, bootstrap: true },
    });
    entitiesCreated += 1;
  }

  for (const discovery of input.discoveries) {
    if (discovery.status === "ignored") continue;
    const type = KIND_TO_ENTITY[discovery.kind];
    if (!type) continue;

    const id =
      discovery.relatedEntityIds[0] ??
      `disc-entity-${discovery.id}`;

    if (!input.graph.getEntity(id)) {
      input.graph.addEntity({
        id,
        type,
        label: discovery.editableValue ?? discovery.label,
        properties: {
          tenantId: input.tenantId,
          confidence: discovery.confidence,
          source: discovery.source,
          kind: discovery.kind,
          bootstrap: true,
        },
      });
      entitiesCreated += 1;
    }

    input.graph.addRelationship({
      id: `rel-${orgId}-${id}`,
      type: "relates_to",
      fromId: orgId,
      toId: id,
      weight: discovery.confidence / 100,
    });
    relationshipsCreated += 1;
  }

  // Executive relationships among people
  const people = input.discoveries.filter(
    (d) =>
      d.kind === "executive_team_member" || d.kind === "technician",
  );
  for (const person of people) {
    const personId =
      person.relatedEntityIds[0] ?? `disc-entity-${person.id}`;
    input.graph.addRelationship({
      id: `rel-exec-${personId}`,
      type: "owned_by",
      fromId: personId,
      toId: orgId,
      weight: 0.6,
    });
    relationshipsCreated += 1;
  }

  const expectedKinds = 16;
  const covered = new Set(input.discoveries.map((d) => d.kind)).size;
  const completeness = Math.min(
    100,
    Math.round((covered / expectedKinds) * 100),
  );

  return {
    tenantId: input.tenantId,
    entitiesCreated,
    relationshipsCreated,
    completeness,
  };
}
