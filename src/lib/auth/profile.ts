import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { userHasActiveOrganization } from "@/lib/organizations/queries";
import { isExecutiveOnboardingComplete } from "@/lib/onboarding/queries";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createProfile(userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAuthRedirectPath(userId: string): Promise<string> {
  const hasOrganization = await userHasActiveOrganization(userId);

  if (!hasOrganization) {
    return "/organization";
  }

  const executiveComplete = await isExecutiveOnboardingComplete(userId);
  return executiveComplete ? "/dashboard" : "/onboarding";
}
