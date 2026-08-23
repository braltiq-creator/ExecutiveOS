/**
 * Follow-up tasks for CS / implementation.
 */

import type { OpsTask } from "@/operations/types";

const tasks = new Map<string, OpsTask>();

export function resetOpsTasks(): void {
  tasks.clear();
}

export function listTasksForTenant(tenantId: string): OpsTask[] {
  return [...tasks.values()]
    .filter((t) => t.tenantId === tenantId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function createOpsTask(input: {
  tenantId: string;
  title: string;
  owner: string;
  dueAt?: string | null;
  asOf?: string;
}): OpsTask {
  const task: OpsTask = {
    id: `task-${input.tenantId}-${tasks.size + 1}`,
    tenantId: input.tenantId,
    title: input.title,
    owner: input.owner,
    dueAt: input.dueAt ?? null,
    status: "open",
    createdAt: input.asOf ?? new Date().toISOString(),
    completedAt: null,
  };
  tasks.set(task.id, task);
  return task;
}

export function completeOpsTask(input: {
  id: string;
  asOf?: string;
}): OpsTask | null {
  const existing = tasks.get(input.id);
  if (!existing) return null;
  const next: OpsTask = {
    ...existing,
    status: "done",
    completedAt: input.asOf ?? new Date().toISOString(),
  };
  tasks.set(next.id, next);
  return next;
}
