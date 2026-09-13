import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/auth/actions";
import { isMockMode } from "@/lib/mock/mode";
import { MOCK_SESSION } from "@/lib/mock/session";
import { getExecutiveProfile } from "@/lib/onboarding/queries";
import { fetchActiveMembership } from "@/lib/organizations/queries";
import type { OrganizationMembership } from "@/lib/organizations/types";
import type { ExecutiveProfile as DbExecutiveProfile } from "@/types/onboarding";
import type { AppSession, Company, ExecutiveProfile } from "@/types/session";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "EX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function companyFromMembership(membership: OrganizationMembership): Company {
  const org = membership.organization;
  return {
    id: org.id,
    name: org.name,
    industry: org.industry ?? "",
    stage: org.company_size ?? "",
    headquarters: org.country ?? "",
  };
}

function profileFromIdentity(
  user: User,
  membership: OrganizationMembership,
  executive: DbExecutiveProfile | null,
): ExecutiveProfile {
  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  const fullName =
    executive?.full_name?.trim() ||
    membership.member.display_name?.trim() ||
    metadataName ||
    user.email?.split("@")[0] ||
    "Executive";

  const preferredName =
    executive?.preferred_name?.trim() || fullName.split(/\s+/)[0] || "Executive";

  const title = executive?.job_title?.trim() || "Executive";

  return {
    id: executive?.id ?? `profile-${user.id}`,
    userId: user.id,
    fullName,
    preferredName,
    title,
    email: user.email ?? membership.member.email ?? "",
    initials: initialsFromName(fullName),
  };
}

/**
 * Build AppSession from authenticated user + active organisation membership.
 * Shared by getAppSession and tests — never invents a mock company.
 */
export function buildAppSessionFromMembership(
  user: User,
  membership: OrganizationMembership,
  executive: DbExecutiveProfile | null = null,
): AppSession {
  return {
    userId: user.id,
    email: user.email ?? membership.member.email ?? "",
    profile: profileFromIdentity(user, membership, executive),
    company: companyFromMembership(membership),
    isMock: false,
  };
}

/**
 * Server-safe session for application surfaces.
 * Mock mode → MOCK_SESSION. Otherwise → real auth + active membership, or null.
 * Never silently substitutes Northline/demo in Production.
 */
export async function getAppSession(): Promise<AppSession | null> {
  if (isMockMode()) {
    return MOCK_SESSION;
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return null;
  }

  const membership = await fetchActiveMembership(user.id);
  if (!membership) {
    return null;
  }

  let executive: DbExecutiveProfile | null = null;
  try {
    executive = await getExecutiveProfile(user.id);
  } catch {
    executive = null;
  }

  return buildAppSessionFromMembership(user, membership, executive);
}

/**
 * Require an application session.
 * Mock mode → MOCK_SESSION.
 * Production → real membership-backed session; never MOCK_SESSION fallback.
 * Unauthenticated → /sign-in. Authenticated without org → /organization.
 */
export async function requireAppSession(): Promise<AppSession> {
  if (isMockMode()) {
    return MOCK_SESSION;
  }

  const session = await getAppSession();
  if (session) {
    return session;
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/sign-in");
  }

  redirect("/organization");
}
