import type {
  ExecutiveCommitment,
  MemoryEvent,
  MemoryQuery,
  MemorySnapshot,
} from "@/intelligence/executive-memory/types";

/**
 * Persistence contract — in-memory mock today, Supabase tomorrow.
 */
export type ExecutiveMemoryStore = {
  readonly id: string;
  readonly label: string;
  append(event: MemoryEvent): void;
  appendMany(events: MemoryEvent[]): void;
  listEvents(query?: MemoryQuery): MemoryEvent[];
  getEvent(id: string): MemoryEvent | undefined;
  upsertCommitment(commitment: ExecutiveCommitment): void;
  listCommitments(executiveId?: string): ExecutiveCommitment[];
  snapshot(): MemorySnapshot;
};
