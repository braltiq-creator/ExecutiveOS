"use server";

import { requireAuth } from "@/lib/auth/actions";
import {
  expandKnowledgeNode,
  loadGraphPageData,
  queryKnowledgeGraph,
  rebuildKnowledgeGraph,
  searchKnowledgeGraph,
} from "@/lib/knowledge/service";
import type {
  GraphPageData,
  GraphQueryResult,
  GraphSearchResult,
  KnowledgeGraphBuildResult,
  KnowledgeGraphView,
  KnowledgeSearchFilter,
} from "@/lib/knowledge/types";
import { KnowledgeGraphError } from "@/lib/knowledge/types";
import { OrganizationError } from "@/lib/organizations/types";
import { fetchActiveMembership } from "@/lib/organizations/queries";

export type KnowledgeActionResult<T> = {
  error: string | null;
  data: T | null;
};

function formatError(error: unknown): string {
  if (
    error instanceof KnowledgeGraphError ||
    error instanceof OrganizationError ||
    error instanceof Error
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function loadGraphPageDataAction(): Promise<GraphPageData> {
  const user = await requireAuth();
  return loadGraphPageData(user.id);
}

export async function rebuildGraphAction(): Promise<
  KnowledgeActionResult<KnowledgeGraphBuildResult>
> {
  try {
    const user = await requireAuth();
    const data = await rebuildKnowledgeGraph(user.id);
    return { error: null, data };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function searchGraphAction(input: {
  query: string;
  filter?: KnowledgeSearchFilter;
}): Promise<KnowledgeActionResult<GraphSearchResult[]>> {
  try {
    const user = await requireAuth();
    const membership = await fetchActiveMembership(user.id);

    if (!membership) {
      throw new KnowledgeGraphError("Organization membership required.", "NOT_MEMBER");
    }

    const data = await searchKnowledgeGraph({
      organizationId: membership.organization.id,
      query: input.query,
      filter: input.filter,
    });

    return { error: null, data };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function queryGraphAction(input: {
  queryType: string;
  term: string;
}): Promise<KnowledgeActionResult<GraphQueryResult>> {
  try {
    const user = await requireAuth();
    const membership = await fetchActiveMembership(user.id);

    if (!membership) {
      throw new KnowledgeGraphError("Organization membership required.", "NOT_MEMBER");
    }

    const data = await queryKnowledgeGraph({
      organizationId: membership.organization.id,
      queryType: input.queryType,
      term: input.term,
    });

    return { error: null, data };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function expandGraphNodeAction(input: {
  nodeId: string;
  depth?: number;
}): Promise<KnowledgeActionResult<KnowledgeGraphView>> {
  try {
    const user = await requireAuth();
    const membership = await fetchActiveMembership(user.id);

    if (!membership) {
      throw new KnowledgeGraphError("Organization membership required.", "NOT_MEMBER");
    }

    const data = await expandKnowledgeNode(
      membership.organization.id,
      input.nodeId,
      input.depth ?? 1,
    );

    return { error: null, data };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}
