/**
 * Executive membership — invite, roles, deactivate.
 */

import {
  getMembers,
  nextMemberId,
  setMembers,
} from "@/account/store";
import type { AccountMember, AccountRole } from "@/account/types";

const ROLE_PERMISSIONS: Record<AccountRole, string[]> = {
  owner: [
    "org.manage",
    "billing.manage",
    "executives.invite",
    "security.manage",
    "connectors.manage",
    "packs.manage",
  ],
  admin: [
    "org.manage",
    "executives.invite",
    "security.manage",
    "connectors.manage",
  ],
  executive: ["brief.read", "council.participate", "connectors.view"],
  viewer: ["brief.read"],
};

export function seedDefaultOwner(input: {
  organisationId: string;
  name: string;
  email: string;
  executiveProfileId?: string | null;
  asOf?: string;
}): AccountMember {
  const existing = getMembers(input.organisationId);
  const owner = existing.find((m) => m.role === "owner");
  if (owner) return owner;

  const member: AccountMember = {
    id: nextMemberId(),
    organisationId: input.organisationId,
    name: input.name,
    email: input.email.toLowerCase(),
    role: "owner",
    permissions: ROLE_PERMISSIONS.owner,
    executiveProfileId: input.executiveProfileId ?? null,
    status: "active",
    lastLoginAt: input.asOf ?? new Date().toISOString(),
    invitedAt: input.asOf ?? new Date().toISOString(),
    activitySummary: "Owner · provisioned workspace",
  };
  setMembers(input.organisationId, [member, ...existing]);
  return member;
}

export function inviteExecutive(input: {
  organisationId: string;
  name: string;
  email: string;
  role?: AccountRole;
  executiveProfileId?: string | null;
  asOf?: string;
}): AccountMember {
  const role = input.role ?? "executive";
  const list = getMembers(input.organisationId);
  const duplicate = list.find(
    (m) => m.email === input.email.toLowerCase() && m.status !== "deactivated",
  );
  if (duplicate) return duplicate;

  const member: AccountMember = {
    id: nextMemberId(),
    organisationId: input.organisationId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role,
    permissions: ROLE_PERMISSIONS[role],
    executiveProfileId: input.executiveProfileId ?? null,
    status: "invited",
    lastLoginAt: null,
    invitedAt: input.asOf ?? new Date().toISOString(),
    activitySummary: "Invitation sent",
  };
  setMembers(input.organisationId, [...list, member]);
  return member;
}

export function deactivateMember(
  organisationId: string,
  memberId: string,
): AccountMember | undefined {
  const list = getMembers(organisationId);
  const next = list.map((m) =>
    m.id === memberId
      ? {
          ...m,
          status: "deactivated" as const,
          activitySummary: "Deactivated",
        }
      : m,
  );
  setMembers(organisationId, next);
  return next.find((m) => m.id === memberId);
}

export function listExecutives(organisationId: string): AccountMember[] {
  return getMembers(organisationId);
}

export function updateMemberRole(
  organisationId: string,
  memberId: string,
  role: AccountRole,
): AccountMember | undefined {
  const list = getMembers(organisationId);
  const next = list.map((m) =>
    m.id === memberId
      ? { ...m, role, permissions: ROLE_PERMISSIONS[role] }
      : m,
  );
  setMembers(organisationId, next);
  return next.find((m) => m.id === memberId);
}
