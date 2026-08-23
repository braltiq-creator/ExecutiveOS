import {
  fetchImportantMemory,
  fetchMemoryById,
  fetchRecentMemory,
  searchMemoryRecords,
} from "@/lib/memory/queries";
import {
  archiveMemoryRecord,
  insertMemoryRecord,
  updateMemoryRecord,
} from "@/lib/memory/mutations";
import {
  assertMemoryAllowed,
  requireFeatureEntitlements,
} from "@/lib/features";
import { incrementUsage } from "@/lib/billing/service";
import { fetchActiveMembership } from "@/lib/organizations/queries";
import type {
  ExecutiveMemoryRecord,
  MemoryQueryOptions,
  SaveMemoryInput,
  SearchMemoryOptions,
} from "@/lib/memory/types";
import { ExecutiveMemoryError } from "@/lib/memory/types";

const DEFAULT_RECENT_LIMIT = 20;
const DEFAULT_IMPORTANT_LIMIT = 20;
const DEFAULT_SEARCH_LIMIT = 50;

function validateSaveInput(input: SaveMemoryInput): void {
  if (!input.title.trim()) {
    throw new ExecutiveMemoryError("Title is required.", "VALIDATION_ERROR");
  }

  if (!input.content.trim()) {
    throw new ExecutiveMemoryError("Content is required.", "VALIDATION_ERROR");
  }

  if (!input.source.trim()) {
    throw new ExecutiveMemoryError("Source is required.", "VALIDATION_ERROR");
  }
}

export async function saveMemory(
  userId: string,
  input: SaveMemoryInput,
): Promise<ExecutiveMemoryRecord> {
  validateSaveInput(input);

  const entitlements = await requireFeatureEntitlements(userId);
  assertMemoryAllowed(entitlements);

  let record: ExecutiveMemoryRecord;

  if (input.id) {
    const existing = await fetchMemoryById(userId, input.id);

    if (!existing) {
      throw new ExecutiveMemoryError("Memory not found.", "NOT_FOUND");
    }

    record = await updateMemoryRecord(userId, input.id, input);
  } else {
    record = await insertMemoryRecord(userId, input);
  }

  const membership = await fetchActiveMembership(userId);

  if (membership) {
    await incrementUsage(membership.organization.id, "memory_count", 1);
    await incrementUsage(
      membership.organization.id,
      "storage_bytes",
      input.content.length + input.title.length,
    );
  }

  return record;
}

export async function getRecentMemory(
  userId: string,
  options: MemoryQueryOptions = {},
): Promise<ExecutiveMemoryRecord[]> {
  return fetchRecentMemory(userId, {
    limit: options.limit ?? DEFAULT_RECENT_LIMIT,
  });
}

export async function getImportantMemory(
  userId: string,
  options: MemoryQueryOptions = {},
): Promise<ExecutiveMemoryRecord[]> {
  return fetchImportantMemory(userId, {
    limit: options.limit ?? DEFAULT_IMPORTANT_LIMIT,
  });
}

export async function searchMemory(
  userId: string,
  query: string,
  options: SearchMemoryOptions = {},
): Promise<ExecutiveMemoryRecord[]> {
  return searchMemoryRecords(userId, query, {
    ...options,
    limit: options.limit ?? DEFAULT_SEARCH_LIMIT,
  });
}

export async function archiveMemory(
  userId: string,
  memoryId: string,
): Promise<ExecutiveMemoryRecord> {
  const existing = await fetchMemoryById(userId, memoryId);

  if (!existing) {
    throw new ExecutiveMemoryError("Memory not found.", "NOT_FOUND");
  }

  return archiveMemoryRecord(userId, memoryId);
}

export async function loadIntelligenceMemoryRecords(
  userId: string,
): Promise<ExecutiveMemoryRecord[]> {
  const [recent, important] = await Promise.all([
    getRecentMemory(userId, { limit: 10 }),
    getImportantMemory(userId, { limit: 10 }),
  ]);

  return dedupeMemoryRecords([...important, ...recent]);
}

function dedupeMemoryRecords(
  records: ExecutiveMemoryRecord[],
): ExecutiveMemoryRecord[] {
  const seen = new Set<string>();

  return records.filter((record) => {
    if (seen.has(record.id)) {
      return false;
    }

    seen.add(record.id);
    return true;
  });
}
