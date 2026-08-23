/**
 * Enterprise RBAC — roles, permissions, inheritance, delegation, temporary access.
 */

export const RUNTIME_ROLES = [
  "ceo",
  "executive",
  "board_member",
  "chief_of_staff",
  "executive_assistant",
  "division_leader",
  "business_unit_leader",
  "analyst",
  "administrator",
  "platform_administrator",
  "support",
  "custom",
] as const;

export type RuntimeRole = (typeof RUNTIME_ROLES)[number];

export const RUNTIME_PERMISSIONS = [
  "tenant:read",
  "tenant:admin",
  "workspace:read",
  "workspace:admin",
  "intelligence:read",
  "intelligence:brief",
  "decisions:read",
  "decisions:write",
  "council:read",
  "futures:read",
  "agenda:read",
  "agenda:write",
  "connectors:read",
  "connectors:admin",
  "knowledge_packs:activate",
  "context_providers:activate",
  "audit:read",
  "billing:read",
  "billing:admin",
  "users:read",
  "users:admin",
  "policy:admin",
  "export:data",
  "support:impersonate",
] as const;

export type RuntimePermission = (typeof RUNTIME_PERMISSIONS)[number];

export type RoleDefinition = {
  id: RuntimeRole;
  label: string;
  inherits: RuntimeRole[];
  permissions: RuntimePermission[];
};

export type TemporaryAccessGrant = {
  id: string;
  userId: string;
  role: RuntimeRole;
  permissions: RuntimePermission[];
  startsAt: string;
  endsAt: string;
  grantedBy: string;
  reason: string;
};

export type DelegatedAdminGrant = {
  id: string;
  fromUserId: string;
  toUserId: string;
  permissions: RuntimePermission[];
  scope: "tenant" | "workspace" | "business_unit";
  scopeId: string;
};

const ROLE_DEFS: Record<RuntimeRole, RoleDefinition> = {
  ceo: {
    id: "ceo",
    label: "CEO",
    inherits: ["executive"],
    permissions: [
      "tenant:read",
      "workspace:read",
      "intelligence:read",
      "intelligence:brief",
      "decisions:read",
      "decisions:write",
      "council:read",
      "futures:read",
      "agenda:read",
      "agenda:write",
      "connectors:read",
      "audit:read",
      "export:data",
    ],
  },
  executive: {
    id: "executive",
    label: "Executive",
    inherits: [],
    permissions: [
      "workspace:read",
      "intelligence:read",
      "intelligence:brief",
      "decisions:read",
      "decisions:write",
      "council:read",
      "futures:read",
      "agenda:read",
      "connectors:read",
    ],
  },
  board_member: {
    id: "board_member",
    label: "Board Member",
    inherits: [],
    permissions: [
      "workspace:read",
      "intelligence:read",
      "intelligence:brief",
      "decisions:read",
      "council:read",
      "futures:read",
      "agenda:read",
      "audit:read",
    ],
  },
  chief_of_staff: {
    id: "chief_of_staff",
    label: "Chief of Staff",
    inherits: ["executive"],
    permissions: [
      "workspace:admin",
      "agenda:write",
      "users:read",
      "connectors:read",
      "audit:read",
    ],
  },
  executive_assistant: {
    id: "executive_assistant",
    label: "Executive Assistant",
    inherits: [],
    permissions: [
      "workspace:read",
      "intelligence:read",
      "intelligence:brief",
      "decisions:read",
      "agenda:read",
    ],
  },
  division_leader: {
    id: "division_leader",
    label: "Division Leader",
    inherits: ["executive"],
    permissions: ["agenda:write", "decisions:write"],
  },
  business_unit_leader: {
    id: "business_unit_leader",
    label: "Business Unit Leader",
    inherits: ["executive"],
    permissions: ["decisions:write"],
  },
  analyst: {
    id: "analyst",
    label: "Analyst",
    inherits: [],
    permissions: [
      "workspace:read",
      "intelligence:read",
      "decisions:read",
      "futures:read",
      "agenda:read",
    ],
  },
  administrator: {
    id: "administrator",
    label: "Administrator",
    inherits: [],
    permissions: [
      "tenant:read",
      "workspace:admin",
      "users:admin",
      "connectors:admin",
      "knowledge_packs:activate",
      "context_providers:activate",
      "policy:admin",
      "audit:read",
      "billing:read",
    ],
  },
  platform_administrator: {
    id: "platform_administrator",
    label: "Platform Administrator",
    inherits: ["administrator"],
    permissions: [
      "tenant:admin",
      "billing:admin",
      "export:data",
      "support:impersonate",
    ],
  },
  support: {
    id: "support",
    label: "Support",
    inherits: [],
    permissions: ["tenant:read", "audit:read", "support:impersonate"],
  },
  custom: {
    id: "custom",
    label: "Custom Role",
    inherits: [],
    permissions: [],
  },
};

export function getRoleDefinition(role: RuntimeRole): RoleDefinition {
  return ROLE_DEFS[role];
}

export function resolvePermissions(
  role: RuntimeRole,
  extras: RuntimePermission[] = [],
): RuntimePermission[] {
  const seen = new Set<RuntimeRole>();
  const results = new Set<RuntimePermission>(extras);

  const walk = (current: RuntimeRole) => {
    if (seen.has(current)) return;
    seen.add(current);
    const def = ROLE_DEFS[current];
    for (const permission of def.permissions) results.add(permission);
    for (const parent of def.inherits) walk(parent);
  };

  walk(role);
  return [...results];
}

export function hasPermission(
  granted: RuntimePermission[],
  required: RuntimePermission,
): boolean {
  return granted.includes(required);
}

export function isTemporaryAccessActive(
  grant: TemporaryAccessGrant,
  asOf: string,
): boolean {
  const t = new Date(asOf).getTime();
  return (
    t >= new Date(grant.startsAt).getTime() &&
    t <= new Date(grant.endsAt).getTime()
  );
}

export function mergeDelegatedPermissions(
  base: RuntimePermission[],
  grants: DelegatedAdminGrant[],
  userId: string,
): RuntimePermission[] {
  const set = new Set(base);
  for (const grant of grants) {
    if (grant.toUserId !== userId) continue;
    for (const permission of grant.permissions) set.add(permission);
  }
  return [...set];
}
