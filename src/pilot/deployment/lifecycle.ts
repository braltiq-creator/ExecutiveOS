/**
 * Design Partner lifecycle — stage machine with timestamps.
 */

import {
  PILOT_LIFECYCLE_STAGES,
  type PilotLifecycleStage,
  type PilotRecord,
} from "@/pilot/types";

export function createPilotRecord(input: {
  id: string;
  tenantId: string;
  organisationId: string;
  partnerName: string;
  industry: string;
  intelligenceProfileId: PilotRecord["intelligenceProfileId"];
  environment: PilotRecord["environment"];
  region: PilotRecord["region"];
  administratorEmail: string;
  asOf: string;
  pilotStartedAt?: string | null;
  focusModule?: PilotRecord["focusModule"];
  retentionConfigured?: boolean;
  retentionAuditDays?: number | null;
}): PilotRecord {
  return {
    id: input.id,
    tenantId: input.tenantId,
    organisationId: input.organisationId,
    partnerName: input.partnerName,
    industry: input.industry,
    intelligenceProfileId: input.intelligenceProfileId,
    environment: input.environment,
    region: input.region,
    administratorEmail: input.administratorEmail,
    stage: "prospect",
    stageTimestamps: { prospect: input.asOf },
    createdAt: input.asOf,
    updatedAt: input.asOf,
    notes: [],
    pilotStartedAt: input.pilotStartedAt ?? null,
    focusModule: input.focusModule ?? null,
    retentionConfigured: input.retentionConfigured ?? false,
    retentionAuditDays: input.retentionAuditDays ?? null,
  };
}

export function advancePilotStage(
  pilot: PilotRecord,
  stage: PilotLifecycleStage,
  asOf: string,
  note?: string,
): PilotRecord {
  const currentIndex = PILOT_LIFECYCLE_STAGES.indexOf(pilot.stage);
  const nextIndex = PILOT_LIFECYCLE_STAGES.indexOf(stage);
  if (nextIndex < currentIndex && stage !== pilot.stage) {
    // Allow revisit for review flows, but keep earliest timestamp
  }
  const timestamps = { ...pilot.stageTimestamps };
  if (!timestamps[stage]) timestamps[stage] = asOf;
  return {
    ...pilot,
    stage,
    stageTimestamps: timestamps,
    updatedAt: asOf,
    notes: note
      ? [...pilot.notes, `${asOf}: ${note}`].slice(-50)
      : pilot.notes,
  };
}

export function lifecycleProgress(pilot: PilotRecord): {
  stage: PilotLifecycleStage;
  index: number;
  total: number;
  percent: number;
  completedStages: PilotLifecycleStage[];
} {
  const index = PILOT_LIFECYCLE_STAGES.indexOf(pilot.stage);
  const completedStages = PILOT_LIFECYCLE_STAGES.filter(
    (stage) => pilot.stageTimestamps[stage] != null,
  );
  return {
    stage: pilot.stage,
    index,
    total: PILOT_LIFECYCLE_STAGES.length,
    percent: Math.round(((index + 1) / PILOT_LIFECYCLE_STAGES.length) * 100),
    completedStages,
  };
}

export function hoursBetweenStages(
  pilot: PilotRecord,
  from: PilotLifecycleStage,
  to: PilotLifecycleStage,
): number | null {
  const a = pilot.stageTimestamps[from];
  const b = pilot.stageTimestamps[to];
  if (!a || !b) return null;
  return Math.max(
    0,
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / 3_600_000),
  );
}
