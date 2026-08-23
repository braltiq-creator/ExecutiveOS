import { createClient } from "@/lib/supabase/server";
import type { ObjectiveInput } from "@/types/onboarding";
import { getExecutiveProfile } from "@/lib/onboarding/queries";

export async function ensureExecutiveProfile(userId: string): Promise<string> {
  const existing = await getExecutiveProfile(userId);

  if (existing) {
    return existing.id;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("executive_profiles")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

export async function updateExecutiveProfile(
  userId: string,
  updates: Record<string, unknown>,
): Promise<string> {
  const profileId = await ensureExecutiveProfile(userId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("executive_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return profileId;
}

export async function replaceStrategicObjectives(
  userId: string,
  profileId: string,
  objectives: ObjectiveInput[],
): Promise<void> {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("strategic_objectives")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const rows = objectives.map((objective, index) => ({
    user_id: userId,
    executive_profile_id: profileId,
    title: objective.title.trim(),
    description: objective.description.trim(),
    priority: objective.priority,
    sort_order: index + 1,
  }));

  const { error: insertError } = await supabase
    .from("strategic_objectives")
    .insert(rows);

  if (insertError) {
    throw new Error(insertError.message);
  }
}

export async function markOnboardingComplete(userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("executive_profiles")
    .update({
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
