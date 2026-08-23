"use server";

import {
  trackRecommendation,
  advanceRecommendation,
  recordExecutiveAction,
  createExecutiveOutcome,
  updateExecutiveOutcomeStatus,
  linkActionToOutcome,
  applyConfirmedOutcomesLearning,
  defineBusinessOutcomeType,
} from "@/outcomes";
import type {
  BuiltInBusinessOutcomeKind,
  ExecutiveActionKind,
  ExecutiveOutcomeStatus,
  RecommendationLifecycleStatus,
} from "@/outcomes";
import type { IntelligenceProfileId } from "@/profiles";

export async function trackRecommendationAction(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  title: string;
  businessQuestion: string;
  scenarioId?: string | null;
  evidence?: string[];
}): Promise<{ ok: boolean; id?: string; message: string }> {
  const track = trackRecommendation(input);
  return { ok: true, id: track.id, message: `Tracked ${track.title}` };
}

export async function advanceRecommendationAction(input: {
  id: string;
  status: RecommendationLifecycleStatus;
  note?: string;
}): Promise<{ ok: boolean; message: string }> {
  const track = advanceRecommendation(input);
  if (!track) return { ok: false, message: "Recommendation not found" };
  return { ok: true, message: `Advanced to ${track.status}` };
}

export async function recordActionAction(input: {
  tenantId: string;
  kind: ExecutiveActionKind;
  detail?: string;
  recommendationId?: string | null;
}): Promise<{ ok: boolean; id?: string; message: string }> {
  const action = recordExecutiveAction(input);
  return { ok: true, id: action.id, message: action.label };
}

export async function createOutcomeAction(input: {
  tenantId: string;
  name: string;
  profileId: IntelligenceProfileId;
  businessQuestion: string;
  recommendation: string;
  scenarioId?: string | null;
  recommendationId?: string | null;
  businessOutcomeKind?: BuiltInBusinessOutcomeKind;
  observedOutcome?: string;
  evidence?: string[];
}): Promise<{ ok: boolean; id?: string; message: string }> {
  const outcome = createExecutiveOutcome(input);
  return { ok: true, id: outcome.id, message: `Created ${outcome.name}` };
}

export async function updateOutcomeStatusAction(input: {
  id: string;
  status: ExecutiveOutcomeStatus;
  observedOutcome?: string;
  evidence?: string[];
  tenantId: string;
}): Promise<{ ok: boolean; message: string }> {
  const outcome = updateExecutiveOutcomeStatus(input);
  if (!outcome) return { ok: false, message: "Outcome not found" };
  if (outcome.status === "confirmed") {
    applyConfirmedOutcomesLearning({ tenantId: input.tenantId });
  }
  return { ok: true, message: `Outcome ${outcome.status}` };
}

export async function linkActionOutcomeAction(input: {
  actionId: string;
  outcomeId: string;
}): Promise<{ ok: boolean; message: string }> {
  const action = linkActionToOutcome(input);
  if (!action) return { ok: false, message: "Action not found" };
  return { ok: true, message: "Linked action to outcome" };
}

export async function defineCustomOutcomeTypeAction(input: {
  tenantId: string;
  label: string;
  description: string;
}): Promise<{ ok: boolean; message: string }> {
  const def = defineBusinessOutcomeType(input);
  return { ok: true, message: `Defined outcome type ${def.label}` };
}
