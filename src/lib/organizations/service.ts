import {
  acceptOrganizationInvitationRecord,
  archiveOrganizationRecord,
  insertDefaultDepartments,
  insertOrganizationInvitationRecord,
  insertOrganizationMemberRecord,
  insertOrganizationRecord,
  removeOrganizationMemberRecord,
  revokeOrganizationInvitationRecord,
  updateOrganizationMemberRecord,
  updateOrganizationRecord,
  upsertActiveOrganizationPreference,
} from "@/lib/organizations/mutations";
import {
  canArchiveOrganization,
  canManageMembers,
  canUpdateMemberRoles,
  canUpdateOrganizationSettings,
  hasOrganizationPermission,
} from "@/lib/organizations/permissions";
import {
  fetchActiveMembership,
  fetchInvitationByCode,
  fetchMemberById,
  fetchOrganizationById,
  fetchOrganizationDepartments,
  fetchOrganizationInvitations,
  fetchOrganizationMembers,
  fetchPendingInvitationsForEmail,
  fetchUserMemberships,
  userHasActiveOrganization,
} from "@/lib/organizations/queries";
import type {
  CreateOrganizationInput,
  InviteMemberInput,
  JoinOrganizationByCodeInput,
  OrganizationInvitationRecord,
  OrganizationMemberRecord,
  OrganizationMembership,
  OrganizationRecord,
  PendingInvitationView,
  UpdateMemberRoleInput,
  UpdateOrganizationInput,
} from "@/lib/organizations/types";
import { OrganizationError } from "@/lib/organizations/types";
import {
  normalizeInvitationCode,
  validateCreateOrganizationInput,
  validateInviteMemberInput,
  validateJoinByCodeInput,
  validateUpdateOrganizationInput,
} from "@/lib/organizations/validation";
import { assertSeatAvailable, ensureOrganizationSubscription } from "@/lib/billing/service";

const INVITATION_TTL_DAYS = 14;

function invitationExpiryDate(): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + INVITATION_TTL_DAYS);
  return expires.toISOString();
}

async function requireMembership(
  userId: string,
  organizationId?: string,
): Promise<OrganizationMembership> {
  const membership = organizationId
    ? await fetchUserMemberships(userId).then((items) =>
        items.find((item) => item.organization.id === organizationId) ?? null,
      )
    : await fetchActiveMembership(userId);

  if (!membership) {
    throw new OrganizationError(
      "Organization membership required.",
      "NOT_MEMBER",
    );
  }

  return membership;
}

function assertPermission(
  membership: OrganizationMembership,
  permission: Parameters<typeof hasOrganizationPermission>[1],
): void {
  if (!hasOrganizationPermission(membership.member.role, permission)) {
    throw new OrganizationError("Permission denied.", "FORBIDDEN");
  }
}

export async function createOrganization(
  userId: string,
  email: string | null,
  displayName: string | null,
  input: CreateOrganizationInput,
): Promise<OrganizationMembership> {
  const validated = validateCreateOrganizationInput(input);
  const organization = await insertOrganizationRecord(userId, validated);

  const member = await insertOrganizationMemberRecord({
    organizationId: organization.id,
    userId,
    role: "owner",
    email,
    displayName,
    joinedAt: new Date().toISOString(),
  });

  await upsertActiveOrganizationPreference(userId, organization.id);

  await insertDefaultDepartments(organization.id, [
    {
      name: "Executive Office",
      description: "Senior leadership and strategic operations.",
    },
    {
      name: "Operations",
      description: "Cross-functional execution and delivery.",
    },
  ]);

  await ensureOrganizationSubscription(organization.id);

  return { organization, member };
}

export async function updateOrganization(
  userId: string,
  input: UpdateOrganizationInput,
): Promise<OrganizationRecord> {
  const membership = await requireMembership(userId);

  if (!canUpdateOrganizationSettings(membership.member.role)) {
    throw new OrganizationError("Permission denied.", "FORBIDDEN");
  }

  const validated = validateUpdateOrganizationInput(input);
  return updateOrganizationRecord(membership.organization.id, validated);
}

export async function archiveOrganization(userId: string): Promise<OrganizationRecord> {
  const membership = await requireMembership(userId);

  if (!canArchiveOrganization(membership.member.role)) {
    throw new OrganizationError("Permission denied.", "FORBIDDEN");
  }

  return archiveOrganizationRecord(membership.organization.id);
}

export async function inviteOrganizationMember(
  userId: string,
  input: InviteMemberInput,
): Promise<OrganizationInvitationRecord> {
  const membership = await requireMembership(userId);

  if (!canManageMembers(membership.member.role)) {
    throw new OrganizationError("Permission denied.", "FORBIDDEN");
  }

  await assertSeatAvailable(membership.organization.id);

  const validated = validateInviteMemberInput(input);
  const members = await fetchOrganizationMembers(membership.organization.id);

  if (
    members.some(
      (member) =>
        member.email?.toLowerCase() === validated.email &&
        member.status === "active",
    )
  ) {
    throw new OrganizationError(
      "This user is already a member of the organization.",
      "ALREADY_MEMBER",
    );
  }

  return insertOrganizationInvitationRecord({
    organizationId: membership.organization.id,
    email: validated.email,
    role: validated.role,
    invitedBy: userId,
    expiresAt: invitationExpiryDate(),
  });
}

export async function removeOrganizationMember(
  userId: string,
  memberId: string,
): Promise<void> {
  const membership = await requireMembership(userId);

  if (!canManageMembers(membership.member.role)) {
    throw new OrganizationError("Permission denied.", "FORBIDDEN");
  }

  const target = await fetchMemberById(memberId);

  if (!target || target.organization_id !== membership.organization.id) {
    throw new OrganizationError("Member not found.", "NOT_FOUND");
  }

  if (target.role === "owner") {
    throw new OrganizationError("Owners cannot be removed.", "FORBIDDEN");
  }

  if (target.user_id === userId) {
    throw new OrganizationError("You cannot remove yourself.", "FORBIDDEN");
  }

  await removeOrganizationMemberRecord(memberId);
}

export async function updateOrganizationMemberRole(
  userId: string,
  input: UpdateMemberRoleInput,
): Promise<OrganizationMemberRecord> {
  const membership = await requireMembership(userId);

  if (!canUpdateMemberRoles(membership.member.role)) {
    throw new OrganizationError("Permission denied.", "FORBIDDEN");
  }

  const target = await fetchMemberById(input.memberId);

  if (!target || target.organization_id !== membership.organization.id) {
    throw new OrganizationError("Member not found.", "NOT_FOUND");
  }

  if (target.role === "owner" || input.role === "owner") {
    throw new OrganizationError(
      "Owner role cannot be changed through this action.",
      "FORBIDDEN",
    );
  }

  return updateOrganizationMemberRecord(input.memberId, { role: input.role });
}

export async function joinOrganizationByInvitationCode(
  userId: string,
  email: string | null,
  displayName: string | null,
  input: JoinOrganizationByCodeInput,
): Promise<OrganizationMembership> {
  const validated = validateJoinByCodeInput(input);
  const invitation = await fetchInvitationByCode(
    normalizeInvitationCode(validated.invitationCode),
  );

  if (!invitation) {
    throw new OrganizationError("Invitation not found.", "NOT_FOUND");
  }

  return acceptInvitation(userId, email, displayName, invitation);
}

export async function joinOrganizationByInvitationId(
  userId: string,
  email: string | null,
  displayName: string | null,
  invitationId: string,
): Promise<OrganizationMembership> {
  const pending = await fetchPendingInvitationsForEmail(email ?? "");

  const invitation = pending.find((item) => item.id === invitationId);

  if (!invitation) {
    throw new OrganizationError("Invitation not found.", "NOT_FOUND");
  }

  return acceptInvitation(userId, email, displayName, invitation);
}

async function acceptInvitation(
  userId: string,
  email: string | null,
  displayName: string | null,
  invitation: OrganizationInvitationRecord | PendingInvitationView,
): Promise<OrganizationMembership> {
  if (invitation.status !== "pending") {
    throw new OrganizationError("Invitation is no longer valid.", "INVALID");
  }

  if (new Date(invitation.expires_at) < new Date()) {
    throw new OrganizationError("Invitation has expired.", "EXPIRED");
  }

  const organization = await fetchOrganizationById(invitation.organization_id);

  if (!organization) {
    throw new OrganizationError("Organization not found.", "NOT_FOUND");
  }

  if (
    email &&
    invitation.email.toLowerCase() !== email.toLowerCase()
  ) {
    throw new OrganizationError(
      "This invitation was sent to a different email address.",
      "FORBIDDEN",
    );
  }

  const existingMemberships = await fetchUserMemberships(userId);
  const existing = existingMemberships.find(
    (item) => item.organization.id === invitation.organization_id,
  );

  let member: OrganizationMemberRecord;

  if (existing) {
    member = await updateOrganizationMemberRecord(existing.member.id, {
      role: invitation.role,
      status: "active",
      email: email ?? invitation.email,
      display_name: displayName,
      joined_at: new Date().toISOString(),
    });
  } else {
    member = await insertOrganizationMemberRecord({
      organizationId: invitation.organization_id,
      userId,
      role: invitation.role,
      email: email ?? invitation.email,
      displayName,
      joinedAt: new Date().toISOString(),
      invitedAt: invitation.created_at,
    });
  }

  await acceptOrganizationInvitationRecord(invitation.id, userId);
  await upsertActiveOrganizationPreference(userId, invitation.organization_id);

  return { organization, member };
}

export async function getActiveOrganizationMembership(
  userId: string,
): Promise<OrganizationMembership | null> {
  return fetchActiveMembership(userId);
}

export async function listOrganizationMembers(
  userId: string,
): Promise<OrganizationMemberRecord[]> {
  const membership = await requireMembership(userId);
  assertPermission(membership, "members:read");
  return fetchOrganizationMembers(membership.organization.id);
}

export async function listOrganizationDepartments(userId: string) {
  const membership = await requireMembership(userId);
  assertPermission(membership, "departments:read");
  return fetchOrganizationDepartments(membership.organization.id);
}

export async function listPendingInvitations(userId: string) {
  const membership = await requireMembership(userId);
  assertPermission(membership, "members:read");
  return fetchOrganizationInvitations(membership.organization.id);
}

export async function listPendingInvitationsForUser(
  email: string | null,
): Promise<PendingInvitationView[]> {
  if (!email) {
    return [];
  }

  return fetchPendingInvitationsForEmail(email);
}

export async function revokeOrganizationInvitation(
  userId: string,
  invitationId: string,
): Promise<void> {
  const membership = await requireMembership(userId);

  if (!canManageMembers(membership.member.role)) {
    throw new OrganizationError("Permission denied.", "FORBIDDEN");
  }

  const invitations = await fetchOrganizationInvitations(
    membership.organization.id,
  );

  if (!invitations.some((invitation) => invitation.id === invitationId)) {
    throw new OrganizationError("Invitation not found.", "NOT_FOUND");
  }

  await revokeOrganizationInvitationRecord(invitationId);
}

export { userHasActiveOrganization };

export async function getOrganizationPageData(userId: string, email: string | null) {
  const [membership, pendingInvitations] = await Promise.all([
    fetchActiveMembership(userId),
    listPendingInvitationsForUser(email),
  ]);

  return { membership, pendingInvitations };
}

export async function getTeamPageData(userId: string) {
  const membership = await requireMembership(userId);

  const [members, invitations] = await Promise.all([
    fetchOrganizationMembers(membership.organization.id),
    fetchOrganizationInvitations(membership.organization.id),
  ]);

  return {
    membership,
    members,
    invitations,
  };
}

export async function getOrganizationSettingsData(userId: string) {
  const membership = await requireMembership(userId);
  assertPermission(membership, "settings:read");

  const departments = await fetchOrganizationDepartments(
    membership.organization.id,
  );

  return {
    membership,
    departments,
  };
}
