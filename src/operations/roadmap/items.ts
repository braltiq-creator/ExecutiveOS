/**
 * Portfolio / partner feature roadmap requests (operational metadata).
 */

import type { RoadmapItem } from "@/operations/types";

const items = new Map<string, RoadmapItem>();

export function resetRoadmapItems(): void {
  items.clear();
}

export function listRoadmapItems(tenantId?: string): RoadmapItem[] {
  const all = [...items.values()];
  if (!tenantId) return all;
  return all.filter((i) => i.tenantId === tenantId || i.tenantId === null);
}

export function addRoadmapItem(input: {
  tenantId?: string | null;
  title: string;
  priority?: RoadmapItem["priority"];
  requestedBy: string;
  notes?: string;
  asOf?: string;
}): RoadmapItem {
  const item: RoadmapItem = {
    id: `roadmap-${items.size + 1}`,
    tenantId: input.tenantId ?? null,
    title: input.title,
    status: "planned",
    priority: input.priority ?? "medium",
    requestedBy: input.requestedBy,
    notes: input.notes ?? "",
    createdAt: input.asOf ?? new Date().toISOString(),
  };
  items.set(item.id, item);
  return item;
}

export function updateRoadmapItem(input: {
  id: string;
  status?: RoadmapItem["status"];
  notes?: string;
}): RoadmapItem | null {
  const existing = items.get(input.id);
  if (!existing) return null;
  const next = {
    ...existing,
    status: input.status ?? existing.status,
    notes: input.notes ?? existing.notes,
  };
  items.set(next.id, next);
  return next;
}
