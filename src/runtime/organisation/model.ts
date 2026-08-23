/**
 * Organisational model — scope for every executive insight.
 */

export const ORG_NODE_KINDS = [
  "enterprise",
  "group",
  "division",
  "region",
  "business_unit",
  "department",
  "executive_team",
  "committee",
  "board",
] as const;

export type OrgNodeKind = (typeof ORG_NODE_KINDS)[number];

export type OrgNode = {
  id: string;
  kind: OrgNodeKind;
  name: string;
  parentId: string | null;
  region?: string;
  tenantId: string;
};

export type OrganisationModel = {
  tenantId: string;
  nodes: OrgNode[];
};

export function createNorthlineOrganisation(
  tenantId = "tenant-northline",
): OrganisationModel {
  const nodes: OrgNode[] = [
    {
      id: "org-northline",
      kind: "enterprise",
      name: "Northline",
      parentId: null,
      tenantId,
      region: "au",
    },
    {
      id: "div-enterprise",
      kind: "division",
      name: "Enterprise Software",
      parentId: "org-northline",
      tenantId,
    },
    {
      id: "bu-enterprise",
      kind: "business_unit",
      name: "Enterprise ARR",
      parentId: "div-enterprise",
      tenantId,
    },
    {
      id: "bu-field",
      kind: "business_unit",
      name: "Field Services",
      parentId: "org-northline",
      tenantId,
      region: "au",
    },
    {
      id: "region-au",
      kind: "region",
      name: "Australia",
      parentId: "org-northline",
      tenantId,
      region: "au",
    },
    {
      id: "team-elt",
      kind: "executive_team",
      name: "Executive Leadership Team",
      parentId: "org-northline",
      tenantId,
    },
    {
      id: "board-northline",
      kind: "board",
      name: "Northline Board",
      parentId: "org-northline",
      tenantId,
    },
    {
      id: "committee-risk",
      kind: "committee",
      name: "Risk Committee",
      parentId: "board-northline",
      tenantId,
    },
  ];
  return { tenantId, nodes };
}

export function nodesInScope(
  model: OrganisationModel,
  scopeIds: string[],
): OrgNode[] {
  if (scopeIds.length === 0) return model.nodes;
  const allowed = new Set(scopeIds);
  // Include descendants
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of model.nodes) {
      if (node.parentId && allowed.has(node.parentId) && !allowed.has(node.id)) {
        allowed.add(node.id);
        changed = true;
      }
    }
  }
  return model.nodes.filter((n) => allowed.has(n.id));
}

export function assertOrgScope(
  model: OrganisationModel,
  nodeId: string,
  scopeIds: string[],
): boolean {
  return nodesInScope(model, scopeIds).some((n) => n.id === nodeId);
}
