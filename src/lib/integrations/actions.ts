"use server";

import { requireAuth } from "@/lib/auth/actions";
import {
  disconnectIntegration,
  getIntegrationsPageData,
  refreshIntegrationTokens,
  startIntegrationConnect,
  syncIntegration,
} from "@/lib/integrations/service";
import type { IntegrationsPageData } from "@/lib/integrations/types";
import { IntegrationError } from "@/lib/integrations/types";
import { OrganizationError } from "@/lib/organizations/types";
import { redirect } from "next/navigation";

export type IntegrationActionResult<T> = {
  error: string | null;
  data: T | null;
};

function formatError(error: unknown): string {
  if (
    error instanceof IntegrationError ||
    error instanceof OrganizationError ||
    error instanceof Error
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function loadIntegrationsPageData(): Promise<IntegrationsPageData> {
  const user = await requireAuth();
  return getIntegrationsPageData(user.id);
}

export async function connectIntegrationAction(input: {
  providerId: string;
}): Promise<IntegrationActionResult<never>> {
  const user = await requireAuth();
  const { authorizationUrl } = await startIntegrationConnect(user.id, input);
  redirect(authorizationUrl);
}

export async function disconnectIntegrationAction(input: {
  integrationId: string;
}): Promise<IntegrationActionResult<null>> {
  try {
    const user = await requireAuth();
    await disconnectIntegration(user.id, input);
    return { error: null, data: null };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function syncIntegrationAction(input: {
  integrationId: string;
}): Promise<IntegrationActionResult<null>> {
  try {
    const user = await requireAuth();
    await syncIntegration(user.id, input);
    return { error: null, data: null };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function refreshIntegrationTokensAction(input: {
  integrationId: string;
}): Promise<IntegrationActionResult<null>> {
  try {
    const user = await requireAuth();
    await refreshIntegrationTokens(user.id, input.integrationId);
    return { error: null, data: null };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}
