"use server";

import { requireAuth } from "@/lib/auth/actions";
import {
  archiveOrganization,
  createOrganization,
  getActiveOrganizationMembership,
  getOrganizationPageData,
  getOrganizationSettingsData,
  getTeamPageData,
  inviteOrganizationMember,
  joinOrganizationByInvitationCode,
  joinOrganizationByInvitationId,
  listPendingInvitationsForUser,
  removeOrganizationMember,
  revokeOrganizationInvitation,
  updateOrganization,
  updateOrganizationMemberRole,
  userHasActiveOrganization,
} from "@/lib/organizations/service";
import type {
  CreateOrganizationInput,
  InviteMemberInput,
  JoinOrganizationByCodeInput,
  OrganizationMembership,
  OrganizationRecord,
  PendingInvitationView,
  UpdateMemberRoleInput,
  UpdateOrganizationInput,
} from "@/lib/organizations/types";
import { getSeatLicenseSnapshot } from "@/lib/billing/service";
import { BillingError } from "@/lib/billing/types";
import type { SeatLicenseSnapshot } from "@/lib/billing/types";
import { OrganizationError } from "@/lib/organizations/types";
import { redirect } from "next/navigation";

export type OrganizationActionResult<T> = {
  error: string | null;
  data: T | null;
};

function formatError(error: unknown): string {
  if (
    error instanceof OrganizationError ||
    error instanceof BillingError ||
    error instanceof Error
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function requireOrganizationMembership(): Promise<OrganizationMembership> {
  const user = await requireAuth();
  const membership = await getActiveOrganizationMembership(user.id);

  if (!membership) {
    redirect("/organization");
  }

  return membership;
}

export async function checkUserHasOrganization(userId: string): Promise<boolean> {
  return userHasActiveOrganization(userId);
}

export async function loadOrganizationSetupPageData(): Promise<{
  membership: OrganizationMembership | null;
  pendingInvitations: PendingInvitationView[];
}> {
  const user = await requireAuth();
  return getOrganizationPageData(user.id, user.email ?? null);
}

export async function createOrganizationAction(
  input: CreateOrganizationInput,
): Promise<OrganizationActionResult<OrganizationMembership>> {
  try {
    const user = await requireAuth();
    const data = await createOrganization(
      user.id,
      user.email ?? null,
      user.user_metadata?.full_name ?? null,
      input,
    );

    return { error: null, data };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function updateOrganizationAction(
  input: UpdateOrganizationInput,
): Promise<OrganizationActionResult<OrganizationRecord>> {
  try {
    const user = await requireAuth();
    const data = await updateOrganization(user.id, input);
    return { error: null, data };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function archiveOrganizationAction(): Promise<
  OrganizationActionResult<OrganizationRecord>
> {
  try {
    const user = await requireAuth();
    const data = await archiveOrganization(user.id);
    return { error: null, data };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function inviteMemberAction(
  input: InviteMemberInput,
): Promise<
  OrganizationActionResult<{ invitationCode: string; email: string }>
> {
  try {
    const user = await requireAuth();
    const invitation = await inviteOrganizationMember(user.id, input);

    return {
      error: null,
      data: {
        invitationCode: invitation.invitation_code,
        email: invitation.email,
      },
    };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function removeMemberAction(
  memberId: string,
): Promise<OrganizationActionResult<null>> {
  try {
    const user = await requireAuth();
    await removeOrganizationMember(user.id, memberId);
    return { error: null, data: null };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function updateMemberRoleAction(
  input: UpdateMemberRoleInput,
): Promise<OrganizationActionResult<null>> {
  try {
    const user = await requireAuth();
    await updateOrganizationMemberRole(user.id, input);
    return { error: null, data: null };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function joinByInvitationCodeAction(
  input: JoinOrganizationByCodeInput,
): Promise<OrganizationActionResult<OrganizationMembership>> {
  try {
    const user = await requireAuth();
    const data = await joinOrganizationByInvitationCode(
      user.id,
      user.email ?? null,
      user.user_metadata?.full_name ?? null,
      input,
    );

    return { error: null, data };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function joinByInvitationIdAction(
  invitationId: string,
): Promise<OrganizationActionResult<OrganizationMembership>> {
  try {
    const user = await requireAuth();
    const data = await joinOrganizationByInvitationId(
      user.id,
      user.email ?? null,
      user.user_metadata?.full_name ?? null,
      invitationId,
    );

    return { error: null, data };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function revokeInvitationAction(
  invitationId: string,
): Promise<OrganizationActionResult<null>> {
  try {
    const user = await requireAuth();
    await revokeOrganizationInvitation(user.id, invitationId);
    return { error: null, data: null };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function loadTeamPageData(): Promise<{
  membership: OrganizationMembership;
  members: Awaited<ReturnType<typeof getTeamPageData>>["members"];
  invitations: Awaited<ReturnType<typeof getTeamPageData>>["invitations"];
  seatLicense: SeatLicenseSnapshot;
}> {
  const user = await requireAuth();
  await requireOrganizationMembership();
  const data = await getTeamPageData(user.id);
  const seatLicense = await getSeatLicenseSnapshot(data.membership.organization.id);

  return {
    ...data,
    seatLicense,
  };
}

export async function loadOrganizationSettingsPageData() {
  const user = await requireAuth();
  await requireOrganizationMembership();
  return getOrganizationSettingsData(user.id);
}

export async function loadPendingInvitationsForCurrentUser() {
  const user = await requireAuth();
  return listPendingInvitationsForUser(user.email ?? null);
}
