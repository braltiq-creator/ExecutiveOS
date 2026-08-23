/**
 * Self-service provisioning orchestrator.
 * Idempotent steps — failed jobs retry safely from incomplete steps.
 */

import { createCustomerAccount } from "@/provisioning/identity/account";
import { createProvisionedOrganisation } from "@/provisioning/organisation/create";
import {
  activateTenant,
  buildSelfServiceTenant,
} from "@/provisioning/tenant-provisioning/create";
import { buildTenantWorkspaces } from "@/provisioning/workspace-builder/build";
import { getProvisioningProfile } from "@/provisioning/executive-profile/catalog";
import { assignExecutiveProfile } from "@/provisioning/executive-profile/assign";
import { assignTrialLicence } from "@/provisioning/licensing/assign";
import { createThirtyDayTrial } from "@/provisioning/trial/manage";
import { assignIntelligencePacks } from "@/provisioning/pack-assignment/assign";
import {
  enableExecutiveCouncil,
  generateTenantApiKeys,
  provisionDefaultDashboard,
  provisionKnowledgeGraph,
  provisionOrganisationalMemory,
  provisionStrategy,
} from "@/provisioning/bootstrap/resources";
import { queueProvisioningEmail } from "@/provisioning/email/send";
import { appendProvisioningAudit } from "@/provisioning/audit/log";
import { validateStartFreeTrialInput } from "@/provisioning/validation/validate";
import { buildOnboardingKickoff } from "@/provisioning/onboarding/bridge";
import {
  getAccount,
  getJob,
  getOrganisation,
  listJobs,
  nextJobId,
  saveJob,
} from "@/provisioning/store";
import type {
  ProvisioningJob,
  ProvisioningResult,
  ProvisioningStepId,
  ProvisioningStepResult,
  StartFreeTrialInput,
} from "@/provisioning/types";

function stepDone(
  job: ProvisioningJob,
  step: ProvisioningStepId,
): boolean {
  return job.completedStepIds.includes(step);
}

function recordStep(
  job: ProvisioningJob,
  step: ProvisioningStepId,
  detail: string,
  error?: string,
): ProvisioningJob {
  const now = new Date().toISOString();
  const result: ProvisioningStepResult = {
    step,
    status: error ? "failed" : "completed",
    startedAt: now,
    finishedAt: now,
    detail,
    error,
  };
  const steps = [...job.steps.filter((s) => s.step !== step), result];
  const completedStepIds = error
    ? job.completedStepIds.filter((id) => id !== step)
    : job.completedStepIds.includes(step)
      ? job.completedStepIds
      : [...job.completedStepIds, step];
  return saveJob({
    ...job,
    steps,
    completedStepIds,
    updatedAt: now,
    error: error ?? job.error,
    status: error ? "failed" : job.status,
  });
}

/**
 * Full customer journey: account → profile → provision → /onboarding
 */
export function startFreeTrial(input: StartFreeTrialInput): ProvisioningResult {
  const validation = validateStartFreeTrialInput(input);
  if (!validation.ok) {
    const asOf = input.asOf ?? new Date().toISOString();
    const failed: ProvisioningJob = {
      id: nextJobId(),
      status: "failed",
      accountId: "",
      organisationId: null,
      tenantId: null,
      executiveProfileId: input.executiveProfileId,
      intelligenceProfileId: "operations_executive",
      packIds: [],
      steps: [],
      completedStepIds: [],
      apiKeys: [],
      trialId: null,
      redirectPath: "/onboarding",
      createdAt: asOf,
      updatedAt: asOf,
      finishedAt: asOf,
      durationMs: 0,
      error: validation.errors.join("; "),
      retryCount: 0,
    };
    saveJob(failed);
    return {
      ok: false,
      job: failed,
      redirectPath: null,
      message: failed.error ?? "Validation failed",
    };
  }

  const asOf = input.asOf ?? new Date().toISOString();
  const started = Date.now();
  const profile = getProvisioningProfile(input.executiveProfileId);

  const accountResult = createCustomerAccount({
    name: input.name,
    email: input.email,
    password: input.password,
    company: input.company,
    asOf,
  });
  if (!accountResult.ok) {
    const failed: ProvisioningJob = {
      id: nextJobId(),
      status: "failed",
      accountId: "",
      organisationId: null,
      tenantId: null,
      executiveProfileId: input.executiveProfileId,
      intelligenceProfileId: profile.intelligenceProfileId,
      packIds: profile.packIds,
      steps: [],
      completedStepIds: [],
      apiKeys: [],
      trialId: null,
      redirectPath: "/onboarding",
      createdAt: asOf,
      updatedAt: asOf,
      finishedAt: asOf,
      durationMs: Date.now() - started,
      error: accountResult.error,
      retryCount: 0,
    };
    saveJob(failed);
    return {
      ok: false,
      job: failed,
      redirectPath: null,
      message: accountResult.error,
    };
  }

  let job: ProvisioningJob = {
    id: nextJobId(),
    status: "running",
    accountId: accountResult.account.id,
    organisationId: null,
    tenantId: null,
    executiveProfileId: input.executiveProfileId,
    intelligenceProfileId: profile.intelligenceProfileId,
    packIds: profile.packIds,
    steps: [],
    completedStepIds: [],
    apiKeys: [],
    trialId: null,
    redirectPath: "/onboarding",
    createdAt: asOf,
    updatedAt: asOf,
    finishedAt: null,
    durationMs: null,
    error: null,
    retryCount: 0,
  };
  saveJob(job);
  job = recordStep(job, "create_account", `Account ${accountResult.account.id}`);

  job = runProvisioningSteps(job, {
    company: input.company,
    region: input.region ?? "au",
    asOf,
    accountEmail: accountResult.account.email,
    accountName: accountResult.account.name,
  });

  job = saveJob({
    ...job,
    durationMs: Date.now() - started,
    finishedAt: new Date().toISOString(),
  });

  if (job.status === "completed") {
    return {
      ok: true,
      job,
      redirectPath: "/onboarding",
      message: `Tenant ready — continue to onboarding`,
    };
  }

  return {
    ok: false,
    job,
    redirectPath: null,
    message: job.error ?? "Provisioning failed",
  };
}

function runProvisioningSteps(
  job: ProvisioningJob,
  ctx: {
    company: string;
    region: "au" | "eu" | "us" | "uk" | "apac" | "global";
    asOf: string;
    accountEmail: string;
    accountName: string;
  },
): ProvisioningJob {
  const profile = getProvisioningProfile(job.executiveProfileId);
  let current = job;

  try {
    if (!stepDone(current, "create_organisation")) {
      const org = createProvisionedOrganisation({
        accountId: current.accountId,
        company: ctx.company,
        asOf: ctx.asOf,
      });
      current = saveJob({ ...current, organisationId: org.id });
      current = recordStep(current, "create_organisation", org.id);
    }

    if (!stepDone(current, "create_tenant") && current.organisationId) {
      const org = getOrganisation(current.organisationId);
      const slug = org?.slug ?? `cust-${current.accountId}`;
      const tenant = buildSelfServiceTenant({
        organisationId: current.organisationId,
        company: ctx.company,
        slug,
        profile,
        region: ctx.region,
        asOf: ctx.asOf,
      });
      current = saveJob({ ...current, tenantId: tenant.id });
      current = recordStep(current, "create_tenant", tenant.id);
    }

    if (!current.tenantId || !current.organisationId) {
      throw new Error("Tenant or organisation missing after create steps");
    }

    const tenantId = current.tenantId;
    const organisationId = current.organisationId;

    if (!stepDone(current, "create_workspace")) {
      const workspaces = buildTenantWorkspaces(tenantId);
      current = recordStep(
        current,
        "create_workspace",
        `${workspaces.length} workspaces`,
      );
    }

    if (!stepDone(current, "assign_trial_licence")) {
      const license = assignTrialLicence({
        tenantId,
        profile,
        asOf: ctx.asOf,
      });
      const trial = createThirtyDayTrial({
        tenantId,
        organisationId,
        asOf: ctx.asOf,
      });
      current = saveJob({ ...current, trialId: trial.id });
      current = recordStep(
        current,
        "assign_trial_licence",
        `License ${license.id}; trial ${trial.id} (30 days)`,
      );
    }

    if (!stepDone(current, "create_executive_council")) {
      enableExecutiveCouncil(tenantId, ctx.asOf);
      current = recordStep(
        current,
        "create_executive_council",
        "Executive Council enabled for tenant",
      );
    }

    if (!stepDone(current, "assign_intelligence_pack")) {
      const packs = assignIntelligencePacks(profile);
      if (!packs.ok) {
        throw new Error(packs.errors.join("; "));
      }
      current = saveJob({ ...current, packIds: packs.packIds });
      current = recordStep(current, "assign_intelligence_pack", packs.detail);
    }

    if (!stepDone(current, "assign_executive_profile")) {
      assignExecutiveProfile({
        tenantId,
        profile,
        asOf: ctx.asOf,
      });
      current = recordStep(
        current,
        "assign_executive_profile",
        profile.intelligenceProfileId,
      );
    }

    if (!stepDone(current, "provision_knowledge_graph")) {
      provisionKnowledgeGraph(tenantId, ctx.asOf);
      current = recordStep(
        current,
        "provision_knowledge_graph",
        "Knowledge Graph ready",
      );
    }

    if (!stepDone(current, "provision_organisational_memory")) {
      provisionOrganisationalMemory(tenantId, ctx.asOf);
      current = recordStep(
        current,
        "provision_organisational_memory",
        "Organisational Memory ready",
      );
    }

    if (!stepDone(current, "provision_strategy")) {
      provisionStrategy(tenantId, ctx.asOf);
      current = recordStep(current, "provision_strategy", "Strategy ready");
    }

    if (!stepDone(current, "provision_default_dashboard")) {
      provisionDefaultDashboard(tenantId, ctx.asOf);
      current = recordStep(
        current,
        "provision_default_dashboard",
        "Default dashboard ready",
      );
    }

    if (!stepDone(current, "generate_api_keys")) {
      const keys = generateTenantApiKeys({ tenantId, asOf: ctx.asOf });
      current = saveJob({
        ...current,
        apiKeys: [
          {
            id: keys.artefact.id,
            tenantId,
            label: "Default live key",
            keyId: keys.keyId,
            secretPreview: keys.secretPreview,
            createdAt: ctx.asOf,
          },
        ],
      });
      current = recordStep(
        current,
        "generate_api_keys",
        keys.keyId,
      );
    }

    if (!stepDone(current, "create_audit_records")) {
      appendProvisioningAudit({
        tenantId,
        actorUserId: current.accountId,
        summary: `Self-service tenant provisioned (${profile.name})`,
        resourceType: "tenant",
        resourceId: tenantId,
        asOf: ctx.asOf,
        metadata: {
          profile: profile.id,
          packs: current.packIds.join(",") || "none",
        },
      });
      appendProvisioningAudit({
        tenantId,
        actorUserId: current.accountId,
        summary: "Trial licence assigned",
        resourceType: "license",
        resourceId: current.trialId ?? "trial",
        asOf: ctx.asOf,
        metadata: { action: "license_change" },
      });
      current = recordStep(
        current,
        "create_audit_records",
        "Audit trail written",
      );
    }

    if (!stepDone(current, "queue_welcome_email")) {
      queueProvisioningEmail({
        templateId: "welcome",
        to: ctx.accountEmail,
        tenantId,
        vars: {
          name: ctx.accountName,
          company: ctx.company,
          onboardingUrl: "/onboarding",
        },
        asOf: ctx.asOf,
      });
      queueProvisioningEmail({
        templateId: "verify_email",
        to: ctx.accountEmail,
        tenantId,
        vars: {
          name: ctx.accountName,
          verifyUrl: `/verify?account=${current.accountId}`,
        },
        asOf: ctx.asOf,
      });
      current = recordStep(
        current,
        "queue_welcome_email",
        "Welcome + verify emails queued",
      );
    }

    if (!stepDone(current, "ready_for_onboarding")) {
      activateTenant(tenantId);
      buildOnboardingKickoff({
        tenantId,
        userId: current.accountId,
      });
      current = recordStep(
        current,
        "ready_for_onboarding",
        "Redirect /onboarding",
      );
    }

    return saveJob({
      ...current,
      status: "completed",
      error: null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return saveJob({
      ...current,
      status: "failed",
      error: message,
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Retry a failed job — resumes incomplete steps only (safe).
 */
export function retryProvisioning(jobId: string): ProvisioningResult {
  const job = getJob(jobId);
  if (!job) {
    throw new Error(`Unknown provisioning job: ${jobId}`);
  }
  if (job.status === "completed") {
    return {
      ok: true,
      job,
      redirectPath: "/onboarding",
      message: "Already completed",
    };
  }

  const account = getAccount(job.accountId);
  if (!account) {
    return {
      ok: false,
      job,
      redirectPath: null,
      message: "Account missing — cannot retry",
    };
  }

  const started = Date.now();
  let current = saveJob({
    ...job,
    status: "running",
    error: null,
    retryCount: job.retryCount + 1,
    updatedAt: new Date().toISOString(),
  });

  current = runProvisioningSteps(current, {
    company: account.company,
    region: "au",
    asOf: new Date().toISOString(),
    accountEmail: account.email,
    accountName: account.name,
  });

  current = saveJob({
    ...current,
    durationMs: (job.durationMs ?? 0) + (Date.now() - started),
    finishedAt: new Date().toISOString(),
  });

  return {
    ok: current.status === "completed",
    job: current,
    redirectPath: current.status === "completed" ? "/onboarding" : null,
    message:
      current.status === "completed"
        ? "Provisioning completed on retry"
        : current.error ?? "Retry failed",
  };
}

export function getProvisioningJob(jobId: string): ProvisioningJob | undefined {
  return getJob(jobId);
}

export function listProvisioningJobs(): ProvisioningJob[] {
  return listJobs();
}
