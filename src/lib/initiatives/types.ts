export const INITIATIVE_STATUSES = [
  "planned",
  "active",
  "on_hold",
  "completed",
  "archived",
] as const;

export type InitiativeStatus = (typeof INITIATIVE_STATUSES)[number];

export const INITIATIVE_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type InitiativePriority = (typeof INITIATIVE_PRIORITIES)[number];

export const INITIATIVE_HEALTH_STATUSES = [
  "on_track",
  "at_risk",
  "off_track",
  "completed",
] as const;

export type InitiativeHealthStatus = (typeof INITIATIVE_HEALTH_STATUSES)[number];

export const INITIATIVE_LINK_TYPES = [
  "objective",
  "decision",
  "meeting",
  "memory",
  "meeting_action",
  "risk",
  "opportunity",
] as const;

export type InitiativeLinkType = (typeof INITIATIVE_LINK_TYPES)[number];

export const INITIATIVE_STATUS_LABELS: Record<InitiativeStatus, string> = {
  planned: "Planned",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived",
};

export const INITIATIVE_PRIORITY_LABELS: Record<InitiativePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const INITIATIVE_HEALTH_LABELS: Record<InitiativeHealthStatus, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  off_track: "Off Track",
  completed: "Completed",
};

export const INITIATIVE_LINK_LABELS: Record<InitiativeLinkType, string> = {
  objective: "Strategic Objective",
  decision: "Executive Decision",
  meeting: "Meeting",
  memory: "Executive Memory",
  meeting_action: "Action Item",
  risk: "Risk",
  opportunity: "Opportunity",
};

export type StrategicInitiativeRecord = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: InitiativeStatus;
  priority: InitiativePriority;
  owner: string;
  start_date: string;
  target_date: string | null;
  progress_percentage: number;
  health_status: InitiativeHealthStatus;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InitiativeLinkRecord = {
  id: string;
  initiative_id: string;
  user_id: string;
  link_type: InitiativeLinkType;
  linked_id: string;
  created_at: string;
};

export type InitiativeLinkInput = {
  linkType: InitiativeLinkType;
  linkedId: string;
};

export type SaveInitiativeInput = {
  id?: string;
  title: string;
  description: string;
  status: InitiativeStatus;
  priority: InitiativePriority;
  owner: string;
  startDate: string;
  targetDate?: string;
  progressPercentage: number;
  healthStatus?: InitiativeHealthStatus;
  links: InitiativeLinkInput[];
};

export type InitiativeQueryOptions = {
  includeArchived?: boolean;
  status?: InitiativeStatus;
};

export type InitiativeWithLinks = {
  initiative: StrategicInitiativeRecord;
  links: InitiativeLinkRecord[];
};

export type InitiativeLinkOption = {
  id: string;
  linkType: InitiativeLinkType;
  label: string;
  subtitle?: string;
};

export type InitiativeLinkCatalog = {
  objectives: InitiativeLinkOption[];
  decisions: InitiativeLinkOption[];
  meetings: InitiativeLinkOption[];
  memories: InitiativeLinkOption[];
  risks: InitiativeLinkOption[];
  opportunities: InitiativeLinkOption[];
  meetingActions: InitiativeLinkOption[];
};

export class StrategicInitiativeError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "StrategicInitiativeError";
    this.code = code;
  }
}

export function formatInitiativeStatus(status: InitiativeStatus): string {
  return INITIATIVE_STATUS_LABELS[status];
}

export function formatInitiativePriority(priority: InitiativePriority): string {
  return INITIATIVE_PRIORITY_LABELS[priority];
}

export function formatInitiativeHealth(
  health: InitiativeHealthStatus,
): string {
  return INITIATIVE_HEALTH_LABELS[health];
}

export function normalizeMemoryLinkType(
  linkType: InitiativeLinkType,
): InitiativeLinkType {
  if (linkType === "risk" || linkType === "opportunity") {
    return "memory";
  }

  return linkType;
}

export function storageLinkType(linkType: InitiativeLinkType): InitiativeLinkType {
  return linkType;
}
