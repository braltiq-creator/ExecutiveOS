import type { InitiativeLinkType } from "@/lib/initiatives/types";
import type { KnowledgeEdgeInput, KnowledgeEdgeType } from "@/lib/knowledge/types";

export function createEdgeInput(input: KnowledgeEdgeInput): KnowledgeEdgeInput {
  return {
    ...input,
    weight: input.weight ?? 1,
    metadata: input.metadata ?? {},
  };
}

export function ownsEdge(sourceKey: string, targetKey: string): KnowledgeEdgeInput {
  return createEdgeInput({ sourceKey, targetKey, edgeType: "owns" });
}

export function attendedEdge(sourceKey: string, targetKey: string): KnowledgeEdgeInput {
  return createEdgeInput({ sourceKey, targetKey, edgeType: "attended" });
}

export function relatedToEdge(sourceKey: string, targetKey: string): KnowledgeEdgeInput {
  return createEdgeInput({ sourceKey, targetKey, edgeType: "related_to" });
}

export function supportsEdge(sourceKey: string, targetKey: string): KnowledgeEdgeInput {
  return createEdgeInput({ sourceKey, targetKey, edgeType: "supports" });
}

export function blocksEdge(sourceKey: string, targetKey: string): KnowledgeEdgeInput {
  return createEdgeInput({ sourceKey, targetKey, edgeType: "blocks" });
}

export function referencesEdge(sourceKey: string, targetKey: string): KnowledgeEdgeInput {
  return createEdgeInput({ sourceKey, targetKey, edgeType: "references" });
}

export function assignedToEdge(sourceKey: string, targetKey: string): KnowledgeEdgeInput {
  return createEdgeInput({ sourceKey, targetKey, edgeType: "assigned_to" });
}

export function connectedToEdge(sourceKey: string, targetKey: string): KnowledgeEdgeInput {
  return createEdgeInput({ sourceKey, targetKey, edgeType: "connected_to" });
}

export function generatedEdge(sourceKey: string, targetKey: string): KnowledgeEdgeInput {
  return createEdgeInput({ sourceKey, targetKey, edgeType: "generated" });
}

export function dependsOnEdge(sourceKey: string, targetKey: string): KnowledgeEdgeInput {
  return createEdgeInput({ sourceKey, targetKey, edgeType: "depends_on" });
}

export function mapInitiativeLinkToEdgeType(
  linkType: InitiativeLinkType,
): KnowledgeEdgeType {
  switch (linkType) {
    case "objective":
      return "supports";
    case "decision":
      return "references";
    case "meeting":
      return "related_to";
    case "memory":
      return "references";
    case "meeting_action":
      return "assigned_to";
    case "risk":
      return "blocks";
    case "opportunity":
      return "supports";
    default:
      return "related_to";
  }
}

export function mapInitiativeLinkSourceType(linkType: InitiativeLinkType): string {
  switch (linkType) {
    case "objective":
      return "strategic_objective";
    case "decision":
      return "executive_decision";
    case "meeting":
      return "executive_meeting";
    case "memory":
      return "executive_memory";
    case "meeting_action":
      return "meeting_action";
    case "risk":
      return "executive_memory";
    case "opportunity":
      return "executive_memory";
    default:
      return linkType;
  }
}
