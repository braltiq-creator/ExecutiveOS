import {
  archiveInitiativeRecord,
  insertInitiativeRecord,
  replaceInitiativeLinks,
  updateInitiativeHealthStatus,
  updateInitiativeRecord,
} from "@/lib/initiatives/mutations";
import {
  computeExecutiveHealthFromInput,
  loadHealthEngineInput,
} from "@/lib/health/service";
import { getInitiativeHealthAssessment } from "@/lib/health/engine";
import {
  fetchActiveInitiativesForIntelligence,
  fetchInitiativeById,
  fetchInitiativeLinkCatalog,
  fetchInitiativesWithLinks,
} from "@/lib/initiatives/queries";
import type {
  InitiativeHealthStatus,
  InitiativeLinkCatalog,
  InitiativeQueryOptions,
  InitiativeWithLinks,
  SaveInitiativeInput,
  StrategicInitiativeRecord,
} from "@/lib/initiatives/types";
import { StrategicInitiativeError } from "@/lib/initiatives/types";

function validateInitiativeInput(input: SaveInitiativeInput): void {
  if (!input.title.trim()) {
    throw new StrategicInitiativeError("Title is required.", "VALIDATION_ERROR");
  }
  if (!input.owner.trim()) {
    throw new StrategicInitiativeError("Owner is required.", "VALIDATION_ERROR");
  }
  if (!input.startDate) {
    throw new StrategicInitiativeError(
      "Start date is required.",
      "VALIDATION_ERROR",
    );
  }
  if (
    !Number.isFinite(input.progressPercentage) ||
    input.progressPercentage < 0 ||
    input.progressPercentage > 100
  ) {
    throw new StrategicInitiativeError(
      "Progress must be between 0 and 100.",
      "VALIDATION_ERROR",
    );
  }
}

async function persistComputedInitiativeHealth(
  userId: string,
  initiativeId: string,
): Promise<InitiativeHealthStatus> {
  const input = await loadHealthEngineInput(userId);
  const report = computeExecutiveHealthFromInput(input);
  const assessment = getInitiativeHealthAssessment(report, initiativeId);
  const healthStatus = assessment?.status ?? "on_track";

  await updateInitiativeHealthStatus(userId, initiativeId, healthStatus);

  return healthStatus;
}

export async function saveInitiative(
  userId: string,
  input: SaveInitiativeInput,
): Promise<InitiativeWithLinks> {
  validateInitiativeInput(input);

  let initiative: StrategicInitiativeRecord;

  if (input.id) {
    const existing = await fetchInitiativeById(userId, input.id);

    if (!existing || existing.archived_at) {
      throw new StrategicInitiativeError(
        "Initiative not found.",
        "NOT_FOUND",
      );
    }

    initiative = await updateInitiativeRecord(userId, input.id, input);
  } else {
    initiative = await insertInitiativeRecord(userId, input);
  }

  const links = await replaceInitiativeLinks(
    userId,
    initiative.id,
    input.links,
  );

  const computedHealth = await persistComputedInitiativeHealth(
    userId,
    initiative.id,
  );

  return {
    initiative: { ...initiative, health_status: computedHealth },
    links,
  };
}

export async function archiveInitiative(
  userId: string,
  initiativeId: string,
): Promise<StrategicInitiativeRecord> {
  const existing = await fetchInitiativeById(userId, initiativeId);

  if (!existing || existing.archived_at) {
    throw new StrategicInitiativeError("Initiative not found.", "NOT_FOUND");
  }

  return archiveInitiativeRecord(userId, initiativeId);
}

export async function getInitiatives(
  userId: string,
  options?: InitiativeQueryOptions,
): Promise<InitiativeWithLinks[]> {
  return fetchInitiativesWithLinks(userId, options);
}

export async function getInitiativeLinkCatalog(
  userId: string,
): Promise<InitiativeLinkCatalog> {
  return fetchInitiativeLinkCatalog(userId);
}

export async function getInitiativesWithComputedHealth(
  userId: string,
): Promise<InitiativeWithLinks[]> {
  const [initiatives, input] = await Promise.all([
    getInitiatives(userId),
    loadHealthEngineInput(userId),
  ]);
  const report = computeExecutiveHealthFromInput(input);

  return initiatives.map((item) => {
    const assessment = getInitiativeHealthAssessment(
      report,
      item.initiative.id,
    );

    if (!assessment) {
      return item;
    }

    return {
      ...item,
      initiative: {
        ...item.initiative,
        health_status: assessment.status,
      },
    };
  });
}

export async function getInitiativesForIntelligence(
  userId: string,
): Promise<InitiativeWithLinks[]> {
  return fetchActiveInitiativesForIntelligence(userId);
}
