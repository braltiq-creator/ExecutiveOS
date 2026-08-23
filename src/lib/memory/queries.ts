import { createClient } from "@/lib/supabase/server";
import type {
  ExecutiveMemoryRecord,
  MemoryImportance,
  MemoryQueryOptions,
  SearchMemoryOptions,
} from "@/lib/memory/types";

function applyLimit<T extends { limit: (count: number) => T }>(
  query: T,
  limit?: number,
): T {
  if (limit !== undefined) {
    return query.limit(limit);
  }
  return query;
}

export async function fetchMemoryById(
  userId: string,
  memoryId: string,
): Promise<ExecutiveMemoryRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executive_memory")
    .select("*")
    .eq("user_id", userId)
    .eq("id", memoryId)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchMemoryBySource(
  userId: string,
  source: string,
): Promise<ExecutiveMemoryRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executive_memory")
    .select("*")
    .eq("user_id", userId)
    .eq("source", source)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchRecentMemory(
  userId: string,
  options: MemoryQueryOptions = {},
): Promise<ExecutiveMemoryRecord[]> {
  const supabase = await createClient();

  let query = supabase
    .from("executive_memory")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  query = applyLimit(query, options.limit);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchImportantMemory(
  userId: string,
  options: MemoryQueryOptions = {},
): Promise<ExecutiveMemoryRecord[]> {
  const records = await fetchActiveMemory(userId);
  const limit = options.limit ?? records.length;

  return records
    .sort((left, right) => {
      const importanceCompare =
        importanceRank(right.importance) - importanceRank(left.importance);

      if (importanceCompare !== 0) {
        return importanceCompare;
      }

      return (
        new Date(right.updated_at).getTime() -
        new Date(left.updated_at).getTime()
      );
    })
    .slice(0, limit);
}

export async function fetchActiveMemory(
  userId: string,
): Promise<ExecutiveMemoryRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executive_memory")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function searchMemoryRecords(
  userId: string,
  queryText: string,
  options: SearchMemoryOptions = {},
): Promise<ExecutiveMemoryRecord[]> {
  const trimmedQuery = queryText.trim();

  if (!trimmedQuery) {
    return [];
  }

  // Keyword search today; replace with embedding / semantic retrieval later.
  const activeRecords = await fetchActiveMemory(userId);
  const normalizedQuery = trimmedQuery.toLowerCase();

  let results = activeRecords.filter(
    (record) =>
      record.title.toLowerCase().includes(normalizedQuery) ||
      record.content.toLowerCase().includes(normalizedQuery),
  );

  if (options.memoryType) {
    results = results.filter(
      (record) => record.memory_type === options.memoryType,
    );
  }

  if (options.importance) {
    results = results.filter(
      (record) => record.importance === options.importance,
    );
  }

  results.sort(
    (left, right) =>
      new Date(right.updated_at).getTime() -
      new Date(left.updated_at).getTime(),
  );

  if (options.limit !== undefined) {
    return results.slice(0, options.limit);
  }

  return results;
}

function importanceRank(importance: MemoryImportance): number {
  switch (importance) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
  }
}
