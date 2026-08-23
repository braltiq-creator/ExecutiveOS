import {
  fetchActiveMembership,
  fetchOrganizationDepartments,
  fetchOrganizationMembers,
} from "@/lib/organizations/queries";
import {
  formatOrganizationRole,
  type OrganizationDepartmentRecord,
  type OrganizationMemberRecord,
  type OrganizationRecord,
} from "@/lib/organizations/types";
import type {
  DepartmentContext,
  OrganizationEntityContext,
  TeamMemberContext,
} from "@/types/intelligence";

export function mapOrganizationEntity(
  organization: OrganizationRecord,
): OrganizationEntityContext {
  return {
    id: organization.id,
    name: organization.name,
    legalName: organization.legal_name,
    industry: organization.industry,
    companySize: organization.company_size,
    country: organization.country,
    timezone: organization.timezone,
    website: organization.website,
    logoUrl: organization.logo_url,
    subscriptionPlan: organization.subscription_plan,
  };
}

export function mapTeamMembers(
  members: OrganizationMemberRecord[],
): TeamMemberContext[] {
  return members
    .filter((member) => member.status === "active")
    .map((member) => ({
      id: member.id,
      userId: member.user_id,
      role: member.role,
      roleLabel: formatOrganizationRole(member.role),
      email: member.email,
      displayName: member.display_name,
      joinedAt: member.joined_at,
    }));
}

export function mapDepartments(
  departments: OrganizationDepartmentRecord[],
): DepartmentContext[] {
  return departments.map((department) => ({
    id: department.id,
    name: department.name,
    description: department.description,
  }));
}

export async function loadOrganizationIntelligenceContext(userId: string): Promise<{
  organization: OrganizationEntityContext | null;
  teamMembers: TeamMemberContext[];
  departments: DepartmentContext[];
}> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    return {
      organization: null,
      teamMembers: [],
      departments: [],
    };
  }

  const [members, departments] = await Promise.all([
    fetchOrganizationMembers(membership.organization.id),
    fetchOrganizationDepartments(membership.organization.id),
  ]);

  return {
    organization: mapOrganizationEntity(membership.organization),
    teamMembers: mapTeamMembers(members),
    departments: mapDepartments(departments),
  };
}
