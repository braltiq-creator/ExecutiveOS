/**
 * Resolve Design Partner vs Demo vs standard environment.
 * Never invents a pilot start date or customer identity.
 */

import type { ActiveExecutiveSnapshotContext } from "@/executive-snapshot-studio/launch";
import type { PilotRecord } from "@/pilot/types";
import type {
  DesignPartnerEnvironmentKind,
  DesignPartnerFocusModule,
  DesignPartnerPilotWeek,
  DesignPartnerStatus,
} from "./types";

export const DESIGN_PARTNER_PILOT_DAYS = 30;

export function focusLabelForModule(
  module: DesignPartnerFocusModule | null,
): string | null {
  if (module === "manufacturing_forecasting") {
    return "MANUFACTURING FORECASTING";
  }
  return null;
}

export function resolveFocusModule(input: {
  profileId?: string | null;
  focusModule?: DesignPartnerFocusModule | null;
  pilot?: PilotRecord | null;
}): DesignPartnerFocusModule | null {
  if (input.focusModule === "manufacturing_forecasting") {
    return "manufacturing_forecasting";
  }
  if (input.pilot?.focusModule === "manufacturing_forecasting") {
    return "manufacturing_forecasting";
  }
  if (input.profileId === "manufacturing") {
    return "manufacturing_forecasting";
  }
  return null;
}

export function resolveEnvironmentKind(input: {
  mode?: "demo" | "executive_snapshot" | "loading" | "unavailable" | string;
  pilot?: PilotRecord | null;
  activeSnapshot?: ActiveExecutiveSnapshotContext | null;
}): DesignPartnerEnvironmentKind {
  if (input.mode === "demo") return "demo";
  if (input.pilot?.environment === "pilot") return "design_partner";
  if (
    input.activeSnapshot?.profileId === "manufacturing" &&
    input.activeSnapshot.demoIsolation
  ) {
    return "design_partner";
  }
  if (input.mode === "executive_snapshot") return "standard";
  return "standard";
}

export function pilotDayOf(
  pilotStartedAt: string | null | undefined,
  asOf: string = new Date().toISOString(),
): number | null {
  if (!pilotStartedAt) return null;
  const start = Date.parse(pilotStartedAt);
  const now = Date.parse(asOf);
  if (!Number.isFinite(start) || !Number.isFinite(now) || now < start) {
    return null;
  }
  const day = Math.floor((now - start) / (24 * 60 * 60 * 1000)) + 1;
  if (day < 1) return null;
  return Math.min(day, DESIGN_PARTNER_PILOT_DAYS + 14);
}

export function pilotWeekFromDay(day: number | null): DesignPartnerPilotWeek {
  if (day == null) return "not_started";
  if (day <= 7) return "week_1";
  if (day <= 14) return "week_2";
  if (day <= 21) return "week_3";
  if (day <= 30) return "week_4";
  return "complete";
}

export function dataHealthFromReadiness(
  executiveReadiness: number | null,
  datasetReadiness: number | null,
): DesignPartnerStatus["dataHealth"] {
  const score = datasetReadiness ?? executiveReadiness;
  if (score == null) return "unknown";
  if (score >= 85) return "healthy";
  if (score >= 60) return "attention";
  return "insufficient";
}

export function retentionPolicyLabel(input: {
  configured?: boolean;
  auditDays?: number | null;
}): string {
  if (input.configured && input.auditDays != null) {
    return `Audit retention ${input.auditDays} days (tenant configuration).`;
  }
  return "Pilot retention policy not yet configured.";
}

export function buildDesignPartnerStatus(input: {
  mode?: string;
  pilot?: PilotRecord | null;
  activeSnapshot?: ActiveExecutiveSnapshotContext | null;
  asOf?: string;
}): DesignPartnerStatus {
  const kind = resolveEnvironmentKind(input);
  const focusModule = resolveFocusModule({
    profileId: input.activeSnapshot?.profileId,
    focusModule: input.pilot?.focusModule,
    pilot: input.pilot,
  });

  const day = pilotDayOf(input.pilot?.pilotStartedAt, input.asOf);
  const readiness = input.activeSnapshot?.readiness;
  const executiveReadiness = readiness?.executiveReadiness ?? null;
  const datasetReadiness =
    readiness?.commercialDatasetReadiness ??
    readiness?.dataQuality ??
    null;

  const snapshotLabel = input.activeSnapshot
    ? [
        input.activeSnapshot.filename?.replace(/\.[^.]+$/, "") ??
          "Forecast Snapshot",
        input.activeSnapshot.activatedAt.slice(0, 7),
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return {
    kind,
    label:
      kind === "design_partner"
        ? "DESIGN PARTNER ENVIRONMENT"
        : kind === "demo"
          ? "DEMO"
          : "EXECUTIVEOS",
    focusModule,
    focusLabel: focusLabelForModule(focusModule),
    snapshotId: input.activeSnapshot?.snapshotId ?? null,
    snapshotLabel,
    dataHealth: dataHealthFromReadiness(executiveReadiness, datasetReadiness),
    executiveReadiness,
    datasetReadiness,
    pilotDay: day,
    pilotDayLabel:
      day == null
        ? "Pilot not yet started"
        : `Design Partner · Day ${day} of ${DESIGN_PARTNER_PILOT_DAYS}`,
    pilotWeek: pilotWeekFromDay(day),
    retentionPolicyLabel: retentionPolicyLabel({
      configured: Boolean(input.pilot?.retentionConfigured),
      auditDays: input.pilot?.retentionAuditDays ?? null,
    }),
  };
}
