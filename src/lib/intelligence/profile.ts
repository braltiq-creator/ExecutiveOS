import { getExecutiveProfile } from "@/lib/onboarding/queries";
import type { ExecutiveProfile } from "@/types/onboarding";
import type {
  ExecutiveChallengesContext,
  ExecutiveIdentity,
  ExecutiveSystemsContext,
  OnboardingContext,
  OrganisationContext,
} from "@/types/intelligence";

export async function loadExecutiveProfileRecord(
  userId: string,
): Promise<ExecutiveProfile | null> {
  return getExecutiveProfile(userId);
}

export function mapExecutiveIdentity(
  userId: string,
  email: string | null,
  profile: ExecutiveProfile,
): ExecutiveIdentity {
  return {
    userId,
    email,
    fullName: profile.full_name ?? "",
    preferredName: profile.preferred_name,
    jobTitle: profile.job_title ?? "",
    company: profile.company ?? "",
    industry: profile.industry ?? "",
    country: profile.country ?? "",
    timezone: profile.timezone ?? "",
  };
}

export function mapOrganisationContext(
  profile: ExecutiveProfile,
): OrganisationContext {
  return {
    companySize: profile.company_size ?? "",
    annualRevenueBand: profile.annual_revenue_band ?? "",
    teamSize: profile.team_size ?? 0,
    directReports: profile.direct_reports ?? 0,
    departmentsResponsibleFor: profile.departments_responsible_for ?? "",
    geographicResponsibility: profile.geographic_responsibility ?? "",
  };
}

export function mapExecutiveChallenges(
  profile: ExecutiveProfile,
): ExecutiveChallengesContext {
  return {
    business: profile.biggest_business_challenge ?? "",
    leadership: profile.biggest_leadership_challenge ?? "",
    productivity: profile.biggest_productivity_challenge ?? "",
  };
}

export function mapExecutiveSystems(
  profile: ExecutiveProfile,
): ExecutiveSystemsContext {
  return {
    businessSystems: profile.business_systems ?? [],
  };
}

export function mapOnboardingContext(profile: ExecutiveProfile): OnboardingContext {
  return {
    completedAt: profile.onboarding_completed_at,
    isComplete: Boolean(profile.onboarding_completed_at),
  };
}
