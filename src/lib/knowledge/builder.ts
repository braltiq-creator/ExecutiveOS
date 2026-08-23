import {
  assignedToEdge,
  attendedEdge,
  connectedToEdge,
  createEdgeInput,
  mapInitiativeLinkSourceType,
  mapInitiativeLinkToEdgeType,
  referencesEdge,
  relatedToEdge,
  supportsEdge,
} from "@/lib/knowledge/edges";
import { buildSearchText, semanticRelatedness, tokenizeSearchText } from "@/lib/knowledge/indexer";
import {
  actionNode,
  calendarEventNode,
  decisionNode,
  departmentNode,
  emailNode,
  executiveNode,
  initiativeNode,
  meetingNode,
  memoryNode,
  objectiveNode,
  organizationNode,
  personNode,
} from "@/lib/knowledge/nodes";
import {
  clearKnowledgeGraph,
  insertGraphSnapshot,
  replaceKnowledgeLabels,
  upsertKnowledgeEdge,
  upsertKnowledgeIndex,
  upsertKnowledgeNode,
} from "@/lib/knowledge/queries";
import type {
  KnowledgeEdgeInput,
  KnowledgeGraphBuildResult,
  KnowledgeNodeInput,
} from "@/lib/knowledge/types";
import { nodeKey as buildNodeKey } from "@/lib/knowledge/types";
import { loadExecutiveDecisionRecords } from "@/lib/intelligence/decisions";
import { loadExecutiveInitiativeRecords } from "@/lib/initiatives/intelligence";
import { loadExecutiveProfileRecord } from "@/lib/intelligence/profile";
import { loadStrategicObjectiveRecords } from "@/lib/intelligence/objectives";
import type { M365SyncPayload } from "@/lib/integrations/providers/microsoft365/types";
import { fetchOrganizationIntegrationByProvider } from "@/lib/integrations/queries";
import { fetchOrganizationDepartments, fetchOrganizationMembers } from "@/lib/organizations/queries";
import { fetchMeetingsWithActions } from "@/lib/meetings/queries";
import { fetchActiveMemory } from "@/lib/memory/queries";
import { createClient } from "@/lib/supabase/server";
import type { InitiativeLinkRecord } from "@/lib/initiatives/types";

type BuildContext = {
  organizationId: string;
  userId: string;
};

export async function buildKnowledgeGraphForUser(
  userId: string,
  organizationId: string,
): Promise<KnowledgeGraphBuildResult> {
  const ctx: BuildContext = { organizationId, userId };
  const nodeInputs: KnowledgeNodeInput[] = [];
  const edgeInputs: KnowledgeEdgeInput[] = [];
  const nodeIdMap = new Map<string, string>();

  const [
    profile,
    objectives,
    initiatives,
    decisions,
    memories,
    meetings,
    members,
    departments,
    initiativeLinks,
    integration,
  ] = await Promise.all([
    loadExecutiveProfileRecord(userId),
    loadStrategicObjectiveRecords(userId),
    loadExecutiveInitiativeRecords(userId),
    loadExecutiveDecisionRecords(userId),
    fetchActiveMemory(userId),
    fetchMeetingsWithActions(userId),
    fetchOrganizationMembers(organizationId),
    fetchOrganizationDepartments(organizationId),
    fetchInitiativeLinksForUser(userId),
    fetchOrganizationIntegrationByProvider(organizationId, "microsoft_365"),
  ]);

  if (profile) {
    nodeInputs.push(
      executiveNode({
        userId,
        label: profile.preferred_name || profile.full_name || "Executive",
        summary: `${profile.job_title} at ${profile.company}`,
      }),
    );
  }

  nodeInputs.push(
    organizationNode({
      organizationId,
      label: "Organization",
    }),
  );

  for (const department of departments) {
    nodeInputs.push(
      departmentNode({
        departmentId: department.id,
        label: department.name,
      }),
    );
    edgeInputs.push(
      connectedToEdge(
        buildNodeKey("organization", organizationId),
        buildNodeKey("organization_department", department.id),
      ),
    );
  }

  for (const member of members) {
    const memberKey = member.user_id ?? member.email ?? member.id;
    nodeInputs.push(
      personNode({
        personId: memberKey,
        label: member.display_name ?? member.email ?? "Team member",
        email: member.email,
        role: member.role,
      }),
    );
    edgeInputs.push(
      connectedToEdge(
        buildNodeKey("organization", organizationId),
        buildNodeKey("person", memberKey),
      ),
    );
  }

  for (const objective of objectives) {
    nodeInputs.push(
      objectiveNode({
        objectiveId: objective.id,
        label: objective.title,
        summary: objective.description ?? undefined,
      }),
    );
    edgeInputs.push(
      supportsEdge(
        buildNodeKey("strategic_objective", objective.id),
        buildNodeKey("organization", organizationId),
      ),
    );
  }

  for (const item of initiatives) {
    nodeInputs.push(
      initiativeNode({
        initiativeId: item.initiative.id,
        label: item.initiative.title,
        summary: item.initiative.description ?? undefined,
        owner: item.initiative.owner,
      }),
    );
  }

  for (const decision of decisions) {
    nodeInputs.push(
      decisionNode({
        decisionId: decision.id,
        label: decision.title,
        summary: decision.summary ?? undefined,
        owner: decision.owner,
      }),
    );

    if (decision.strategic_objective_id) {
      edgeInputs.push(
        supportsEdge(
          buildNodeKey("executive_decision", decision.id),
          buildNodeKey("strategic_objective", decision.strategic_objective_id),
        ),
      );
    }

    if (decision.owner) {
      edgeInputs.push(
        relatedToEdge(
          buildNodeKey("executive_decision", decision.id),
          buildNodeKey("person", decision.owner.toLowerCase()),
        ),
      );
    }
  }

  for (const memory of memories) {
    nodeInputs.push(
      memoryNode({
        memoryId: memory.id,
        label: memory.title,
        summary: memory.content ?? undefined,
        memoryType: memory.memory_type,
      }),
    );
  }

  for (const item of meetings) {
    nodeInputs.push(
      meetingNode({
        meetingId: item.meeting.id,
        label: item.meeting.title,
        summary: item.meeting.meeting_summary ?? item.meeting.raw_notes ?? undefined,
        date: item.meeting.meeting_date,
      }),
    );

    for (const participant of item.meeting.participants ?? []) {
      edgeInputs.push(
        attendedEdge(
          buildNodeKey("person", participant.toLowerCase()),
          buildNodeKey("executive_meeting", item.meeting.id),
        ),
      );
    }

    for (const action of item.actions) {
      nodeInputs.push(
        actionNode({
          actionId: action.id,
          label: action.title,
          owner: action.owner ?? undefined,
        }),
      );
      edgeInputs.push(
        assignedToEdge(
          buildNodeKey("meeting_action", action.id),
          buildNodeKey("executive_meeting", item.meeting.id),
        ),
      );
      if (action.owner) {
        edgeInputs.push(
          assignedToEdge(
            buildNodeKey("meeting_action", action.id),
            buildNodeKey("person", action.owner.toLowerCase()),
          ),
        );
      }
    }
  }

  for (const link of initiativeLinks) {
    const initiative = initiatives.find((item) => item.initiative.id === link.initiative_id);
    if (!initiative) continue;

    edgeInputs.push(
      createEdgeInput({
        sourceKey: buildNodeKey("strategic_initiative", link.initiative_id),
        targetKey: buildNodeKey(
          mapInitiativeLinkSourceType(link.link_type),
          link.linked_id,
        ),
        edgeType: mapInitiativeLinkToEdgeType(link.link_type),
      }),
    );
  }

  const payload = parseM365Payload(integration?.config_json ?? {});
  if (payload) {
    for (const event of payload.calendar.events) {
      nodeInputs.push(
        calendarEventNode({
          eventId: event.id,
          label: event.subject,
          summary: event.bodyPreview ?? undefined,
          startsAt: event.startsAt,
        }),
      );

      for (const attendee of event.attendees) {
        nodeInputs.push(
          personNode({
            personId: attendee.email || attendee.name,
            label: attendee.name,
            email: attendee.email,
          }),
        );
        edgeInputs.push(
          attendedEdge(
            buildNodeKey("person", attendee.email || attendee.name),
            buildNodeKey("calendar_event", event.id),
          ),
        );
      }

      for (const initiative of initiatives) {
        const score = semanticRelatedness(
          `${event.subject} ${event.bodyPreview ?? ""}`,
          initiative.initiative.title,
        );
        if (score >= 0.34) {
          edgeInputs.push(
            relatedToEdge(
              buildNodeKey("calendar_event", event.id),
              buildNodeKey("strategic_initiative", initiative.initiative.id),
            ),
          );
        }
      }
    }

    for (const message of payload.email.messages) {
      nodeInputs.push(
        emailNode({
          emailId: message.id,
          label: message.subject,
          summary: message.preview,
        }),
      );
    }
  }

  addSemanticMemoryEdges(nodeInputs, edgeInputs);

  await clearKnowledgeGraph(organizationId);

  for (const node of nodeInputs) {
    const record = await upsertKnowledgeNode({
      organizationId,
      userId,
      nodeType: node.nodeType,
      sourceType: node.sourceType,
      sourceId: node.sourceId,
      label: node.label,
      summary: node.summary,
      metadata: node.metadata,
    });

    nodeIdMap.set(buildNodeKey(node.sourceType, node.sourceId), record.id);

    if (node.labels?.length) {
      await replaceKnowledgeLabels(record.id, node.labels);
    }

    await upsertKnowledgeIndex({
      nodeId: record.id,
      searchText: buildSearchText(node),
    });
  }

  let edgeCount = 0;

  for (const edge of edgeInputs) {
    const sourceNodeId = nodeIdMap.get(edge.sourceKey);
    const targetNodeId = nodeIdMap.get(edge.targetKey);
    if (!sourceNodeId || !targetNodeId) continue;

    await upsertKnowledgeEdge({
      organizationId,
      sourceNodeId,
      targetNodeId,
      edgeType: edge.edgeType,
      weight: edge.weight,
      metadata: edge.metadata,
    });
    edgeCount += 1;
  }

  const snapshot = await insertGraphSnapshot({
    organizationId,
    userId,
    nodeCount: nodeInputs.length,
    edgeCount,
    snapshotJson: {
      builtAt: new Date().toISOString(),
      nodeTypes: countBy(nodeInputs, (node) => node.nodeType),
      edgeTypes: countBy(edgeInputs, (edge) => edge.edgeType),
    },
  });

  return {
    nodeCount: nodeInputs.length,
    edgeCount,
    snapshotId: snapshot.id,
  };
}

function addSemanticMemoryEdges(
  nodes: KnowledgeNodeInput[],
  edges: KnowledgeEdgeInput[],
): void {
  const memories = nodes.filter(
    (node) =>
      node.nodeType === "memory" ||
      node.nodeType === "risk" ||
      node.nodeType === "opportunity",
  );
  const linkable = nodes.filter((node) =>
    ["initiative", "objective", "decision", "meeting", "calendar_event"].includes(
      node.nodeType,
    ),
  );

  for (const memory of memories) {
    for (const target of linkable) {
      const score = semanticRelatedness(
        `${memory.label} ${memory.summary ?? ""}`,
        `${target.label} ${target.summary ?? ""}`,
      );

      if (score >= 0.34) {
        edges.push(
          relatedToEdge(
            buildNodeKey(memory.sourceType, memory.sourceId),
            buildNodeKey(target.sourceType, target.sourceId),
          ),
        );
      }
    }
  }
}

function parseM365Payload(config: Record<string, unknown>): M365SyncPayload | null {
  const payload = config.lastContextPayload;
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  if (record.providerId !== "microsoft_365") return null;
  return record as unknown as M365SyncPayload;
}

function countBy<T>(items: T[], selector: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = selector(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

async function fetchInitiativeLinksForUser(
  userId: string,
): Promise<InitiativeLinkRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("initiative_links")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as InitiativeLinkRecord[];
}
