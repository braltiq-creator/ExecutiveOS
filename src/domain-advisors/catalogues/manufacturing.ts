import { MANUFACTURING_DOMAIN_ADVISORS } from "@/domain-advisors/advisors/manufacturing/advisors";
import type { DomainAdvisorCatalogue } from "@/domain-advisors/types";

/** Manufacturing catalogue — backed by full ExecutiveDomainAdvisor implementations. */
export const MANUFACTURING_ADVISOR_CATALOGUE: DomainAdvisorCatalogue = {
  industry: "manufacturing",
  packAffinity: "pack-manufacturing-executive",
  description:
    "Specialist Domain Advisors activated by the Manufacturing Executive Intelligence Pack. Advise the permanent Executive Council — never join it.",
  advisorIds: MANUFACTURING_DOMAIN_ADVISORS.map((a) => a.identity.id),
  entries: MANUFACTURING_DOMAIN_ADVISORS.map((a) => ({
    id: a.identity.id,
    name: a.identity.name,
    industry: "manufacturing",
    mission: a.mission,
    primaryDecisions: a.primaryDecisions,
    continuousObservations: a.continuousObservations,
    leadingIndicators: a.leadingIndicators,
    laggingIndicators: a.laggingIndicators,
    questionsAsked: a.questionsAsked,
    executiveInteractions: a.executiveInteractions,
    escalationTriggers: a.escalationTriggers,
    typicalRecommendations: a.typicalRecommendations,
    executiveRelationships: a.executiveRelationships,
  })),
};
