import { createClient } from "@/lib/supabase/server";
import { fetchDecisions } from "@/lib/decisions/queries";
import { fetchMeetingsWithActions } from "@/lib/meetings/queries";
import { fetchActiveMemory } from "@/lib/memory/queries";
import { getStrategicObjectives } from "@/lib/onboarding/queries";
import type {
  InitiativeLinkCatalog,
  InitiativeLinkOption,
  InitiativeLinkRecord,
  InitiativeQueryOptions,
  InitiativeWithLinks,
  StrategicInitiativeRecord,
} from "@/lib/initiatives/types";
import { formatMemoryType } from "@/lib/memory/types";

export async function fetchInitiativeById(
  userId: string,
  initiativeId: string,
): Promise<StrategicInitiativeRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("strategic_initiatives")
    .select("*")
    .eq("user_id", userId)
    .eq("id", initiativeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchInitiatives(
  userId: string,
  options: InitiativeQueryOptions = {},
): Promise<StrategicInitiativeRecord[]> {
  const supabase = await createClient();

  let query = supabase
    .from("strategic_initiatives")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });

  if (!options.includeArchived) {
    query = query.is("archived_at", null);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchInitiativeLinks(
  initiativeId: string,
): Promise<InitiativeLinkRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("initiative_links")
    .select("*")
    .eq("initiative_id", initiativeId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchInitiativesWithLinks(
  userId: string,
  options: InitiativeQueryOptions = {},
): Promise<InitiativeWithLinks[]> {
  const initiatives = await fetchInitiatives(userId, options);

  return Promise.all(
    initiatives.map(async (initiative) => ({
      initiative,
      links: await fetchInitiativeLinks(initiative.id),
    })),
  );
}

export async function fetchActiveInitiativesForIntelligence(
  userId: string,
): Promise<InitiativeWithLinks[]> {
  return fetchInitiativesWithLinks(userId, {
    includeArchived: false,
  });
}

export async function fetchInitiativeLinkCatalog(
  userId: string,
): Promise<InitiativeLinkCatalog> {
  const [objectives, decisions, meetingsWithActions, memories] =
    await Promise.all([
      getStrategicObjectives(userId),
      fetchDecisions(userId),
      fetchMeetingsWithActions(userId),
      fetchActiveMemory(userId),
    ]);

  const objectiveOptions: InitiativeLinkOption[] = objectives.map(
    (objective) => ({
      id: objective.id,
      linkType: "objective",
      label: objective.title,
      subtitle: `Priority: ${objective.priority}`,
    }),
  );

  const decisionOptions: InitiativeLinkOption[] = decisions.map((decision) => ({
    id: decision.id,
    linkType: "decision",
    label: decision.title,
    subtitle: decision.status,
  }));

  const meetingOptions: InitiativeLinkOption[] = meetingsWithActions.map(
    ({ meeting }) => ({
      id: meeting.id,
      linkType: "meeting",
      label: meeting.title,
      subtitle: new Date(meeting.meeting_date).toLocaleDateString(),
    }),
  );

  const memoryOptions: InitiativeLinkOption[] = memories
    .filter(
      (memory) =>
        memory.memory_type !== "risk" && memory.memory_type !== "opportunity",
    )
    .map((memory) => ({
      id: memory.id,
      linkType: "memory",
      label: memory.title,
      subtitle: formatMemoryType(memory.memory_type),
    }));

  const riskOptions: InitiativeLinkOption[] = memories
    .filter((memory) => memory.memory_type === "risk")
    .map((memory) => ({
      id: memory.id,
      linkType: "risk",
      label: memory.title,
      subtitle: "Risk",
    }));

  const opportunityOptions: InitiativeLinkOption[] = memories
    .filter((memory) => memory.memory_type === "opportunity")
    .map((memory) => ({
      id: memory.id,
      linkType: "opportunity",
      label: memory.title,
      subtitle: "Opportunity",
    }));

  const meetingActionOptions: InitiativeLinkOption[] =
    meetingsWithActions.flatMap(({ meeting, actions }) =>
      actions.map((action) => ({
        id: action.id,
        linkType: "meeting_action" as const,
        label: action.title,
        subtitle: meeting.title,
      })),
    );

  return {
    objectives: objectiveOptions,
    decisions: decisionOptions,
    meetings: meetingOptions,
    memories: memoryOptions,
    risks: riskOptions,
    opportunities: opportunityOptions,
    meetingActions: meetingActionOptions,
  };
}
