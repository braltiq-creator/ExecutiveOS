import {
  mapExecutiveChallenges,
  mapExecutiveIdentity,
  mapExecutiveSystems,
  mapOnboardingContext,
  mapOrganisationContext,
} from "@/lib/intelligence/profile";
import { mapExecutiveObjectives } from "@/lib/intelligence/objectives";
import { mapDecisionRecordsToContext } from "@/lib/intelligence/decisions-context";
import { mapInitiativeRecordsToContext } from "@/lib/intelligence/initiatives-context";
import type {
  ExecutiveContext,
  ExecutiveContextInput,
  IntelligenceIntegrationsContext,
} from "@/types/intelligence";

export function createEmptyIntegrationsContext(): IntelligenceIntegrationsContext {
  return {
    calendar: { events: [], connected: false },
    email: { threads: [], connected: false },
    crm: { records: [], connected: false },
    meetings: { meetings: [], connected: false },
    tasks: { tasks: [], connected: false },
    documents: { documents: [], connected: false },
    knowledgeGraph: { nodes: [], edges: [], connected: false },
  };
}

export function buildExecutiveContext(
  input: ExecutiveContextInput,
): ExecutiveContext {
  const { userId, email, profile, objectives, memory, decisions, initiatives } =
    input;

  return {
    userId,
    loadedAt: new Date().toISOString(),
    executive: mapExecutiveIdentity(userId, email, profile),
    organisation: mapOrganisationContext(profile),
    objectives: mapExecutiveObjectives(objectives),
    challenges: mapExecutiveChallenges(profile),
    systems: mapExecutiveSystems(profile),
    onboarding: mapOnboardingContext(profile),
    memory,
    decisions: mapDecisionRecordsToContext(decisions),
    initiatives: mapInitiativeRecordsToContext(initiatives),
    organization: null,
    teamMembers: [],
    departments: [],
    integrations: createEmptyIntegrationsContext(),
  };
}
