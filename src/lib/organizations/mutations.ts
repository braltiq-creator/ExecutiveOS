import { createClient } from "@/lib/supabase/server";
import type {
  CreateOrganizationInput,
  InvitableRole,
  OrganizationInvitationRecord,
  OrganizationMemberRecord,
  OrganizationRecord,
  UpdateOrganizationInput,
} from "@/lib/organizations/types";

function generateInvitationCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 8; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

export async function insertOrganizationRecord(
  userId: string,
  input: CreateOrganizationInput,
): Promise<OrganizationRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: input.name,
      legal_name: input.legalName ?? null,
      industry: input.industry ?? null,
      company_size: input.companySize ?? null,
      country: input.country ?? null,
      timezone: input.timezone,
      website: input.website ?? null,
      logo_url: input.logoUrl ?? null,
      created_by: userId,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateOrganizationRecord(
  organizationId: string,
  input: UpdateOrganizationInput,
): Promise<OrganizationRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("organizations")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.legalName !== undefined ? { legal_name: input.legalName } : {}),
      ...(input.industry !== undefined ? { industry: input.industry } : {}),
      ...(input.companySize !== undefined
        ? { company_size: input.companySize }
        : {}),
      ...(input.country !== undefined ? { country: input.country } : {}),
      ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      ...(input.website !== undefined ? { website: input.website ?? null } : {}),
      ...(input.logoUrl !== undefined ? { logo_url: input.logoUrl ?? null } : {}),
      updated_at: timestamp,
    })
    .eq("id", organizationId)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function archiveOrganizationRecord(
  organizationId: string,
): Promise<OrganizationRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("organizations")
    .update({
      archived_at: timestamp,
      updated_at: timestamp,
    })
    .eq("id", organizationId)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function insertOrganizationMemberRecord(input: {
  organizationId: string;
  userId: string;
  role: OrganizationMemberRecord["role"];
  status?: OrganizationMemberRecord["status"];
  email?: string | null;
  displayName?: string | null;
  joinedAt?: string | null;
  invitedAt?: string | null;
}): Promise<OrganizationMemberRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("organization_members")
    .insert({
      organization_id: input.organizationId,
      user_id: input.userId,
      role: input.role,
      status: input.status ?? "active",
      email: input.email ?? null,
      display_name: input.displayName ?? null,
      joined_at: input.joinedAt ?? timestamp,
      invited_at: input.invitedAt ?? null,
      created_at: timestamp,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateOrganizationMemberRecord(
  memberId: string,
  updates: Partial<
    Pick<
      OrganizationMemberRecord,
      "role" | "status" | "email" | "display_name" | "joined_at"
    >
  >,
): Promise<OrganizationMemberRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_members")
    .update(updates)
    .eq("id", memberId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function removeOrganizationMemberRecord(
  memberId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_members")
    .update({ status: "removed" })
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertActiveOrganizationPreference(
  userId: string,
  organizationId: string,
): Promise<void> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { error } = await supabase.from("user_organization_preferences").upsert(
    {
      user_id: userId,
      active_organization_id: organizationId,
      updated_at: timestamp,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function insertOrganizationInvitationRecord(input: {
  organizationId: string;
  email: string;
  role: InvitableRole;
  invitedBy: string;
  expiresAt: string;
}): Promise<OrganizationInvitationRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const invitationCode = generateInvitationCode();

    const { data, error } = await supabase
      .from("organization_invitations")
      .insert({
        organization_id: input.organizationId,
        email: input.email,
        role: input.role,
        invitation_code: invitationCode,
        invited_by: input.invitedBy,
        expires_at: input.expiresAt,
        created_at: timestamp,
      })
      .select("*")
      .single();

    if (!error) {
      return data;
    }

    if (error.code !== "23505") {
      throw new Error(error.message);
    }
  }

  throw new Error("Unable to generate a unique invitation code.");
}

export async function acceptOrganizationInvitationRecord(
  invitationId: string,
  userId: string,
): Promise<OrganizationInvitationRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("organization_invitations")
    .update({
      status: "accepted",
      accepted_at: timestamp,
      accepted_by: userId,
    })
    .eq("id", invitationId)
    .eq("status", "pending")
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function revokeOrganizationInvitationRecord(
  invitationId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .eq("status", "pending");

  if (error) {
    throw new Error(error.message);
  }
}

export async function insertDefaultDepartments(
  organizationId: string,
  departments: Array<{ name: string; description?: string }>,
): Promise<void> {
  if (departments.length === 0) {
    return;
  }

  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { error } = await supabase.from("organization_departments").insert(
    departments.map((department) => ({
      organization_id: organizationId,
      name: department.name,
      description: department.description ?? null,
      created_at: timestamp,
    })),
  );

  if (error) {
    throw new Error(error.message);
  }
}
