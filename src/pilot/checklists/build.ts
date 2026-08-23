/**
 * Provider connection checklists — profile-aware, implementation-team facing.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { getIntelligenceProfile } from "@/profiles";
import { getM365ConnectionRegistry } from "@/providers/microsoft365";
import { getSimproConnectionRegistry } from "@/providers/simpro";
import { getSalesforceConnectionRegistry } from "@/providers/salesforce";
import { loadDiscoverySession } from "@/onboarding";
import type {
  PilotChecklistItem,
  PilotChecklistItemStatus,
  PilotProviderChecklist,
  PilotProviderChecklistId,
} from "@/pilot/types";

function item(
  id: string,
  label: string,
  status: PilotChecklistItemStatus,
  detail: string,
  completedAt: string | null = null,
): PilotChecklistItem {
  return { id, label, status, detail, completedAt };
}

function overallStatus(
  items: PilotChecklistItem[],
): PilotChecklistItemStatus {
  if (items.some((i) => i.status === "blocked")) return "blocked";
  if (items.every((i) => i.status === "complete" || i.status === "skipped")) {
    return "complete";
  }
  if (items.some((i) => i.status === "in_progress" || i.status === "complete")) {
    return "in_progress";
  }
  return "not_started";
}

function buildM365Checklist(
  tenantId: string,
  asOf: string,
): PilotProviderChecklist {
  const status = getM365ConnectionRegistry().adminStatus(tenantId);
  const connected = status?.tenantStatus === "connected";
  const syncOk = status?.syncHealth === "healthy";
  const items = [
    item(
      "m365-connect",
      "Connection status",
      connected ? "complete" : "not_started",
      connected ? "Connected" : "Not connected",
      connected ? status?.lastSynchronisation ?? asOf : null,
    ),
    item(
      "m365-permissions",
      "Permissions granted",
      (status?.permissions.length ?? 0) > 0 ? "complete" : "not_started",
      status?.permissions.length
        ? `${status.permissions.length} scopes granted`
        : "Awaiting consent",
    ),
    item(
      "m365-sync",
      "Sync status",
      syncOk ? "complete" : connected ? "in_progress" : "not_started",
      status?.syncHealth ?? "idle",
      syncOk ? status?.lastSynchronisation ?? null : null,
    ),
  ];
  return {
    providerId: "microsoft365",
    label: "Microsoft 365",
    required: true,
    items,
    overallStatus: overallStatus(items),
  };
}

function buildSimproChecklist(
  tenantId: string,
  asOf: string,
  required: boolean,
): PilotProviderChecklist {
  const status = getSimproConnectionRegistry().adminStatus(tenantId);
  const connected = status?.tenantStatus === "connected";
  const syncOk = status?.syncHealth === "healthy";
  const items = [
    item(
      "simpro-connect",
      "Connection status",
      connected ? "complete" : required ? "not_started" : "skipped",
      connected ? "Connected" : required ? "Not connected" : "Not required",
      connected ? status?.lastSynchronisation ?? asOf : null,
    ),
    item(
      "simpro-permissions",
      "Permissions granted",
      (status?.permissions.length ?? 0) > 0
        ? "complete"
        : required
          ? "not_started"
          : "skipped",
      status?.permissions.length
        ? `${status.permissions.length} scopes granted`
        : "Awaiting authentication",
    ),
    item(
      "simpro-sync",
      "Sync status",
      syncOk
        ? "complete"
        : connected
          ? "in_progress"
          : required
            ? "not_started"
            : "skipped",
      status?.syncHealth ?? "idle",
      syncOk ? status?.lastSynchronisation ?? null : null,
    ),
  ];
  return {
    providerId: "simpro",
    label: "Simpro",
    required,
    items,
    overallStatus: overallStatus(items),
  };
}

function buildSalesforceChecklist(
  tenantId: string,
  asOf: string,
  required: boolean,
): PilotProviderChecklist {
  const status = getSalesforceConnectionRegistry().adminStatus(tenantId);
  const connected = status?.tenantStatus === "connected";
  const syncOk = status?.syncHealth === "healthy";
  const items = [
    item(
      "sf-connect",
      "Connection status",
      connected ? "complete" : required ? "not_started" : "skipped",
      connected ? "Connected" : required ? "Not connected" : "Not required",
      connected ? status?.lastSynchronisation ?? asOf : null,
    ),
    item(
      "sf-permissions",
      "Permissions granted",
      (status?.permissions.length ?? 0) > 0
        ? "complete"
        : required
          ? "not_started"
          : "skipped",
      status?.permissions.length
        ? `${status.permissions.length} scopes granted`
        : "Awaiting Connected App consent",
    ),
    item(
      "sf-sync",
      "Sync status",
      syncOk
        ? "complete"
        : connected
          ? "in_progress"
          : required
            ? "not_started"
            : "skipped",
      status?.syncHealth ?? "idle",
      syncOk ? status?.lastSynchronisation ?? null : null,
    ),
  ];
  return {
    providerId: "salesforce",
    label: "Salesforce",
    required,
    items,
    overallStatus: overallStatus(items),
  };
}

function buildDiscoveryValidationItems(
  tenantId: string,
  asOf: string,
): PilotChecklistItem[] {
  const session = loadDiscoverySession(tenantId);
  const discoveryComplete = Boolean(
    session?.progress.phase === "complete" || session?.brief,
  );
  const validationComplete = Boolean(
    session &&
      session.discoveries.length > 0 &&
      session.discoveries.every((d) => d.status !== "proposed"),
  );
  const briefGenerated = Boolean(session?.brief);
  return [
    item(
      "discovery-complete",
      "Discovery complete",
      discoveryComplete ? "complete" : "not_started",
      discoveryComplete
        ? `Discovered ${session?.discoveries.length ?? 0} signals`
        : "Executive Discovery not finished",
      discoveryComplete ? session?.maturity?.startedAt ?? asOf : null,
    ),
    item(
      "validation-complete",
      "Validation complete",
      validationComplete
        ? "complete"
        : session?.discoveries.length
          ? "in_progress"
          : "not_started",
      validationComplete
        ? "All discoveries confirmed, edited, or ignored"
        : "Outstanding validation requests remain",
    ),
    item(
      "first-brief",
      "First Executive Brief generated",
      briefGenerated ? "complete" : "not_started",
      briefGenerated
        ? "First briefing available"
        : "Awaiting first Executive Brief",
      briefGenerated ? asOf : null,
    ),
  ];
}

export function buildProviderChecklists(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): PilotProviderChecklist[] {
  const asOf = input.asOf ?? new Date().toISOString();
  const profile = getIntelligenceProfile(input.profileId);
  const required = new Set(profile.requiredProviders);

  const checklists: PilotProviderChecklist[] = [
    buildM365Checklist(input.tenantId, asOf),
  ];

  if (required.has("simpro") || profile.recommendedProviders.includes("simpro")) {
    checklists.push(
      buildSimproChecklist(input.tenantId, asOf, required.has("simpro")),
    );
  }
  if (
    required.has("salesforce") ||
    profile.recommendedProviders.includes("salesforce")
  ) {
    checklists.push(
      buildSalesforceChecklist(
        input.tenantId,
        asOf,
        required.has("salesforce"),
      ),
    );
  }

  // Attach shared discovery/validation/brief items onto the first checklist for rollup UX
  const shared = buildDiscoveryValidationItems(input.tenantId, asOf);
  checklists[0] = {
    ...checklists[0]!,
    items: [...checklists[0]!.items, ...shared],
    overallStatus: overallStatus([...checklists[0]!.items, ...shared]),
  };

  return checklists;
}

export function checklistCompletionPct(
  checklists: PilotProviderChecklist[],
): number {
  const items = checklists.flatMap((c) =>
    c.items.filter((i) => i.status !== "skipped"),
  );
  if (items.length === 0) return 0;
  const done = items.filter((i) => i.status === "complete").length;
  return Math.round((done / items.length) * 100);
}

export function requiredProvidersConnected(
  checklists: PilotProviderChecklist[],
): { connected: number; required: number } {
  const required = checklists.filter((c) => c.required);
  const connected = required.filter((c) =>
    c.items.some(
      (i) => i.id.endsWith("-connect") && i.status === "complete",
    ),
  );
  return { connected: connected.length, required: required.length };
}

export type { PilotProviderChecklistId };
