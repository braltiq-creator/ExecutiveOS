import { createClient } from "@/lib/supabase/server";
import type {
  ExecutiveDecisionRecord,
  SaveDecisionInput,
} from "@/lib/decisions/types";

function mapInputToRow(input: SaveDecisionInput, userId: string) {
  return {
    user_id: userId,
    title: input.title.trim(),
    summary: input.summary.trim(),
    decision_reason: input.decisionReason.trim(),
    alternatives_considered: input.alternativesConsidered?.trim() || null,
    expected_outcome: input.expectedOutcome.trim(),
    status: input.status,
    owner: input.owner.trim(),
    decision_date: input.decisionDate,
    review_date: input.reviewDate?.trim() || null,
    strategic_objective_id: input.strategicObjectiveId || null,
    risk_level: input.riskLevel,
    updated_at: new Date().toISOString(),
  };
}

export async function insertDecisionRecord(
  userId: string,
  input: SaveDecisionInput,
): Promise<ExecutiveDecisionRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("executive_decisions")
    .insert({
      ...mapInputToRow(input, userId),
      created_at: timestamp,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateDecisionRecord(
  userId: string,
  decisionId: string,
  input: SaveDecisionInput,
): Promise<ExecutiveDecisionRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executive_decisions")
    .update(mapInputToRow(input, userId))
    .eq("user_id", userId)
    .eq("id", decisionId)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function archiveDecisionRecord(
  userId: string,
  decisionId: string,
): Promise<ExecutiveDecisionRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("executive_decisions")
    .update({
      status: "archived",
      archived_at: timestamp,
      updated_at: timestamp,
    })
    .eq("user_id", userId)
    .eq("id", decisionId)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
