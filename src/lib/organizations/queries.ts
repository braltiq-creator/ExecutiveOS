import { createClient } from "@/lib/supabase/server";
import type {
  OrganizationDepartmentRecord,
  OrganizationInvitationRecord,
  OrganizationMemberRecord,
  OrganizationMembership,
  OrganizationRecord,
  PendingInvitationView,
} from "@/lib/organizations/types";

export async function fetchOrganizationById(
  organizationId: string,
): Promise<OrganizationRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchUserMemberships(
  userId: string,
): Promise<OrganizationMembership[]> {
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!members?.length) {
    return [];
  }

  const organizationIds = members.map((member) => member.organization_id);

  const { data: organizations, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .in("id", organizationIds)
    .is("archived_at", null);

  if (orgError) {
    throw new Error(orgError.message);
  }

  const organizationMap = new Map(
    (organizations ?? []).map((organization) => [organization.id, organization]),
  );

  return members
    .map((member) => {
      const organization = organizationMap.get(member.organization_id);

      if (!organization) {
        return null;
      }

      return { member, organization };
    })
    .filter((item): item is OrganizationMembership => item !== null);
}

export async function fetchActiveOrganizationId(
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_organization_preferences")
    .select("active_organization_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data?.active_organization_id) {
    return data.active_organization_id;
  }

  const memberships = await fetchUserMemberships(userId);
  return memberships[0]?.organization.id ?? null;
}

export async function fetchActiveMembership(
  userId: string,
): Promise<OrganizationMembership | null> {
  const organizationId = await fetchActiveOrganizationId(userId);

  if (!organizationId) {
    return null;
  }

  const supabase = await createClient();

  const { data: member, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!member) {
    return null;
  }

  const organization = await fetchOrganizationById(organizationId);

  if (!organization) {
    return null;
  }

  return { member, organization };
}

export async function userHasActiveOrganization(
  userId: string,
): Promise<boolean> {
  const membership = await fetchActiveMembership(userId);
  return membership !== null;
}

export async function fetchOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMemberRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .neq("status", "removed")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchOrganizationDepartments(
  organizationId: string,
): Promise<OrganizationDepartmentRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_departments")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchInvitationByCode(
  invitationCode: string,
): Promise<OrganizationInvitationRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("invitation_code", invitationCode)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchPendingInvitationsForEmail(
  email: string,
): Promise<PendingInvitationView[]> {
  const supabase = await createClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: invitations, error } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("status", "pending")
    .ilike("email", normalizedEmail)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!invitations?.length) {
    return [];
  }

  const organizationIds = [
    ...new Set(invitations.map((invitation) => invitation.organization_id)),
  ];

  const { data: organizations, error: orgError } = await supabase
    .from("organizations")
    .select("id, name")
    .in("id", organizationIds)
    .is("archived_at", null);

  if (orgError) {
    throw new Error(orgError.message);
  }

  const organizationMap = new Map(
    (organizations ?? []).map((organization) => [
      organization.id,
      organization.name,
    ]),
  );

  return invitations
    .map((invitation) => ({
      ...invitation,
      organizationName:
        organizationMap.get(invitation.organization_id) ?? "Organization",
    }))
    .filter((invitation) => organizationMap.has(invitation.organization_id));
}

export async function fetchOrganizationInvitations(
  organizationId: string,
): Promise<OrganizationInvitationRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchMemberById(
  memberId: string,
): Promise<OrganizationMemberRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
