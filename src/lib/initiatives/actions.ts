"use server";

import { requireAuth } from "@/lib/auth/actions";
import {
  archiveInitiative,
  getInitiativeLinkCatalog,
  getInitiativesWithComputedHealth,
  saveInitiative,
} from "@/lib/initiatives/service";
import type {
  InitiativeLinkCatalog,
  InitiativeWithLinks,
  SaveInitiativeInput,
  StrategicInitiativeRecord,
} from "@/lib/initiatives/types";
import { StrategicInitiativeError } from "@/lib/initiatives/types";

export type InitiativeActionResult = {
  error: string | null;
  data: InitiativeWithLinks | null;
};

export async function saveInitiativeAction(
  input: SaveInitiativeInput,
): Promise<InitiativeActionResult> {
  try {
    const user = await requireAuth();
    const data = await saveInitiative(user.id, input);
    return { error: null, data };
  } catch (error) {
    return {
      error:
        error instanceof StrategicInitiativeError || error instanceof Error
          ? error.message
          : "Unable to save initiative.",
      data: null,
    };
  }
}

export async function archiveInitiativeAction(
  initiativeId: string,
): Promise<{ error: string | null; initiative: StrategicInitiativeRecord | null }> {
  try {
    const user = await requireAuth();
    const initiative = await archiveInitiative(user.id, initiativeId);
    return { error: null, initiative };
  } catch (error) {
    return {
      error:
        error instanceof StrategicInitiativeError || error instanceof Error
          ? error.message
          : "Unable to archive initiative.",
      initiative: null,
    };
  }
}

export async function loadInitiativesPageData(): Promise<{
  initiatives: InitiativeWithLinks[];
  linkCatalog: InitiativeLinkCatalog;
}> {
  const user = await requireAuth();
  const [initiatives, linkCatalog] = await Promise.all([
    getInitiativesWithComputedHealth(user.id),
    getInitiativeLinkCatalog(user.id),
  ]);

  return { initiatives, linkCatalog };
}
