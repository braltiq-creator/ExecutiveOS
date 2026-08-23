import type {
  FeatureFlagRecord,
  MaintenanceWindow,
  ReleaseManagementSnapshot,
  ReleaseRecord,
} from "@/operations/observability/types";

const releases: ReleaseRecord[] = [];
const flags = new Map<string, FeatureFlagRecord>();
const windows: MaintenanceWindow[] = [];
const knownIssues: Array<{ id: string; title: string; severity: string }> = [];

export function resetReleaseManagement(): void {
  releases.length = 0;
  flags.clear();
  windows.length = 0;
  knownIssues.length = 0;
}

export function ensureDefaultReleaseState(asOf = new Date().toISOString()): void {
  if (releases.length > 0) return;

  releases.push(
    {
      version: "1.0.0",
      deployedAt: asOf,
      environment: "production",
      rollbackReady: true,
      knownIssueIds: ["KI-001", "KI-002"],
      notes: "Version 1 controlled commercial release",
    },
    {
      version: "0.9.0",
      deployedAt: new Date(Date.parse(asOf) - 86400000 * 14).toISOString(),
      environment: "pilot",
      rollbackReady: true,
      knownIssueIds: [],
      notes: "Design partner preview",
    },
  );

  const defaults: FeatureFlagRecord[] = [
    {
      id: "ff-adaptive",
      name: "Adaptive learning",
      enabled: true,
      audience: "all",
      description: "Explainable personalisation above Core",
    },
    {
      id: "ff-council-ui",
      name: "Council UI migration",
      enabled: false,
      audience: "internal",
      description: "Surface src/agents Council on Decisions",
    },
    {
      id: "ff-knowledge-explorer",
      name: "Knowledge explorer",
      enabled: false,
      audience: "design_partners",
      description: "Primary-nav knowledge depth (KI-001)",
    },
  ];
  for (const flag of defaults) flags.set(flag.id, flag);

  knownIssues.push(
    {
      id: "KI-001",
      title: "Knowledge/Reports foundations",
      severity: "high",
    },
    {
      id: "KI-002",
      title: "In-memory platform stores",
      severity: "high",
    },
  );

  windows.push({
    id: "maint-1",
    startsAt: new Date(Date.parse(asOf) + 86400000 * 7).toISOString(),
    endsAt: new Date(Date.parse(asOf) + 86400000 * 7 + 3600000).toISOString(),
    summary: "Scheduled connector certificate rotation",
    status: "scheduled",
  });
}

export function recordDeployment(input: Omit<ReleaseRecord, "deployedAt"> & {
  deployedAt?: string;
}): ReleaseRecord {
  const record: ReleaseRecord = {
    ...input,
    deployedAt: input.deployedAt ?? new Date().toISOString(),
  };
  releases.unshift(record);
  return record;
}

export function setFeatureFlag(
  id: string,
  enabled: boolean,
): FeatureFlagRecord | null {
  const current = flags.get(id);
  if (!current) return null;
  const next = { ...current, enabled };
  flags.set(id, next);
  return next;
}

export function buildReleaseManagementSnapshot(
  asOf = new Date().toISOString(),
): ReleaseManagementSnapshot {
  ensureDefaultReleaseState(asOf);
  const current = releases[0]!;
  return {
    asOf,
    currentVersion: current.version,
    history: [...releases],
    featureFlags: [...flags.values()],
    knownIssues: [...knownIssues],
    maintenanceWindows: [...windows],
    rollbackReady: current.rollbackReady,
    explanation: `Current ${current.version} · rollback ${
      current.rollbackReady ? "ready" : "not ready"
    } · ${knownIssues.length} known issues tracked.`,
  };
}
