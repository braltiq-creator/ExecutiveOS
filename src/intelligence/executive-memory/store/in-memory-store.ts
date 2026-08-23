import type { ExecutiveMemoryStore } from "@/intelligence/executive-memory/store/memory-store";
import type {
  ExecutiveCommitment,
  MemoryEvent,
  MemoryQuery,
  MemorySnapshot,
} from "@/intelligence/executive-memory/types";

/**
 * Deterministic in-memory store.
 * Replace with SupabaseMemoryStore without changing engine callers.
 */
export class InMemoryExecutiveMemoryStore implements ExecutiveMemoryStore {
  readonly id = "memory-inmemory";
  readonly label = "In-memory Executive Memory";

  private readonly events = new Map<string, MemoryEvent>();
  private readonly commitments = new Map<string, ExecutiveCommitment>();
  private readonly asOf: string;
  private readonly source: string;

  constructor(meta?: { asOf?: string; source?: string }) {
    this.asOf = meta?.asOf ?? new Date().toISOString();
    this.source = meta?.source ?? "memory-mock";
  }

  append(event: MemoryEvent): void {
    this.events.set(event.id, event);
  }

  appendMany(events: MemoryEvent[]): void {
    for (const event of events) this.append(event);
  }

  getEvent(id: string): MemoryEvent | undefined {
    return this.events.get(id);
  }

  listEvents(query: MemoryQuery = {}): MemoryEvent[] {
    let items = [...this.events.values()];
    if (query.executiveId) {
      items = items.filter((event) => event.executiveId === query.executiveId);
    }
    if (query.entityId) {
      items = items.filter(
        (event) =>
          event.entityId === query.entityId ||
          event.relatedEntityIds?.includes(query.entityId!),
      );
    }
    if (query.entityKind) {
      items = items.filter((event) => event.entityKind === query.entityKind);
    }
    if (query.kinds?.length) {
      items = items.filter((event) => query.kinds!.includes(event.kind));
    }
    if (query.tags?.length) {
      items = items.filter((event) =>
        query.tags!.some((tag) => event.tags?.includes(tag)),
      );
    }
    if (query.from) {
      items = items.filter((event) => event.at >= query.from!);
    }
    if (query.to) {
      items = items.filter((event) => event.at <= query.to!);
    }
    items.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
    return items.slice(0, query.limit ?? items.length);
  }

  upsertCommitment(commitment: ExecutiveCommitment): void {
    this.commitments.set(commitment.id, commitment);
  }

  listCommitments(executiveId?: string): ExecutiveCommitment[] {
    const items = [...this.commitments.values()];
    return executiveId
      ? items.filter((item) => item.executiveId === executiveId)
      : items;
  }

  snapshot(): MemorySnapshot {
    return {
      asOf: this.asOf,
      source: this.source,
      events: this.listEvents({ limit: Number.MAX_SAFE_INTEGER }),
      commitments: this.listCommitments(),
    };
  }
}
