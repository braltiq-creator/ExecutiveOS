import { createClient } from "@/lib/supabase/server";
import type { ExecutiveMemoryRecord, SaveMemoryInput } from "@/lib/memory/types";

export async function insertMemoryRecord(
  userId: string,
  input: SaveMemoryInput,
): Promise<ExecutiveMemoryRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("executive_memory")
    .insert({
      user_id: userId,
      memory_type: input.memoryType,
      title: input.title.trim(),
      content: input.content.trim(),
      importance: input.importance,
      source: input.source.trim(),
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

export async function updateMemoryRecord(
  userId: string,
  memoryId: string,
  input: SaveMemoryInput,
): Promise<ExecutiveMemoryRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executive_memory")
    .update({
      memory_type: input.memoryType,
      title: input.title.trim(),
      content: input.content.trim(),
      importance: input.importance,
      source: input.source.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("id", memoryId)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function archiveMemoryRecord(
  userId: string,
  memoryId: string,
): Promise<ExecutiveMemoryRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("executive_memory")
    .update({
      archived_at: timestamp,
      updated_at: timestamp,
    })
    .eq("user_id", userId)
    .eq("id", memoryId)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
