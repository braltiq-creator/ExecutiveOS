import { describe, expect, it } from "vitest";
import {
  compareBehaviour,
  createSeededExecutiveMemoryStore,
  detectDrift,
  detectImprovement,
  deriveMemoryInsights,
  entityTimeline,
  predictBehaviour,
  recall,
  recommendBasedOnHistory,
  remember,
  summariseHistory,
} from "@/intelligence/executive-memory";
import { getExecutiveIntent } from "@/intelligence/executive-intent";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

describe("Executive Memory Engine", () => {
  const store = createSeededExecutiveMemoryStore();
  const intent = getExecutiveIntent();
  const executiveId = "exec-alex";

  it("recalls seeded Helix recurrence history", () => {
    const helix = recall(store, {
      executiveId,
      tags: ["helix", "recurrence"],
    });
    expect(helix.length).toBeGreaterThanOrEqual(3);
    expect(helix.every((event) => event.source.length > 0)).toBe(true);
  });

  it("remember appends a traceable event", () => {
    const local = createSeededExecutiveMemoryStore();
    const event = remember(local, {
      id: "mem-test-1",
      at: "2026-07-21T09:00:00+10:00",
      kind: "preference_observed",
      entityKind: "preference",
      entityId: "pref-morning-bind",
      label: "Prefers morning binds",
      detail: "Alex consistently binds before 10:00.",
      source: "Decision Engine telemetry",
      executiveId,
      tags: ["preference"],
    });
    expect(local.getEvent(event.id)?.label).toMatch(/morning binds/i);
  });

  it("summarises history without inventing insights", () => {
    const summary = summariseHistory({
      store,
      executiveId,
      from: "2026-06-08T00:00:00+10:00",
      to: "2026-07-20T06:15:00+10:00",
      intent,
    });
    expect(summary.whatKeepsHappening.some((line) => /appeared/i.test(line))).toBe(
      true,
    );
    expect(summary.openCommitments.length).toBeGreaterThan(0);
    expect(summary.recommendationOutcomes.succeeded.length).toBeGreaterThan(0);
    expect(summary.recommendationOutcomes.failed.length).toBeGreaterThan(0);
    expect(summary.evidenceEventIds.length).toBeGreaterThan(0);
  });

  it("detects meeting-load improvement after commitment", () => {
    const improvement = detectImprovement({
      store,
      executiveId,
      asOf: "2026-07-20T06:15:00+10:00",
      baselineFrom: "2026-06-01T00:00:00+10:00",
      baselineTo: "2026-06-18T23:59:00+10:00",
      currentFrom: "2026-06-19T00:00:00+10:00",
      currentTo: "2026-07-20T06:15:00+10:00",
    });
    expect(improvement.improving.map((item) => item.dimension)).toContain(
      "meeting_load",
    );
  });

  it("compares behaviour windows deterministically", () => {
    const a = compareBehaviour({
      store,
      executiveId,
      asOf: "2026-07-20T06:15:00+10:00",
      baselineFrom: "2026-06-01T00:00:00+10:00",
      baselineTo: "2026-06-18T23:59:00+10:00",
      currentFrom: "2026-06-19T00:00:00+10:00",
      currentTo: "2026-07-20T06:15:00+10:00",
    });
    const b = compareBehaviour({
      store,
      executiveId,
      asOf: "2026-07-20T06:15:00+10:00",
      baselineFrom: "2026-06-01T00:00:00+10:00",
      baselineTo: "2026-06-18T23:59:00+10:00",
      currentFrom: "2026-06-19T00:00:00+10:00",
      currentTo: "2026-07-20T06:15:00+10:00",
    });
    expect(a.deltas).toEqual(b.deltas);
    expect(a.summary).toEqual(b.summary);
  });

  it("detects strategic drift against CEO intent", () => {
    const drift = detectDrift({
      store,
      intent,
      executiveId,
      asOf: "2026-07-20T06:15:00+10:00",
      from: "2026-06-08T00:00:00+10:00",
      to: "2026-07-20T06:15:00+10:00",
    });
    expect(drift.strategicDriftScore).toBeGreaterThan(0);
    expect(drift.openCommitments.length).toBeGreaterThan(0);
    expect(drift.repeatingPatterns.length).toBeGreaterThan(0);
    expect(drift.evidenceEventIds.length).toBeGreaterThan(0);
  });

  it("predicts behaviour only from remembered patterns", () => {
    const prediction = predictBehaviour({
      store,
      executiveId,
      intent,
      horizonDays: 14,
    });
    expect(prediction.likelyPatterns.length).toBeGreaterThan(0);
    expect(prediction.evidenceEventIds.length).toBeGreaterThan(0);
    expect(prediction.confidence).toBeGreaterThan(0);
  });

  it("recommends based on historical success and failure", () => {
    const recs = recommendBasedOnHistory({
      store,
      executiveId,
      relatedEntityIds: ["decision-residency", "outcome-enterprise-arr"],
    });
    expect(recs.some((rec) => /successful/i.test(rec.reason))).toBe(true);
    expect(recs.some((rec) => /failed|warns/i.test(rec.reason))).toBe(true);
    expect(recs.every((rec) => rec.basedOnEventIds.length > 0)).toBe(true);
  });

  it("builds entity timelines", () => {
    const timeline = entityTimeline(store, "risk-helix-window");
    expect(timeline.length).toBeGreaterThanOrEqual(3);
    expect(timeline.every((event) => event.entityId === "risk-helix-window")).toBe(
      true,
    );
  });

  it("emits only evidence-backed memory insights", () => {
    const insights = deriveMemoryInsights({
      store,
      executiveId,
      intent,
      from: "2026-06-08T00:00:00+10:00",
      to: "2026-07-20T06:15:00+10:00",
    });
    expect(
      insights.some((insight) =>
        /appeared three times|appeared 3 times|appeared \d+ times/i.test(
          insight.sentence,
        ),
      ),
    ).toBe(true);
    expect(
      insights.some((insight) =>
        /Meeting load has improved since your commitment/i.test(insight.sentence),
      ),
    ).toBe(true);
    expect(
      insights.some((insight) =>
        /previous successful decision/i.test(insight.sentence),
      ),
    ).toBe(true);
    expect(
      insights.every((insight) => insight.evidenceEventIds.length > 0),
    ).toBe(true);
  });

  it("personalises the Intelligent snapshot with Memory", () => {
    const intelligent = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
    const joined = [
      intelligent.narrative.executiveBrief,
      intelligent.narrative.weeklyBrief,
      ...intelligent.narrative.sinceYesterday.map((item) => item.sentence),
    ].join(" ");
    expect(joined).toMatch(/appeared|commitment|successful decision|Meeting load/i);

    const helixRec = intelligent.recommendations.find((rec) =>
      /helix|residency|compensating/i.test(rec.title + rec.reason),
    );
    expect(helixRec?.reasoningGraph.systems).toContain("Executive Memory Engine");
  });
});
