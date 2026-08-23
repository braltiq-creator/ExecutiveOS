"use server";

import { requireAuth } from "@/lib/auth/actions";
import {
  archiveDecision,
  getDecisionTimeline,
  getDecisions,
  saveDecision,
} from "@/lib/decisions/service";
import type {
  ExecutiveDecisionRecord,
  SaveDecisionInput,
} from "@/lib/decisions/types";
import { ExecutiveDecisionError } from "@/lib/decisions/types";

export type DecisionActionResult = {
  error: string | null;
  decision: ExecutiveDecisionRecord | null;
};

export async function saveDecisionAction(
  input: SaveDecisionInput,
): Promise<DecisionActionResult> {
  try {
    const user = await requireAuth();
    const decision = await saveDecision(user.id, input);
    return { error: null, decision };
  } catch (error) {
    return {
      error:
        error instanceof ExecutiveDecisionError || error instanceof Error
          ? error.message
          : "Unable to save decision.",
      decision: null,
    };
  }
}

export async function archiveDecisionAction(
  decisionId: string,
): Promise<DecisionActionResult> {
  try {
    const user = await requireAuth();
    const decision = await archiveDecision(user.id, decisionId);
    return { error: null, decision };
  } catch (error) {
    return {
      error:
        error instanceof ExecutiveDecisionError || error instanceof Error
          ? error.message
          : "Unable to archive decision.",
      decision: null,
    };
  }
}

export async function loadDecisionsPageData(): Promise<{
  decisions: ExecutiveDecisionRecord[];
  timeline: ExecutiveDecisionRecord[];
}> {
  const user = await requireAuth();
  const [decisions, timeline] = await Promise.all([
    getDecisions(user.id),
    getDecisionTimeline(user.id),
  ]);

  return { decisions, timeline };
}
