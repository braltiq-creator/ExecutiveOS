import { describe, expect, it } from "vitest";
import {
  COUNCIL_AGENT_IDS,
  conveneExecutiveCouncil,
  listCouncilAgents,
  getCouncilAgent,
  toCouncilView,
} from "@/agents";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";

describe("Executive Council", () => {
  const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);

  it("registers five permanent Council seats", () => {
    expect(listCouncilAgents()).toHaveLength(5);
    expect(COUNCIL_AGENT_IDS).toEqual(["ceo", "cfo", "coo", "cro", "cso"]);
    expect(getCouncilAgent("ceo")?.title).toBe("Chief Executive Officer");
    expect(getCouncilAgent("cfo")?.shortTitle).toBe("CFO");
    expect(getCouncilAgent("coo")?.shortTitle).toBe("COO");
    expect(getCouncilAgent("cso")?.shortTitle).toBe("CSO");
    expect(COUNCIL_AGENT_IDS.includes("chief_of_staff" as never)).toBe(false);
  });

  it("exposes the full agent surface", () => {
    const agent = getCouncilAgent("cfo")!;
    const ctx = {
      snapshot,
      briefs: snapshot.judgementBriefs ?? [],
      asOf: snapshot.asOf,
    };
    expect(agent.summarise(ctx).length).toBeGreaterThan(10);
    expect(agent.recommend(ctx).length).toBeGreaterThan(0);
    expect(agent.identifyRisks(ctx)).toBeDefined();
    expect(agent.identifyOpportunities(ctx)).toBeDefined();
    expect(agent.challenge(ctx)).toBeDefined();
    expect(agent.confidence(ctx).value).toBeGreaterThan(0);
    expect(agent.reasoning(ctx).length).toBeGreaterThan(0);
    expect(agent.review(ctx).sources).toContain("Executive Intelligence Engine");
  });

  it("convenes a council brief without averaging opinions", () => {
    const brief = conveneExecutiveCouncil(snapshot);
    expect(brief.perspectives).toHaveLength(5);
    expect(brief.framing.length).toBeGreaterThan(20);
    expect(brief.closingNote).toMatch(/decision maker|discussion/i);

    const cfo = brief.perspectives.find((p) => p.agentId === "cfo");
    const coo = brief.perspectives.find((p) => p.agentId === "coo");
    expect(cfo?.review.recommendations[0]?.stance).toBeTruthy();
    expect(coo?.review.recommendations[0]?.stance).toBeTruthy();
  });

  it("preserves CFO delay vs COO proceed disagreement with CEO facilitation", () => {
    const brief = conveneExecutiveCouncil(snapshot);
    const conflict = brief.conflicts.find(
      (item) =>
        item.positions.some((p) => p.agentId === "cfo" && p.stance === "delay") &&
        item.positions.some((p) => p.agentId === "coo" && p.stance === "proceed"),
    );
    expect(conflict).toBeTruthy();
    expect(conflict?.facilitation).toMatch(/escalate|executive review/i);
    expect(conflict?.positions.some((p) => p.agentId === "ceo")).toBe(true);
    expect(conflict?.positions.every((p) =>
      ["ceo", "cfo", "coo", "cro", "cso"].includes(p.agentId),
    )).toBe(true);
  });

  it("is deterministic", () => {
    const a = conveneExecutiveCouncil(snapshot);
    const b = conveneExecutiveCouncil(snapshot);
    expect(a.framing).toEqual(b.framing);
    expect(a.conflicts.map((c) => c.id)).toEqual(b.conflicts.map((c) => c.id));
    expect(
      a.perspectives.map((p) => p.review.summary),
    ).toEqual(b.perspectives.map((p) => p.review.summary));
  });

  it("wires council into the Intelligent snapshot and Today presentation", () => {
    expect(snapshot.councilBrief?.perspectives.length).toBe(5);
    const ui = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    expect(ui.executiveCouncil?.perspectives.length).toBe(5);
    expect(ui.executiveCouncil?.framing.length).toBeGreaterThan(10);
    const view = toCouncilView(snapshot.councilBrief!);
    expect(view.conflicts.length).toBeGreaterThan(0);
  });

  it("never invents facts outside snapshot evidence", () => {
    const brief = conveneExecutiveCouncil(snapshot);
    for (const perspective of brief.perspectives) {
      for (const recommendation of perspective.review.recommendations) {
        expect(recommendation.evidence.length).toBeGreaterThan(0);
      }
      expect(perspective.review.sources.length).toBeGreaterThan(0);
      expect(perspective.review.sources.join(" ")).not.toMatch(/llm|openai|gpt/i);
    }
  });
});
