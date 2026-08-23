"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  inviteMemberAction,
  removeMemberAction,
  revokeInvitationAction,
  updateMemberRoleAction,
} from "@/lib/organizations/actions";
import {
  canManageMembers,
  canUpdateMemberRoles,
} from "@/lib/organizations/permissions";
import {
  formatOrganizationRole,
  INVITABLE_ROLES,
  ORGANIZATION_ROLE_LABELS,
  type InvitableRole,
  type OrganizationInvitationRecord,
  type OrganizationMemberRecord,
  type OrganizationMembership,
} from "@/lib/organizations/types";

type TeamManagementProps = {
  membership: OrganizationMembership;
  initialMembers: OrganizationMemberRecord[];
  initialInvitations: OrganizationInvitationRecord[];
  seatLicense: {
    seatsUsed: number;
    seatLimit: number;
    seatsAvailable: number;
    pendingInvitations: number;
    isAtLimit: boolean;
    isOverLimit: boolean;
  };
};

const inputClassName =
  "block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

export function TeamManagement({
  membership,
  initialMembers,
  initialInvitations,
  seatLicense,
}: TeamManagementProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitableRole>("contributor");
  const [error, setError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canInvite = canManageMembers(membership.member.role);
  const canChangeRoles = canUpdateMemberRoles(membership.member.role);

  function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInviteSuccess(null);

    startTransition(async () => {
      const result = await inviteMemberAction({ email, role });

      if (result.error || !result.data) {
        setError(result.error ?? "Unable to send invitation.");
        return;
      }

      setInviteSuccess(
        `Invitation sent to ${result.data.email}. Code: ${result.data.invitationCode}`,
      );
      setEmail("");
      router.refresh();
    });
  }

  function handleRemove(memberId: string) {
    setError(null);

    startTransition(async () => {
      const result = await removeMemberAction(memberId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setMembers((current) => current.filter((member) => member.id !== memberId));
      router.refresh();
    });
  }

  function handleRoleChange(memberId: string, nextRole: InvitableRole) {
    setError(null);

    startTransition(async () => {
      const result = await updateMemberRoleAction({ memberId, role: nextRole });

      if (result.error) {
        setError(result.error);
        return;
      }

      setMembers((current) =>
        current.map((member) =>
          member.id === memberId ? { ...member, role: nextRole } : member,
        ),
      );
      router.refresh();
    });
  }

  function handleRevokeInvitation(invitationId: string) {
    setError(null);

    startTransition(async () => {
      const result = await revokeInvitationAction(invitationId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setInvitations((current) =>
        current.filter((invitation) => invitation.id !== invitationId),
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-zinc-500">Team</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {membership.organization.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Manage executive team members, roles, and pending invitations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Seats Used
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {seatLicense.seatsUsed} / {seatLicense.seatLimit}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Available Seats
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {seatLicense.seatsAvailable}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Pending Invitations
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {seatLicense.pendingInvitations}
          </p>
        </div>
      </div>

      {seatLicense.isAtLimit ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Seat limit reached. Upgrade your plan or revoke pending invitations before
          inviting more team members.
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {inviteSuccess ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          {inviteSuccess}
        </div>
      ) : null}

      {canInvite ? (
        <form
          onSubmit={handleInvite}
          className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Invite Member
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_180px_auto]">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
                placeholder="executive@company.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Role
              </label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as InvitableRole)}
                className={inputClassName}
              >
                {INVITABLE_ROLES.map((item) => (
                  <option key={item} value={item}>
                    {ORGANIZATION_ROLE_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-[42px] w-full items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 sm:w-auto"
              >
                Invite
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {invitations.length > 0 ? (
        <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            Pending Invitations
          </h2>
          <div className="mt-6 space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900">{invitation.email}</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {formatOrganizationRole(invitation.role)} · Code:{" "}
                    <span className="font-mono">{invitation.invitation_code}</span>
                  </p>
                </div>
                {canInvite ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRevokeInvitation(invitation.id)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60"
                  >
                    Revoke
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
          Team Members
        </h2>
        <div className="mt-6 space-y-3">
          {members
            .filter((member) => member.status !== "removed")
            .map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {member.display_name || member.email || "Team member"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {member.email ?? "No email recorded"} ·{" "}
                    {formatOrganizationRole(member.role)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canChangeRoles &&
                  member.role !== "owner" &&
                  member.user_id !== membership.member.user_id ? (
                    <select
                      value={member.role}
                      disabled={isPending}
                      onChange={(event) =>
                        handleRoleChange(
                          member.id,
                          event.target.value as InvitableRole,
                        )
                      }
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                    >
                      {INVITABLE_ROLES.map((item) => (
                        <option key={item} value={item}>
                          {ORGANIZATION_ROLE_LABELS[item]}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  {canInvite &&
                  member.role !== "owner" &&
                  member.user_id !== membership.member.user_id ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRemove(member.id)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
