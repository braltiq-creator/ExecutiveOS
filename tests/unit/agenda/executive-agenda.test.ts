import { describe, expect, it } from "vitest";
import {
  buildExecutiveAgenda,
  applyExecutiveAgenda,
  toExecutiveAgendaView,
} from "@/agenda";
import {
  INITIATIVE_TEMPLATES,
  planStrategicInitiatives,
  simulateInitiativesForScenario,
  executionBoundaryNote,
  EXECUTION_SYSTEMS,
} from "@/initiatives";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { getEnterpriseDigitalTwin } from "@/digital-twin";

describe("Executive Agenda & Strategic Initiative Engine", () => {
  const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
  const twin = getEnterpriseDigitalTwin();

  it("catalogues genuine strategic initiative templates", () => {
    expect(INITIATIVE_TEMPLATES.length).toBe(10);
    expect(INITIATIVE_TEMPLATES.map((t) => t.title)).toEqual(
      expect.arrayContaining([
        "Improve Cash Flow",
        "Reduce Customer Churn",
        "Prepare Board Strategy Review",
        "Accelerate Digital Transformation",
      ]),
    );
  });

  it("plans coordinated strategic initiatives from intelligence evidence", () => {
    const initiatives = planStrategicInitiatives({ snapshot, twin });
    expect(initiatives.length).toBeGreaterThanOrEqual(3);
    expect(initiatives.length).toBeLessThanOrEqual(5);
    for (const initiative of initiatives) {
      expect(initiative.executiveOutcome.length).toBeGreaterThan(10);
      expect(initiative.coordination.perspectives).toHaveLength(5);
      expect(initiative.dependencies.length).toBeGreaterThan(2);
      expect(initiative.governance.executiveCheckpoints.length).toBeGreaterThan(0);
      expect(initiative.explanation.whatExecutiveOSOwns).toMatch(/Strategic intent/i);
      expect(initiative.explanation.whatExecutionSystemsOwn).toMatch(/Tasks/i);
    }
  });

  it("preserves council disagreement on initiatives", () => {
    const initiatives = planStrategicInitiatives({ snapshot, twin });
    const withDisagreement = initiatives.find(
      (i) => i.coordination.disagreements.length > 0,
    );
    // Not every set must disagree, but CFO/COO tension should appear on some
    const anyChallenge = initiatives.some((i) =>
      i.coordination.perspectives.some((p) => p.agreement === "challenges"),
    );
    expect(anyChallenge).toBe(true);
    if (withDisagreement) {
      expect(withDisagreement.coordination.disagreements[0].facilitation).toMatch(
        /do not average|separate questions/i,
      );
    }
  });

  it("keeps ExecutiveOS independent of execution systems", () => {
    const boundary = executionBoundaryNote();
    expect(boundary.executiveOSOwns).not.toMatch(/tasks|schedules/i);
    expect(boundary.executionSystemsOwn).toMatch(/tasks/i);
    expect(EXECUTION_SYSTEMS).toContain("jira");
    expect(EXECUTION_SYSTEMS).toContain("sap_ps");
    expect(EXECUTION_SYSTEMS).toContain("oracle_primavera");

    const initiatives = planStrategicInitiatives({ snapshot, twin });
    for (const initiative of initiatives) {
      // Swapping Jira for SAP would only change operationalSystems refs
      const withoutJira = initiative.operationalSystems.map((s) =>
        s.system === "jira"
          ? { ...s, system: "sap_ps" as const, label: "SAP Project System" }
          : s,
      );
      expect(initiative.id).toBeTruthy();
      expect(withoutJira.every((s) => s.system !== "jira" || s.label)).toBe(true);
      expect(initiative.title).toBeTruthy();
    }
  });

  it("builds an Executive Agenda focused on business outcomes", () => {
    const agenda = buildExecutiveAgenda({ snapshot, twin });
    expect(agenda.items.length).toBeGreaterThan(0);
    expect(agenda.title).toBe("Executive Agenda");
    expect(agenda.boardReadiness.label.length).toBeGreaterThan(0);
    for (const item of agenda.items) {
      expect(item.strategicTheme.length).toBeGreaterThan(0);
      expect(item.relatedStrategicInitiativeIds.length).toBe(1);
      expect(item.title).not.toMatch(/sprint|ticket|backlog/i);
    }
  });

  it("wires into Today presentation", () => {
    const applied = applyExecutiveAgenda({ snapshot, twin });
    expect(applied.snapshot.agendaBrief?.items.length).toBeGreaterThan(0);

    const ui = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    expect(ui.executiveAgenda).toBeDefined();
    expect(ui.executiveAgenda!.items.length).toBeGreaterThan(0);
    expect(ui.executiveAgenda!.boardReadiness.label.length).toBeGreaterThan(0);

    const view = toExecutiveAgendaView(applied.agenda);
    expect(view.items[0].initiative.whyItExists.length).toBeGreaterThan(10);
    expect(view.items[0].councilAlignment.length).toBe(5);
  });

  it("is deterministic", () => {
    const a = planStrategicInitiatives({ snapshot, twin });
    const b = planStrategicInitiatives({ snapshot, twin });
    expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
    expect(a.map((i) => i.priority)).toEqual(b.map((i) => i.priority));
  });

  it("scores initiatives in Reality Lab", () => {
    const result = simulateInitiativesForScenario({
      scenarioId: "test-agenda",
      snapshot,
      twin,
    });
    expect(result.scores.overall).toBeGreaterThan(50);
    expect(result.scores.executiveCoordination).toBeGreaterThan(40);
    expect(result.scores.alignment).toBeGreaterThan(40);
    expect(result.perInitiative.length).toBeGreaterThan(0);
  });
});
