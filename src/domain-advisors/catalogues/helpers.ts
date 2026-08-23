import { defineCatalogueEntry, relationships } from "@/domain-advisors/define";
import type {
  DomainAdvisorCatalogue,
  DomainAdvisorCatalogueEntry,
  DomainAdvisorIndustryId,
  ExecutiveRelationshipMap,
} from "@/domain-advisors/types";

type EntryInput = Omit<
  DomainAdvisorCatalogueEntry,
  "industry" | "executiveRelationships"
> & {
  relationships: ExecutiveRelationshipMap;
};

export function catalogue(
  industry: DomainAdvisorIndustryId,
  packAffinity: string,
  description: string,
  entries: EntryInput[],
): DomainAdvisorCatalogue {
  const mapped = entries.map((e) =>
    defineCatalogueEntry({
      id: e.id,
      name: e.name,
      industry,
      mission: e.mission,
      primaryDecisions: e.primaryDecisions,
      continuousObservations: e.continuousObservations,
      leadingIndicators: e.leadingIndicators,
      laggingIndicators: e.laggingIndicators,
      questionsAsked: e.questionsAsked,
      executiveInteractions: e.executiveInteractions,
      escalationTriggers: e.escalationTriggers,
      typicalRecommendations: e.typicalRecommendations,
      executiveRelationships: relationships(e.relationships),
    }),
  );

  return {
    industry,
    packAffinity,
    description,
    advisorIds: mapped.map((m) => m.id),
    entries: mapped,
  };
}
