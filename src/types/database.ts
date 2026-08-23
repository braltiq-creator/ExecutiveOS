export type Profile = {
  id: string;
  created_at: string;
};

export type Organization = {
  id: string;
  name: string;
  legal_name: string | null;
  industry: string | null;
  company_size: string | null;
  country: string | null;
  timezone: string;
  website: string | null;
  logo_url: string | null;
  subscription_plan: "free" | "team" | "enterprise";
  created_by: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "executive" | "manager" | "contributor" | "viewer";
  status: "active" | "invited" | "suspended" | "removed";
  email: string | null;
  display_name: string | null;
  joined_at: string | null;
  invited_at: string | null;
  created_at: string;
};

export type OrganizationDepartment = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type OrganizationInvitation = {
  id: string;
  organization_id: string;
  email: string;
  role: "executive" | "manager" | "contributor" | "viewer";
  invitation_code: string;
  invited_by: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
};

export type OrganizationPermission = {
  id: string;
  name: string;
  description: string;
};

export type UserOrganizationPreference = {
  user_id: string;
  active_organization_id: string;
  updated_at: string;
};
