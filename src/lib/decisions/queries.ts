import { createClient } from "@/lib/supabase/server";
import type {
  DecisionQueryOptions,
  DecisionStatus,
  ExecutiveDecisionRecord,
} from "@/lib/decisions/types";

export async function fetchDecisionById(
  userId: string,
  decisionId: string,
): Promise<ExecutiveDecisionRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executive_decisions")
    .select("*")
    .eq("user_id", userId)
    .eq("id", decisionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchDecisions(
  userId: string,
  options: DecisionQueryOptions = {},
): Promise<ExecutiveDecisionRecord[]> {
  const supabase = await createClient();

  let query = supabase
    .from("executive_decisions")
    .select("*")
    .eq("user_id", userId)
    .order("decision_date", { ascending: false });

  if (!options.includeArchived) {
    query = query.is("archived_at", null);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  if (options.limit !== undefined) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchDecisionTimeline(
  userId: string,
): Promise<ExecutiveDecisionRecord[]> {
  return fetchDecisions(userId, { includeArchived: false });
}

export async function fetchActiveDecisionsForIntelligence(
  userId: string,
  limit = 20,
): Promise<ExecutiveDecisionRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executive_decisions")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .neq("status", "archived")
    .order("decision_date", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchDecisionsByStatus(
  userId: string,
  status: DecisionStatus,
): Promise<ExecutiveDecisionRecord[]> {
  return fetchDecisions(userId, { status, includeArchived: false });
}
