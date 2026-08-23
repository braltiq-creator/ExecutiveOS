/**
 * 30-day trial management for self-service customers.
 */

import {
  getTrialByTenant,
  listTrials,
  nextTrialId,
  saveTrial,
} from "@/provisioning/store";
import type { TrialRecord } from "@/provisioning/types";
import { startTrialSubscription } from "@/growth/subscriptions";

const TRIAL_DAYS = 30;
const UPGRADE_PROMPT_DAYS = 7;

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function daysRemaining(endsAt: string, asOf: string): number {
  return Math.max(
    0,
    Math.ceil(
      (new Date(endsAt).getTime() - new Date(asOf).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
}

export function createThirtyDayTrial(input: {
  tenantId: string;
  organisationId: string;
  asOf: string;
}): TrialRecord {
  const existing = getTrialByTenant(input.tenantId);
  if (existing) return existing;

  // Align growth subscription for PLG surfaces (growth default may differ;
  // provisioning trial is the commercial source of truth for 30 days).
  startTrialSubscription({
    organizationId: input.organisationId,
    planId: "professional",
  });

  const trial: TrialRecord = {
    id: nextTrialId(),
    tenantId: input.tenantId,
    organisationId: input.organisationId,
    startsAt: input.asOf,
    endsAt: addDays(input.asOf, TRIAL_DAYS),
    daysTotal: TRIAL_DAYS,
    status: "active",
    usage: {
      executives: 1,
      executivesLimit: 1,
      connectors: 0,
      connectorsLimit: 3,
    },
    upgradePromptedAt: null,
  };
  return saveTrial(trial);
}

export function refreshTrialStatus(
  tenantId: string,
  asOf = new Date().toISOString(),
): TrialRecord | undefined {
  const trial = getTrialByTenant(tenantId);
  if (!trial) return undefined;

  const remaining = daysRemaining(trial.endsAt, asOf);
  let status = trial.status;
  let upgradePromptedAt = trial.upgradePromptedAt;

  if (remaining <= 0) {
    status = "expired";
  } else if (remaining <= UPGRADE_PROMPT_DAYS) {
    status = "expiring_soon";
    upgradePromptedAt = upgradePromptedAt ?? asOf;
  } else if (status !== "converted") {
    status = "active";
  }

  return saveTrial({
    ...trial,
    status,
    upgradePromptedAt,
  });
}

export function recordTrialUsage(input: {
  tenantId: string;
  executives?: number;
  connectors?: number;
}): TrialRecord | undefined {
  const trial = getTrialByTenant(input.tenantId);
  if (!trial) return undefined;
  return saveTrial({
    ...trial,
    usage: {
      ...trial.usage,
      executives: input.executives ?? trial.usage.executives,
      connectors: input.connectors ?? trial.usage.connectors,
    },
  });
}

export function getTrialDaysRemaining(
  tenantId: string,
  asOf = new Date().toISOString(),
): number {
  const trial = refreshTrialStatus(tenantId, asOf);
  if (!trial) return 0;
  return daysRemaining(trial.endsAt, asOf);
}

export function shouldPromptUpgrade(
  tenantId: string,
  asOf = new Date().toISOString(),
): boolean {
  const trial = refreshTrialStatus(tenantId, asOf);
  if (!trial) return false;
  return trial.status === "expiring_soon" || trial.status === "expired";
}

export function listAllTrials(): TrialRecord[] {
  return listTrials();
}

export { TRIAL_DAYS, UPGRADE_PROMPT_DAYS };
