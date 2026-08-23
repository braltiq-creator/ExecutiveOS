export {
  INITIATIVE_PROGRESS_STATES,
} from "@/initiatives/models/types";

export const PROGRESS_LABELS: Record<
  import("@/initiatives/models/types").InitiativeProgressState,
  string
> = {
  not_started: "Not Started",
  mobilising: "Mobilising",
  on_track: "On Track",
  watch: "Watch",
  at_risk: "At Risk",
  blocked: "Blocked",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PRIORITY_LABELS: Record<
  import("@/initiatives/models/types").InitiativePriority,
  string
> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  watch: "Watch",
};

export const MOMENTUM_LABELS = {
  building: "Building",
  steady: "Steady",
  drifting: "Drifting",
  stalled: "Stalled",
} as const;
