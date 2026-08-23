"use server";

import {
  retryProvisioning,
  startFreeTrial,
} from "@/provisioning/provision";
import { verifyCustomerEmail } from "@/provisioning/identity/account";
import type {
  ProvisioningExecutiveProfileId,
  ProvisioningResult,
} from "@/provisioning/types";

export async function startFreeTrialAction(input: {
  name: string;
  email: string;
  password: string;
  company: string;
  executiveProfileId: ProvisioningExecutiveProfileId;
}): Promise<ProvisioningResult> {
  return startFreeTrial(input);
}

export async function retryProvisioningAction(
  jobId: string,
): Promise<ProvisioningResult> {
  return retryProvisioning(jobId);
}

export async function verifyEmailAction(accountId: string): Promise<{
  ok: boolean;
  message: string;
}> {
  const account = verifyCustomerEmail(accountId);
  if (!account) {
    return { ok: false, message: "Account not found" };
  }
  return { ok: true, message: `Verified ${account.email}` };
}
