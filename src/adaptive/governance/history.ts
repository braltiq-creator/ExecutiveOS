import type { LearningHistoryEntry } from "@/adaptive/framework/types";

const history: Array<LearningHistoryEntry & { tenantId: string; executiveId: string }> =
  [];
let seq = 0;

export function resetLearningHistory(): void {
  history.length = 0;
  seq = 0;
}

export function appendLearningHistory(input: {
  tenantId: string;
  executiveId: string;
  category: LearningHistoryEntry["category"];
  summary: string;
}): LearningHistoryEntry {
  seq += 1;
  const entry = {
    id: `alearn-${seq}`,
    at: new Date().toISOString(),
    summary: input.summary,
    category: input.category,
    tenantId: input.tenantId,
    executiveId: input.executiveId,
  };
  history.push(entry);
  return entry;
}

export function listLearningHistory(input: {
  tenantId: string;
  executiveId?: string;
}): LearningHistoryEntry[] {
  return history
    .filter((h) => h.tenantId === input.tenantId)
    .filter((h) =>
      input.executiveId ? h.executiveId === input.executiveId : true,
    )
    .map(({ id, at, summary, category }) => ({ id, at, summary, category }))
    .sort((a, b) => b.at.localeCompare(a.at));
}
