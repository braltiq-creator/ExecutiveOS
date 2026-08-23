"use server";

import { requireAuth } from "@/lib/auth/actions";
import {
  loadCalendarPageData,
  syncMicrosoft365Calendar,
} from "@/lib/calendar/service";
import type { ExecutiveDayIntelligence } from "@/lib/intelligence/providers/types";
import { IntegrationError } from "@/lib/integrations/types";
import { OrganizationError } from "@/lib/organizations/types";

export type CalendarActionResult<T> = {
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

export async function loadCalendarPageDataAction(): Promise<ExecutiveDayIntelligence> {
  const user = await requireAuth();
  return loadCalendarPageData(user.id);
}

export async function syncCalendarAction(): Promise<CalendarActionResult<null>> {
  try {
    const user = await requireAuth();
    await syncMicrosoft365Calendar(user.id);
    return { error: null, data: null };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}
