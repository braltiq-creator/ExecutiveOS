/**
 * Scheduling — declarative sync schedules for connectors.
 */

import type { SyncMode } from "@/connectivity/synchronisation";

export type SyncSchedule = {
  id: string;
  connectorId: string;
  mode: SyncMode;
  /** Cron-like expression or interval label */
  cadence: string;
  enabled: boolean;
  nextRunAt: string | null;
};

export type SchedulerState = {
  schedules: SyncSchedule[];
};

export function createSchedulerState(
  schedules: SyncSchedule[] = [],
): SchedulerState {
  return { schedules: [...schedules] };
}

export function dueSchedules(
  state: SchedulerState,
  asOf: string,
): SyncSchedule[] {
  return state.schedules.filter(
    (s) =>
      s.enabled &&
      (s.nextRunAt === null || new Date(s.nextRunAt) <= new Date(asOf)),
  );
}

export function markScheduleRun(
  state: SchedulerState,
  scheduleId: string,
  nextRunAt: string,
): SchedulerState {
  return {
    schedules: state.schedules.map((s) =>
      s.id === scheduleId ? { ...s, nextRunAt } : s,
    ),
  };
}
