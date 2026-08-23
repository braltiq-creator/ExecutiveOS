import { createClient } from "@/lib/supabase/server";
import type {
  ExecutiveProfile,
  OnboardingStepId,
  StrategicObjective,
} from "@/types/onboarding";

export async function getExecutiveProfile(
  userId: string,
): Promise<ExecutiveProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executive_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getStrategicObjectives(
  userId: string,
): Promise<StrategicObjective[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("strategic_objectives")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function isExecutiveOnboardingComplete(
  userId: string,
): Promise<boolean> {
  const profile = await getExecutiveProfile(userId);
  return Boolean(profile?.onboarding_completed_at);
}

function hasIdentityFields(profile: ExecutiveProfile | null): boolean {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.full_name &&
      profile.job_title &&
      profile.company &&
      profile.industry &&
      profile.country &&
      profile.timezone,
  );
}

function hasOrganisationFields(profile: ExecutiveProfile | null): boolean {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.company_size &&
      profile.annual_revenue_band &&
      profile.team_size !== null &&
      profile.direct_reports !== null &&
      profile.departments_responsible_for &&
      profile.geographic_responsibility,
  );
}

function hasChallengeFields(profile: ExecutiveProfile | null): boolean {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.biggest_business_challenge &&
      profile.biggest_leadership_challenge &&
      profile.biggest_productivity_challenge,
  );
}

export function determineInitialStep(
  profile: ExecutiveProfile | null,
  objectives: StrategicObjective[],
): OnboardingStepId {
  if (!hasIdentityFields(profile)) {
    return "identity";
  }

  if (!hasOrganisationFields(profile)) {
    return "organisation";
  }

  if (objectives.length < 3) {
    return "objectives";
  }

  if (!hasChallengeFields(profile)) {
    return "challenges";
  }

  return "operating-system";
}
