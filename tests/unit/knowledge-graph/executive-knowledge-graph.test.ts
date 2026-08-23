import { describe, expect, it } from "vitest";
import {
  buildNorthlineKnowledgeGraph,
  createMockKnowledgeGraphProvider,
  explainEntity,
  explainRecommendation,
  findPaths,
  formatExplainability,
  outcomesAffectedBy,
  queryEvidence,
  queryMeetings,
  queryNeighborhood,
  queryOwners,
  risksIncreasedBy,
  traverse,
} from "@/knowledge-graph";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

describe("Executive Knowledge Graph", () => {
  const graph = buildNorthlineKnowledgeGraph();

  it("models Northline enterprise relationships", () => {
    expect(graph.entityCount()).toBeGreaterThan(40);
    expect(graph.relationshipCount()).toBeGreaterThan(50);
    expect(graph.getEntity("decision-residency")?.type).toBe("Decision");
    expect(graph.getEntity("customer-helix")?.label).toBe("Helix Industries");
  });

  it("answers neighbourhood questions for Helix Decision", () => {
    const neighborhood = queryNeighborhood(graph, "decision-residency");

    expect(neighborhood.owners.some((h) => h.entity.id === "person-alex")).toBe(
      true,
    );
    expect(
      neighborhood.outcomes.some((h) => h.entity.id === "outcome-enterprise-arr"),
    ).toBe(true);
    expect(neighborhood.risks.length).toBeGreaterThan(0);
    expect(neighborhood.documents.length).toBeGreaterThan(0);
    expect(neighborhood.meetings.length).toBeGreaterThan(0);
    expect(queryEvidence(graph, "decision-residency").length).toBeGreaterThan(0);
    expect(queryMeetings(graph, "decision-residency").length).toBeGreaterThan(0);
  });

  it("traverses impact without inventing edges", () => {
    const outcomes = outcomesAffectedBy(graph, "decision-residency");
    const risks = risksIncreasedBy(graph, "decision-residency");
    const paths = findPaths(
      graph,
      "decision-residency",
      "outcome-enterprise-arr",
      { maxDepth: 3, limit: 3 },
    );

    expect(outcomes.map((o) => o.id)).toContain("outcome-enterprise-arr");
    expect(risks.map((r) => r.id)).toContain("risk-helix-window");
    expect(paths[0]?.summary).toMatch(/Helix EU data residency/i);
    expect(paths[0]?.summary).toMatch(/Enterprise ARR/);
  });

  it("explains recommendations via relationship paths only", () => {
    const explanation = explainRecommendation(graph, "rec-approve-helix");
    expect(explanation.paths.length).toBeGreaterThan(0);
    expect(explanation.narrative).toMatch(/graph paths/i);
    expect(formatExplainability(explanation)).toMatch(/Paths:/);

    const entityExplain = explainEntity(graph, "decision-residency");
    expect(entityExplain.paths.length).toBeGreaterThan(0);
    expect(queryOwners(graph, "decision-residency")[0]?.entity.label).toMatch(
      /Alex/,
    );
  });

  it("supports provider swap contract", () => {
    const provider = createMockKnowledgeGraphProvider(graph);
    expect(provider.id).toBe("mock-northline-graph");
    expect(provider.getSnapshot().entities.length).toBe(graph.entityCount());
    expect(traverse(provider.getGraph(), "customer-helix", { maxDepth: 2 }).length).toBeGreaterThan(
      0,
    );
  });

  it("grounds EIE recommendations in the knowledge graph", () => {
    const intelligent = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
    const helixRec = intelligent.recommendations.find((rec) =>
      rec.relatedDecisionIds.includes("decision-residency"),
    );
    expect(helixRec).toBeTruthy();
    expect(
      helixRec!.reasoningGraph.systems.includes("Executive Knowledge Graph") ||
        helixRec!.evidence.some((item) => item.includes("[")),
    ).toBe(true);
    expect(helixRec!.reasoningGraph.summary.length).toBeGreaterThan(20);
  });
});
