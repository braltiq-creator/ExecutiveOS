export const ORGANIZATION_ROLES = [
  "owner",
  "executive",
  "manager",
  "contributor",
  "viewer",
] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const ORGANIZATION_MEMBER_STATUSES = [
  "active",
  "invited",
  "suspended",
  "removed",
] as const;

export type OrganizationMemberStatus =
  (typeof ORGANIZATION_MEMBER_STATUSES)[number];

export const ORGANIZATION_INVITATION_STATUSES = [
  "pending",
  "accepted",
  "revoked",
  "expired",
] as const;

export type OrganizationInvitationStatus =
  (typeof ORGANIZATION_INVITATION_STATUSES)[number];

export const SUBSCRIPTION_PLANS = ["free", "team", "enterprise"] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const ORGANIZATION_PERMISSIONS = [
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
] as const;

export type OrganizationPermission = (typeof ORGANIZATION_PERMISSIONS)[number];

export const ORGANIZATION_ROLE_LABELS: Record<OrganizationRole, string> = {
  owner: "Owner",
  executive: "Executive",
  manager: "Manager",
  contributor: "Contributor",
  viewer: "Viewer",
};

export const INVITABLE_ROLES = [
  "executive",
  "manager",
  "contributor",
  "viewer",
] as const;

export type InvitableRole = (typeof INVITABLE_ROLES)[number];

export type OrganizationRecord = {
  id: string;
  name: string;
  legal_name: string | null;
  industry: string | null;
  company_size: string | null;
  country: string | null;
  timezone: string;
  website: string | null;
  logo_url: string | null;
  subscription_plan: SubscriptionPlan;
  created_by: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationMemberRecord = {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  status: OrganizationMemberStatus;
  email: string | null;
  display_name: string | null;
  joined_at: string | null;
  invited_at: string | null;
  created_at: string;
};

export type OrganizationDepartmentRecord = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type OrganizationInvitationRecord = {
  id: string;
  organization_id: string;
  email: string;
  role: InvitableRole;
  invitation_code: string;
  invited_by: string;
  status: OrganizationInvitationStatus;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
};

export type OrganizationPermissionRecord = {
  id: string;
  name: string;
  description: string;
};

export type CreateOrganizationInput = {
  name: string;
  legalName?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  timezone: string;
  website?: string;
  logoUrl?: string;
};

export type UpdateOrganizationInput = {
  name?: string;
  legalName?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  timezone?: string;
  website?: string;
  logoUrl?: string;
};

export type InviteMemberInput = {
  email: string;
  role: InvitableRole;
};

export type JoinOrganizationByCodeInput = {
  invitationCode: string;
};

export type JoinOrganizationByEmailInput = {
  invitationId: string;
};

export type UpdateMemberRoleInput = {
  memberId: string;
  role: InvitableRole | "owner";
};

export type OrganizationMembership = {
  member: OrganizationMemberRecord;
  organization: OrganizationRecord;
};

export type OrganizationMemberView = OrganizationMemberRecord & {
  organizationName?: string;
};

export type PendingInvitationView = OrganizationInvitationRecord & {
  organizationName: string;
};

export class OrganizationError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "OrganizationError";
    this.code = code;
  }
}

export function formatOrganizationRole(role: OrganizationRole): string {
  return ORGANIZATION_ROLE_LABELS[role];
}

export function isInvitableRole(role: string): role is InvitableRole {
  return (INVITABLE_ROLES as readonly string[]).includes(role);
}
