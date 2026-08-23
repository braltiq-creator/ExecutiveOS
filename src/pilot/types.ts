/**
 * Pilot Readiness Toolkit — types for Braltiq implementation & CS teams.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { DataResidency } from "@/runtime/tenant/types";

export type PilotLifecycleStage =
  | "prospect"
  | "invited"
  | "provisioning"
  | "connecting_providers"
  | "executive_discovery"
  | "validation"
  | "first_executive_brief"
  | "active_pilot"
  | "review"
  | "pilot_complete";

export const PILOT_LIFECYCLE_STAGES: PilotLifecycleStage[] = [
  "prospect",
  "invited",
  "provisioning",
  "connecting_providers",
  "executive_discovery",
  "validation",
  "first_executive_brief",
  "active_pilot",
  "review",
  "pilot_complete",
];

export type PilotEnvironment = "sandbox" | "pilot" | "production";

export type PilotChecklistItemStatus =
  | "not_started"
  | "in_progress"
  | "complete"
  | "blocked"
  | "skipped";

export type PilotProviderChecklistId =
  | "microsoft365"
  | "simpro"
  | "salesforce";

export type PilotChecklistItem = {
  id: string;
  label: string;
  status: PilotChecklistItemStatus;
  detail: string;
  completedAt: string | null;
};

export type PilotProviderChecklist = {
  providerId: PilotProviderChecklistId;
  label: string;
  required: boolean;
  items: PilotChecklistItem[];
  overallStatus: PilotChecklistItemStatus;
};

export type ExplainedReadinessComponent = {
  id: string;
  label: string;
  score: number;
  weight: number;
  explanation: string;
  evidence: string[];
  gaps: string[];
};

export type PilotReadinessScore = {
  tenantId: string;
  asOf: string;
  overall: number;
  components: ExplainedReadinessComponent[];
  readyForActivePilot: boolean;
  explanation: string;
};

export type PilotDiagnosticSeverity = "critical" | "high" | "moderate" | "low";

export type PilotDiagnostic = {
  id: string;
  severity: PilotDiagnosticSeverity;
  title: string;
  detail: string;
  remediation: string[];
  relatedProviderId?: PilotProviderChecklistId;
};

export type PilotSuccessMetrics = {
  tenantId: string;
  asOf: string;
  timeToFirstBriefMinutes: number | null;
  timeToOperationalReadinessHours: number | null;
  executiveEngagementPct: number;
  dailyActiveUsers: number;
  recommendationUsefulnessPct: number;
  readinessTrend: "up" | "flat" | "down";
  pilotCompletionRate: number;
  explanation: string;
};

export type PilotRecord = {
  id: string;
  tenantId: string;
  /** Organisation id from tenant configuration — binds Pilot Day N to active snapshot. */
  organisationId: string;
  partnerName: string;
  industry: string;
  intelligenceProfileId: IntelligenceProfileId;
  environment: PilotEnvironment;
  region: DataResidency;
  administratorEmail: string;
  stage: PilotLifecycleStage;
  stageTimestamps: Partial<Record<PilotLifecycleStage, string>>;
  createdAt: string;
  updatedAt: string;
  notes: string[];
  /**
   * Explicit pilot clock start. Day N of 30 is only shown when set.
   * Never invent this date.
   */
  pilotStartedAt?: string | null;
  /** Product focus for this Design Partner — generic module id. */
  focusModule?: "manufacturing_forecasting" | null;
  /** When true, retention labels may cite tenant configuration. */
  retentionConfigured?: boolean;
  retentionAuditDays?: number | null;
};

export type ProvisionPilotInput = {
  partnerName: string;
  industry: string;
  intelligenceProfileId: IntelligenceProfileId;
  administratorEmail: string;
  region?: DataResidency;
  environment?: PilotEnvironment;
  seats?: number;
  asOf?: string;
  tenantSlug?: string;
  pilotStartedAt?: string | null;
  focusModule?: "manufacturing_forecasting" | null;
};

export type ProvisionPilotResult = {
  pilot: PilotRecord;
  tenantId: string;
  checklist: PilotProviderChecklist[];
  playbookId: string;
  message: string;
};

export type PilotHealthSnapshot = {
  tenantId: string;
  asOf: string;
  lifecycleStage: PilotLifecycleStage;
  readiness: PilotReadinessScore;
  diagnostics: PilotDiagnostic[];
  checklist: PilotProviderChecklist[];
  success: PilotSuccessMetrics;
  providersHealthy: number;
  providersRequired: number;
};

export type PilotExportKind =
  | "readiness_report"
  | "deployment_summary"
  | "executive_adoption"
  | "connector_health"
  | "validation_summary";

export type PilotExportDocument = {
  kind: PilotExportKind;
  title: string;
  tenantId: string;
  partnerName: string;
  generatedAt: string;
  markdown: string;
};
