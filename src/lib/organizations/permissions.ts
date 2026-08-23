import type {
  OrganizationPermission,
  OrganizationRole,
} from "@/lib/organizations/types";

const ROLE_PERMISSIONS: Record<OrganizationRole, OrganizationPermission[]> = {
  owner: [
    "org:read",
    "org:update",
    "org:archive",
    "members:read",
    "members:invite",
    "members:remove",
    "members:update_role",
    "departments:read",
    "departments:manage",
    "settings:read",
    "settings:update",
    "intelligence:read",
  ],
  executive: [
    "org:read",
    "members:read",
    "members:invite",
    "departments:read",
    "settings:read",
    "intelligence:read",
  ],
  manager: [
    "org:read",
    "members:read",
    "members:invite",
    "departments:read",
    "settings:read",
    "intelligence:read",
  ],
  contributor: ["org:read", "members:read", "departments:read", "intelligence:read"],
  viewer: ["org:read", "members:read", "departments:read", "intelligence:read"],
};

export function getPermissionsForRole(
  role: OrganizationRole,
): OrganizationPermission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasOrganizationPermission(
  role: OrganizationRole,
  permission: OrganizationPermission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canManageMembers(role: OrganizationRole): boolean {
  return (
    hasOrganizationPermission(role, "members:invite") &&
    hasOrganizationPermission(role, "members:remove")
  );
}

export function canUpdateOrganizationSettings(role: OrganizationRole): boolean {
  return hasOrganizationPermission(role, "settings:update");
}

export function canArchiveOrganization(role: OrganizationRole): boolean {
  return hasOrganizationPermission(role, "org:archive");
}

export function canUpdateMemberRoles(role: OrganizationRole): boolean {
  return hasOrganizationPermission(role, "members:update_role");
}

/** Reserved for future SSO / external identity provider mapping. */
export type ExternalIdentityProvider = "saml" | "oidc" | "google" | "microsoft";

export type SsoRoleMapping = {
  provider: ExternalIdentityProvider;
  externalGroup: string;
  organizationRole: OrganizationRole;
};

export function mapExternalGroupToRole(
  mappings: SsoRoleMapping[],
  provider: ExternalIdentityProvider,
  externalGroup: string,
): OrganizationRole | null {
  const match = mappings.find(
    (mapping) =>
      mapping.provider === provider &&
      mapping.externalGroup.toLowerCase() === externalGroup.toLowerCase(),
  );

  return match?.organizationRole ?? null;
}
