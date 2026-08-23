export const MEMORY_TYPES = [
  "decision",
  "meeting",
  "insight",
  "commitment",
  "risk",
  "opportunity",
  "achievement",
  "observation",
] as const;

export type MemoryType = (typeof MEMORY_TYPES)[number];

export const MEMORY_IMPORTANCE_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type MemoryImportance = (typeof MEMORY_IMPORTANCE_LEVELS)[number];

export const MEMORY_TYPE_LABELS: Record<MemoryType, string> = {
  decision: "Decision",
  meeting: "Meeting",
  insight: "Insight",
  commitment: "Commitment",
  risk: "Risk",
  opportunity: "Opportunity",
  achievement: "Achievement",
  observation: "Observation",
};

export const MEMORY_IMPORTANCE_ORDER: Record<MemoryImportance, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export type ExecutiveMemoryRecord = {
  id: string;
  user_id: string;
  memory_type: MemoryType;
  title: string;
  content: string;
  importance: MemoryImportance;
  source: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveMemoryInput = {
  id?: string;
  memoryType: MemoryType;
  title: string;
  content: string;
  importance: MemoryImportance;
  source: string;
};

export type SearchMemoryOptions = {
  limit?: number;
  memoryType?: MemoryType;
  importance?: MemoryImportance;
};

export type MemoryQueryOptions = {
  limit?: number;
};

export class ExecutiveMemoryError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ExecutiveMemoryError";
    this.code = code;
  }
}

export function formatMemoryType(type: MemoryType): string {
  return MEMORY_TYPE_LABELS[type];
}

export function compareMemoryImportance(
  left: MemoryImportance,
  right: MemoryImportance,
): number {
  return MEMORY_IMPORTANCE_ORDER[right] - MEMORY_IMPORTANCE_ORDER[left];
}
