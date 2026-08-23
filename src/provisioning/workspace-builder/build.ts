/**
 * Workspace builder — default executive workspaces for a new tenant.
 */

import {
  createDefaultWorkspaces,
  type Workspace,
} from "@/runtime/workspace/types";

const workspaceRegistry = new Map<string, Workspace[]>();

export function resetProvisioningWorkspaces(): void {
  workspaceRegistry.clear();
}

export function buildTenantWorkspaces(tenantId: string): Workspace[] {
  const existing = workspaceRegistry.get(tenantId);
  if (existing) return existing;
  const workspaces = createDefaultWorkspaces(tenantId);
  workspaceRegistry.set(tenantId, workspaces);
  return workspaces;
}

export function listTenantWorkspaces(tenantId: string): Workspace[] {
  return workspaceRegistry.get(tenantId) ?? [];
}
