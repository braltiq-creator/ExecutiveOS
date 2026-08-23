/**
 * Customer Provisioning Platform — Phase 53
 * Commercial SaaS self-service. Does not modify Core, Council, or Packs.
 */

import type { IntelligenceProfileId } from "@/profiles";

/** Customer-facing executive profile choice (buyable packaging). */
export type ProvisioningExecutiveProfileId =
  | "operations_executive"
  | "commercial_executive"
  | "manufacturing_executive";

export type ProvisioningStepId =
  | "create_account"
  | "create_organisation"
  | "create_tenant"
  | "create_workspace"
  | "assign_trial_licence"
  | "create_executive_council"
  | "assign_intelligence_pack"
  | "assign_executive_profile"
  | "provision_knowledge_graph"
  | "provision_organisational_memory"
  | "provision_strategy"
  | "provision_default_dashboard"
  | "generate_api_keys"
  | "create_audit_records"
  | "queue_welcome_email"
  | "ready_for_onboarding";

export type ProvisioningJobStatus =
  | "pending"
  | "running"
  | "awaiting_verification"
  | "completed"
  | "failed"
  | "cancelled";

export type ProvisioningStepResult = {
  step: ProvisioningStepId;
  status: "completed" | "failed" | "skipped";
  startedAt: string;
  finishedAt: string;
  detail: string;
  error?: string;
};

export type CustomerAccount = {
  id: string;
  name: string;
  email: string;
  /** Password never stored in clear — mock hash only */
  passwordHash: string;
  company: string;
  emailVerified: boolean;
  createdAt: string;
};

export type ProvisionedOrganisation = {
  id: string;
  name: string;
  slug: string;
  accountId: string;
  createdAt: string;
};

export type ProvisionedApiKey = {
  id: string;
  tenantId: string;
  label: string;
  /** Prefixed public id — secret shown once at creation */
  keyId: string;
  secretPreview: string;
  createdAt: string;
};

export type TrialRecord = {
  id: string;
  tenantId: string;
  organisationId: string;
  startsAt: string;
  endsAt: string;
  daysTotal: number;
  status: "active" | "expiring_soon" | "expired" | "converted";
  usage: {
    executives: number;
    executivesLimit: number;
    connectors: number;
    connectorsLimit: number;
  };
  upgradePromptedAt: string | null;
};

export type EmailTemplateId =
  | "welcome"
  | "verify_email"
  | "connect_microsoft_365"
  | "connect_simpro"
  | "connect_salesforce"
  | "trial_reminder"
  | "executive_brief_ready"
  | "subscription_confirmation";

export type QueuedEmail = {
  id: string;
  templateId: EmailTemplateId;
  to: string;
  tenantId: string | null;
  subject: string;
  body: string;
  queuedAt: string;
  status: "queued" | "sent" | "failed";
};

export type StartFreeTrialInput = {
  name: string;
  email: string;
  password: string;
  company: string;
  executiveProfileId: ProvisioningExecutiveProfileId;
  region?: "au" | "eu" | "us" | "uk" | "apac" | "global";
  asOf?: string;
};

export type ProvisioningJob = {
  id: string;
  status: ProvisioningJobStatus;
  accountId: string;
  organisationId: string | null;
  tenantId: string | null;
  executiveProfileId: ProvisioningExecutiveProfileId;
  intelligenceProfileId: IntelligenceProfileId;
  packIds: string[];
  steps: ProvisioningStepResult[];
  completedStepIds: ProvisioningStepId[];
  apiKeys: ProvisionedApiKey[];
  trialId: string | null;
  redirectPath: "/onboarding";
  createdAt: string;
  updatedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  error: string | null;
  retryCount: number;
};

export type ProvisioningResult = {
  ok: boolean;
  job: ProvisioningJob;
  redirectPath: "/onboarding" | null;
  message: string;
};

export type OnboardingKickoff = {
  tenantId: string;
  userId: string;
  /** Only these are asked — Discovery reuses existing experience */
  ask: {
    role: true;
    topThreeStrategicOutcomes: true;
    preferredBriefingTime: true;
  };
  discoverAutomatically: string[];
  entryPath: "/onboarding";
};

export type ProvisioningAdminSnapshot = {
  asOf: string;
  organisations: Array<{
    organisationId: string;
    name: string;
    tenantId: string | null;
    status: ProvisioningJobStatus;
    executiveProfileId: ProvisioningExecutiveProfileId;
    createdAt: string;
  }>;
  jobsByStatus: Record<ProvisioningJobStatus, number>;
  failedJobs: ProvisioningJob[];
  trials: TrialRecord[];
  pendingVerification: CustomerAccount[];
};

export type ProvisioningSelfReview = {
  customerCanSelfProvision: boolean;
  underFiveMinutes: boolean;
  onboardingStartsImmediately: boolean;
  failuresRetrySafely: boolean;
  allPassed: boolean;
  notes: string[];
};
