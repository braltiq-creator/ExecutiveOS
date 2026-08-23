import { describe, expect, it } from "vitest";
import {
  BUSINESS_EVENTS,
  ENTERPRISE_SCORE_DIMENSIONS,
  OPERATING_LOOP_FLOW,
  getEnterpriseModel,
  listBusinessEvents,
  listEnterpriseModels,
  runEnterpriseSimulation,
  runEnterpriseSimulationSuite,
} from "@/simulation/enterprise";
import { EXECUTIVE_SCENARIOS } from "@/simulation";

describe("Enterprise Simulation Environment", () => {
  it("models every simulated organisation with enterprise structure", () => {
    const models = listEnterpriseModels();
    expect(models.length).toBeGreaterThanOrEqual(6);
    const northline = getEnterpriseModel("org-northline");
    expect(northline).toBeTruthy();
    expect(northline!.executives.length).toBe(5);
    expect(northline!.departments.length).toBeGreaterThanOrEqual(4);
    expect(northline!.customers.length).toBeGreaterThan(0);
    expect(northline!.integrations.salesforce.openPipeline).toBeGreaterThan(0);
    expect(northline!.cadence.boardCalendar.length).toBeGreaterThan(0);
    expect(northline!.historicalMemory.length).toBeGreaterThan(0);
  });

  it("catalogues business events across normal, growth, and crisis", () => {
    expect(listBusinessEvents("normal").length).toBeGreaterThan(0);
    expect(listBusinessEvents("growth").length).toBeGreaterThan(0);
    expect(listBusinessEvents("crisis").length).toBeGreaterThan(0);
    expect(BUSINESS_EVENTS.map((event) => event.label)).toEqual(
      expect.arrayContaining([
        "Major customer lost",
        "Large deal won",
        "Operational outage",
        "Safety incident",
        "Cyber event",
        "Executive resignation",
        "Budget overrun",
        "Board request",
        "Forecast miss",
        "Acquisition",
        "Regulatory issue",
        "Rapid growth",
        "Market contraction",
        "Supply chain disruption",
      ]),
    );
  });

  it("extends Reality Lab with growth and crisis scenarios", () => {
    expect(EXECUTIVE_SCENARIOS.map((scenario) => scenario.kind)).toEqual(
      expect.arrayContaining([
        "large_deal_won",
        "safety_incident",
        "forecast_miss",
        "rapid_growth",
        "market_contraction",
        "supply_chain_disruption",
        "budget_overrun",
      ]),
    );
  });

  it("runs a crisis event through the full operating loop and Council", () => {
    const result = runEnterpriseSimulation({
      organisationId: "org-northline",
      eventId: "event-cyber",
    });

    expect(result.mode).toBe("crisis");
    expect(result.lab.capture.judgements.length).toBeGreaterThan(0);
    expect(result.operatingLoop.flow).toEqual(OPERATING_LOOP_FLOW);
    expect(result.operatingLoop.stages).toHaveLength(8);
    expect(result.operatingLoop.pass).toBe(true);
    expect(result.council.members).toHaveLength(5);
    expect(result.council.members.every((member) => member.hasOpinion)).toBe(
      true,
    );
    expect(result.council.pass).toBe(true);
    expect(result.scorecard.dimensions).toHaveLength(
      ENTERPRISE_SCORE_DIMENSIONS.length,
    );
    expect(result.scorecard.overall).toBeGreaterThan(0);
    expect(result.report.summary).toMatch(/Northline|Cyber|crisis/i);
    expect(result.report.findings.length).toBeGreaterThan(0);
  });

  it("validates growth and normal modes without manual intervention", () => {
    const growth = runEnterpriseSimulation({
      organisationId: "org-clearpath",
      eventId: "event-large-deal-won",
    });
    expect(growth.mode).toBe("growth");
    expect(growth.operatingLoop.pass).toBe(true);

    const normal = runEnterpriseSimulation({
      organisationId: "org-northline",
      eventId: "event-board-request",
    });
    expect(normal.mode).toBe("normal");
    expect(normal.operatingLoop.pass).toBe(true);
    expect(normal.council.pass).toBe(true);
  });

  it("produces a multi-mode suite report for Design Partner readiness", () => {
    const suite = runEnterpriseSimulationSuite({
      organisationIds: ["org-northline"],
      modes: ["normal", "growth", "crisis"],
    });

    expect(suite.runs.length).toBeGreaterThanOrEqual(6);
    expect(suite.modes).toEqual(
      expect.arrayContaining(["normal", "growth", "crisis"]),
    );
    expect(suite.averageScore).toBeGreaterThan(0);
    expect(suite.passRate).toBeGreaterThanOrEqual(0);
    expect(suite.reportSummary).toMatch(/Enterprise Simulation Suite/i);
    expect(suite.aggregatedFindings.length).toBeGreaterThan(0);
  });
});
