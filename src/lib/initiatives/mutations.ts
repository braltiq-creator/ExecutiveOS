import { createClient } from "@/lib/supabase/server";
import type {
  InitiativeLinkInput,
  InitiativeLinkRecord,
  SaveInitiativeInput,
  StrategicInitiativeRecord,
} from "@/lib/initiatives/types";

function mapInitiativeInput(
  input: SaveInitiativeInput,
  userId: string,
  healthStatus: SaveInitiativeInput["healthStatus"],
) {
  return {
    user_id: userId,
    title: input.title.trim(),
    description: input.description.trim(),
    status: input.status,
    priority: input.priority,
    owner: input.owner.trim(),
    start_date: input.startDate,
    target_date: input.targetDate?.trim() || null,
    progress_percentage: input.progressPercentage,
    health_status: healthStatus ?? "on_track",
    updated_at: new Date().toISOString(),
  };
}

export async function insertInitiativeRecord(
  userId: string,
  input: SaveInitiativeInput,
  healthStatus?: SaveInitiativeInput["healthStatus"],
): Promise<StrategicInitiativeRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("strategic_initiatives")
    .insert({
      ...mapInitiativeInput(input, userId, healthStatus ?? input.healthStatus),
      created_at: timestamp,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateInitiativeRecord(
  userId: string,
  initiativeId: string,
  input: SaveInitiativeInput,
  healthStatus?: SaveInitiativeInput["healthStatus"],
): Promise<StrategicInitiativeRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("strategic_initiatives")
    .update(mapInitiativeInput(input, userId, healthStatus ?? input.healthStatus))
    .eq("user_id", userId)
    .eq("id", initiativeId)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function archiveInitiativeRecord(
  userId: string,
  initiativeId: string,
): Promise<StrategicInitiativeRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("strategic_initiatives")
    .update({
      status: "archived",
      archived_at: timestamp,
      updated_at: timestamp,
    })
    .eq("user_id", userId)
    .eq("id", initiativeId)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function replaceInitiativeLinks(
  userId: string,
  initiativeId: string,
  links: InitiativeLinkInput[],
): Promise<InitiativeLinkRecord[]> {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("initiative_links")
    .delete()
    .eq("initiative_id", initiativeId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (links.length === 0) {
    return [];
  }

  const uniqueLinks = links.filter(
    (link, index, array) =>
      array.findIndex(
        (candidate) =>
          candidate.linkType === link.linkType &&
          candidate.linkedId === link.linkedId,
      ) === index,
  );

  const rows = uniqueLinks.map((link) => ({
    initiative_id: initiativeId,
    user_id: userId,
    link_type: link.linkType,
    linked_id: link.linkedId,
    created_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("initiative_links")
    .insert(rows)
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function updateInitiativeHealthStatus(
  userId: string,
  initiativeId: string,
  healthStatus: SaveInitiativeInput["healthStatus"],
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("strategic_initiatives")
    .update({
      health_status: healthStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("id", initiativeId)
    .is("archived_at", null);

  if (error) {
    throw new Error(error.message);
  }
}
