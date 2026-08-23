import { loadIntelligenceMemoryRecords } from "@/lib/memory/service";
import type { ExecutiveMemoryRecord } from "@/lib/memory/types";
import { formatMemoryType } from "@/lib/memory/types";
import type { ExecutiveMemoryContext, ExecutiveMemoryEntry } from "@/types/intelligence";

export function mapMemoryRecordToEntry(
  record: ExecutiveMemoryRecord,
): ExecutiveMemoryEntry {
  return {
    id: record.id,
    memoryType: formatMemoryType(record.memory_type),
    title: record.title,
    content: record.content,
    importance: record.importance,
    source: record.source,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapMemoryRecordsToContext(
  records: ExecutiveMemoryRecord[],
): ExecutiveMemoryContext {
  if (records.length === 0) {
    return createEmptyExecutiveMemory();
  }

  const lastUpdatedAt = records.reduce<string | null>((latest, record) => {
    if (!latest) {
      return record.updated_at;
    }

    return new Date(record.updated_at) > new Date(latest)
      ? record.updated_at
      : latest;
  }, null);

  return {
    entries: records.map(mapMemoryRecordToEntry),
    lastUpdatedAt,
  };
}

export async function loadExecutiveMemory(
  userId: string,
): Promise<ExecutiveMemoryContext> {
  const records = await loadIntelligenceMemoryRecords(userId);
  return mapMemoryRecordsToContext(records);
}

export function createEmptyExecutiveMemory(): ExecutiveMemoryContext {
  return {
    entries: [],
    lastUpdatedAt: null,
  };
}
