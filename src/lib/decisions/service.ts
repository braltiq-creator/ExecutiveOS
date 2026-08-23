import { fetchMemoryBySource } from "@/lib/memory/queries";
import { saveMemory } from "@/lib/memory/service";
import {
  archiveDecisionRecord,
  insertDecisionRecord,
  updateDecisionRecord,
} from "@/lib/decisions/mutations";
import {
  fetchDecisionById,
  fetchDecisionTimeline,
  fetchDecisions,
} from "@/lib/decisions/queries";
import type {
  DecisionQueryOptions,
  ExecutiveDecisionRecord,
  SaveDecisionInput,
} from "@/lib/decisions/types";
import {
  buildDecisionMemoryContent,
  decisionMemorySource,
  ExecutiveDecisionError,
  riskLevelToMemoryImportance,
} from "@/lib/decisions/types";

function validateDecisionInput(input: SaveDecisionInput): void {
  if (!input.title.trim()) {
    throw new ExecutiveDecisionError("Title is required.", "VALIDATION_ERROR");
  }
  if (!input.summary.trim()) {
    throw new ExecutiveDecisionError("Summary is required.", "VALIDATION_ERROR");
  }
  if (!input.decisionReason.trim()) {
    throw new ExecutiveDecisionError(
      "Decision reason is required.",
      "VALIDATION_ERROR",
    );
  }
  if (!input.expectedOutcome.trim()) {
    throw new ExecutiveDecisionError(
      "Expected outcome is required.",
      "VALIDATION_ERROR",
    );
  }
  if (!input.owner.trim()) {
    throw new ExecutiveDecisionError("Owner is required.", "VALIDATION_ERROR");
  }
  if (!input.decisionDate) {
    throw new ExecutiveDecisionError(
      "Decision date is required.",
      "VALIDATION_ERROR",
    );
  }
}

async function syncDecisionMemory(
  userId: string,
  decision: ExecutiveDecisionRecord,
): Promise<void> {
  const source = decisionMemorySource(decision.id);
  const existingMemory = await fetchMemoryBySource(userId, source);

  await saveMemory(userId, {
    id: existingMemory?.id,
    memoryType: "decision",
    title: decision.title,
    content: buildDecisionMemoryContent(decision),
    importance: riskLevelToMemoryImportance(decision.risk_level),
    source,
  });
}

export async function saveDecision(
  userId: string,
  input: SaveDecisionInput,
): Promise<ExecutiveDecisionRecord> {
  validateDecisionInput(input);

  let decision: ExecutiveDecisionRecord;

  if (input.id) {
    const existing = await fetchDecisionById(userId, input.id);

    if (!existing || existing.archived_at) {
      throw new ExecutiveDecisionError("Decision not found.", "NOT_FOUND");
    }

    decision = await updateDecisionRecord(userId, input.id, input);
  } else {
    decision = await insertDecisionRecord(userId, input);
  }

  await syncDecisionMemory(userId, decision);
  return decision;
}

export async function archiveDecision(
  userId: string,
  decisionId: string,
): Promise<ExecutiveDecisionRecord> {
  const existing = await fetchDecisionById(userId, decisionId);

  if (!existing || existing.archived_at) {
    throw new ExecutiveDecisionError("Decision not found.", "NOT_FOUND");
  }

  const decision = await archiveDecisionRecord(userId, decisionId);
  await syncDecisionMemory(userId, decision);
  return decision;
}

export async function getDecisions(
  userId: string,
  options?: DecisionQueryOptions,
): Promise<ExecutiveDecisionRecord[]> {
  return fetchDecisions(userId, options);
}

export async function getDecisionTimeline(
  userId: string,
): Promise<ExecutiveDecisionRecord[]> {
  return fetchDecisionTimeline(userId);
}

export async function getDecision(
  userId: string,
  decisionId: string,
): Promise<ExecutiveDecisionRecord | null> {
  return fetchDecisionById(userId, decisionId);
}
