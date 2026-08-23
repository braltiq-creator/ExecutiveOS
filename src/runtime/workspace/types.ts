/**
 * Workspaces — secure separation within a tenant.
 */

export const WORKSPACE_KINDS = [
  "corporate",
  "division",
  "transformation_office",
  "manda",
  "board",
  "crisis_response",
  "strategy",
  "innovation",
] as const;

export type WorkspaceKind = (typeof WORKSPACE_KINDS)[number];

export type Workspace = {
  id: string;
  tenantId: string;
  kind: WorkspaceKind;
  name: string;
  organisationScopeIds: string[];
  isolation: "strict" | "shared_read";
  featureOverrides: Record<string, boolean>;
  status: "active" | "archived";
};

export function createDefaultWorkspaces(tenantId: string): Workspace[] {
  return [
    {
      id: `${tenantId}-ws-corporate`,
      tenantId,
      kind: "corporate",
      name: "Corporate",
      organisationScopeIds: [],
      isolation: "shared_read",
      featureOverrides: {},
      status: "active",
    },
    {
      id: `${tenantId}-ws-board`,
      tenantId,
      kind: "board",
      name: "Board",
      organisationScopeIds: ["board-northline"],
      isolation: "strict",
      featureOverrides: { board_pack: true },
      status: "active",
    },
    {
      id: `${tenantId}-ws-strategy`,
      tenantId,
      kind: "strategy",
      name: "Strategy",
      organisationScopeIds: ["team-elt"],
      isolation: "shared_read",
      featureOverrides: { futures: true, agenda: true },
      status: "active",
    },
    {
      id: `${tenantId}-ws-crisis`,
      tenantId,
      kind: "crisis_response",
      name: "Crisis Response",
      organisationScopeIds: ["team-elt"],
      isolation: "strict",
      featureOverrides: { crisis_mode: true },
      status: "active",
    },
    {
      id: `${tenantId}-ws-transformation`,
      tenantId,
      kind: "transformation_office",
      name: "Transformation Office",
      organisationScopeIds: ["div-enterprise"],
      isolation: "shared_read",
      featureOverrides: {},
      status: "active",
    },
    {
      id: `${tenantId}-ws-manda`,
      tenantId,
      kind: "manda",
      name: "M&A",
      organisationScopeIds: ["team-elt"],
      isolation: "strict",
      featureOverrides: {},
      status: "active",
    },
    {
      id: `${tenantId}-ws-innovation`,
      tenantId,
      kind: "innovation",
      name: "Innovation",
      organisationScopeIds: ["bu-enterprise"],
      isolation: "shared_read",
      featureOverrides: {},
      status: "active",
    },
    {
      id: `${tenantId}-ws-division`,
      tenantId,
      kind: "division",
      name: "Division",
      organisationScopeIds: ["div-enterprise"],
      isolation: "shared_read",
      featureOverrides: {},
      status: "active",
    },
  ];
}

export function getWorkspace(
  workspaces: Workspace[],
  workspaceId: string,
): Workspace | undefined {
  return workspaces.find((w) => w.id === workspaceId && w.status === "active");
}
