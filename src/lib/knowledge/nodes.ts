import type { KnowledgeNodeInput, KnowledgeNodeType } from "@/lib/knowledge/types";

export function createNodeInput(input: KnowledgeNodeInput): KnowledgeNodeInput {
  return {
    ...input,
    summary: input.summary ?? null,
    metadata: input.metadata ?? {},
    labels: input.labels ?? [],
  };
}

export function executiveNode(input: {
  userId: string;
  label: string;
  summary?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "executive",
    sourceType: "executive_profile",
    sourceId: input.userId,
    label: input.label,
    summary: input.summary,
  });
}

export function organizationNode(input: {
  organizationId: string;
  label: string;
  summary?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "organization",
    sourceType: "organization",
    sourceId: input.organizationId,
    label: input.label,
    summary: input.summary,
  });
}

export function departmentNode(input: {
  departmentId: string;
  label: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "department",
    sourceType: "organization_department",
    sourceId: input.departmentId,
    label: input.label,
  });
}

export function personNode(input: {
  personId: string;
  label: string;
  email?: string | null;
  role?: string | null;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "person",
    sourceType: "person",
    sourceId: input.personId,
    label: input.label,
    summary: input.email ?? undefined,
    metadata: { email: input.email, role: input.role },
    labels: input.role ? [input.role] : [],
  });
}

export function meetingNode(input: {
  meetingId: string;
  label: string;
  summary?: string;
  date?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "meeting",
    sourceType: "executive_meeting",
    sourceId: input.meetingId,
    label: input.label,
    summary: input.summary,
    metadata: { date: input.date },
  });
}

export function decisionNode(input: {
  decisionId: string;
  label: string;
  summary?: string;
  owner?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "decision",
    sourceType: "executive_decision",
    sourceId: input.decisionId,
    label: input.label,
    summary: input.summary,
    metadata: { owner: input.owner },
  });
}

export function initiativeNode(input: {
  initiativeId: string;
  label: string;
  summary?: string;
  owner?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "initiative",
    sourceType: "strategic_initiative",
    sourceId: input.initiativeId,
    label: input.label,
    summary: input.summary,
    metadata: { owner: input.owner },
  });
}

export function objectiveNode(input: {
  objectiveId: string;
  label: string;
  summary?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "objective",
    sourceType: "strategic_objective",
    sourceId: input.objectiveId,
    label: input.label,
    summary: input.summary,
  });
}

export function memoryNode(input: {
  memoryId: string;
  label: string;
  summary?: string;
  memoryType?: string;
}): KnowledgeNodeInput {
  const nodeType = mapMemoryNodeType(input.memoryType);

  return createNodeInput({
    nodeType,
    sourceType: "executive_memory",
    sourceId: input.memoryId,
    label: input.label,
    summary: input.summary,
    metadata: { memoryType: input.memoryType },
    labels: input.memoryType ? [input.memoryType] : [],
  });
}

export function actionNode(input: {
  actionId: string;
  label: string;
  owner?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "action",
    sourceType: "meeting_action",
    sourceId: input.actionId,
    label: input.label,
    metadata: { owner: input.owner },
  });
}

export function calendarEventNode(input: {
  eventId: string;
  label: string;
  summary?: string;
  startsAt?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "calendar_event",
    sourceType: "calendar_event",
    sourceId: input.eventId,
    label: input.label,
    summary: input.summary,
    metadata: { startsAt: input.startsAt },
  });
}

export function emailNode(input: {
  emailId: string;
  label: string;
  summary?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "email",
    sourceType: "email",
    sourceId: input.emailId,
    label: input.label,
    summary: input.summary,
  });
}

export function documentNode(input: {
  documentId: string;
  label: string;
  summary?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "document",
    sourceType: "document",
    sourceId: input.documentId,
    label: input.label,
    summary: input.summary,
  });
}

export function taskNode(input: {
  taskId: string;
  label: string;
  summary?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "task",
    sourceType: "task",
    sourceId: input.taskId,
    label: input.label,
    summary: input.summary,
  });
}

export function crmOpportunityNode(input: {
  opportunityId: string;
  label: string;
  summary?: string;
}): KnowledgeNodeInput {
  return createNodeInput({
    nodeType: "crm_opportunity",
    sourceType: "crm_opportunity",
    sourceId: input.opportunityId,
    label: input.label,
    summary: input.summary,
  });
}

function mapMemoryNodeType(memoryType?: string): KnowledgeNodeType {
  const normalized = memoryType?.toLowerCase() ?? "";
  if (normalized === "risk") return "risk";
  if (normalized === "opportunity") return "opportunity";
  return "memory";
}