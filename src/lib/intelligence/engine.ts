import { getAuthenticatedUser } from "@/lib/auth/actions";
import { buildExecutiveContext } from "@/lib/intelligence/context";
import { loadExecutiveMemory } from "@/lib/intelligence/memory";
import { loadExecutiveDecisionRecords } from "@/lib/intelligence/decisions";
import { loadExecutiveInitiativeRecords } from "@/lib/initiatives/intelligence";
import { loadStrategicObjectiveRecords } from "@/lib/intelligence/objectives";
import { loadExecutiveProfileRecord } from "@/lib/intelligence/profile";
import { computeExecutiveHealthFromInput } from "@/lib/health/service";
import { fetchMeetingsWithActions } from "@/lib/meetings/queries";
import { fetchActiveMemory } from "@/lib/memory/queries";
import {
  enrichInitiativesWithHealth,
  enrichObjectivesWithHealth,
  mapExecutiveHealthContext,
} from "@/lib/intelligence/health-context";
import { loadOrganizationIntelligenceContext } from "@/lib/intelligence/organization";
import { loadIntegrationsIntelligenceContext } from "@/lib/integrations/intelligence";
import { loadKnowledgeGraphContext } from "@/lib/knowledge/service";
import { loadExecutiveDayIntelligence } from "@/lib/intelligence/providers";
import { buildExecutiveIntelligencePrompt } from "@/lib/intelligence/prompt";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";
import { ExecutiveIntelligenceError } from "@/types/intelligence";

export async function buildExecutiveIntelligence(): Promise<ExecutiveIntelligenceResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new ExecutiveIntelligenceError(
      "Authentication is required to build executive intelligence.",
      "UNAUTHENTICATED",
    );
  }

  return buildExecutiveIntelligenceForUser(user.id, user.email ?? null);
}

export async function buildExecutiveIntelligenceForUser(
  userId: string,
  email: string | null,
): Promise<ExecutiveIntelligenceResult> {
  const [profile, objectives, memory, decisions, initiatives, memories, meetings, orgContext, integrationsContext, executiveDay, knowledgeGraph] =
    await Promise.all([
    loadExecutiveProfileRecord(userId),
    loadStrategicObjectiveRecords(userId),
    loadExecutiveMemory(userId),
    loadExecutiveDecisionRecords(userId),
    loadExecutiveInitiativeRecords(userId),
    fetchActiveMemory(userId),
    fetchMeetingsWithActions(userId),
    loadOrganizationIntelligenceContext(userId),
    loadIntegrationsIntelligenceContext(userId),
    loadExecutiveDayIntelligence(userId),
    loadKnowledgeGraphContext(userId),
  ]);

  if (!profile) {
    throw new ExecutiveIntelligenceError(
      "Executive profile not found. Complete onboarding before using intelligence features.",
      "PROFILE_NOT_FOUND",
    );
  }

  const context = buildExecutiveContext({
    userId,
    email,
    profile,
    objectives,
    memory,
    decisions,
    initiatives,
  });

  const healthReport = computeExecutiveHealthFromInput({
    objectives,
    initiatives,
    decisions,
    memories,
    meetings,
    calendar: executiveDay.calendar.health,
  });

  const enrichedObjectives = enrichObjectivesWithHealth(
    context.objectives,
    healthReport,
  );
  const enrichedInitiatives = enrichInitiativesWithHealth(
    context.initiatives.initiatives,
    healthReport,
  );
  const health = mapExecutiveHealthContext(healthReport);

  const enrichedContext = {
    ...context,
    objectives: enrichedObjectives,
    initiatives: enrichedInitiatives,
    health,
    organization: orgContext.organization,
    teamMembers: orgContext.teamMembers,
    departments: orgContext.departments,
    integrations: {
      ...integrationsContext,
      knowledgeGraph,
    },
    calendar: executiveDay.calendar,
  };

  const executivePrompt = buildExecutiveIntelligencePrompt(enrichedContext);

  return {
    executive: context.executive,
    organisation: context.organisation,
    objectives: enrichedObjectives,
    challenges: context.challenges,
    systems: context.systems,
    memory: context.memory,
    decisions: context.decisions,
    initiatives: enrichedInitiatives,
    health,
    organization: orgContext.organization,
    teamMembers: orgContext.teamMembers,
    departments: orgContext.departments,
    integrations: enrichedContext.integrations,
    executivePrompt,
    executiveDay,
    calendar: executiveDay.calendar,
  };
}

export async function tryBuildExecutiveIntelligence(): Promise<ExecutiveIntelligenceResult | null> {
  try {
    return await buildExecutiveIntelligence();
  } catch (error) {
    if (
      error instanceof ExecutiveIntelligenceError &&
      (error.code === "UNAUTHENTICATED" || error.code === "PROFILE_NOT_FOUND")
    ) {
      return null;
    }

    throw error;
  }
}
