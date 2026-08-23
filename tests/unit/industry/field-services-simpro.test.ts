import { describe, expect, it } from "vitest";
import {
  SIMPRO_ENTITY_KINDS,
  SIMPRO_EVENT_MAPPINGS,
  FIELD_SERVICE_KPI_LIBRARY,
  MOCK_FIELD_SERVICE_KPIS,
  deriveFieldServicesHealth,
  applyFieldServiceJudgementRules,
  FIELD_SERVICE_BENCHMARKS,
  compareToBenchmark,
  createSimproDomainAdapter,
  createMockSimproDomainEvents,
  FIELD_SERVICES_SCENARIOS,
  ORG_APEX_FIELD_SERVICES,
  buildFieldServicesExecutiveSnapshot,
  HEALTH_DIMENSION_IDS,
} from "@/industry/field-services/simpro";
import { runScenario } from "@/simulation";
import { createMockEnterpriseDataProvider } from "@/intelligence/executive-intelligence";

describe("Field Services / Simpro Industry Pack", () => {
  it("defines the Simpro domain entity catalogue", () => {
    expect(SIMPRO_ENTITY_KINDS).toContain("Job");
    expect(SIMPRO_ENTITY_KINDS).toContain("Technician");
    expect(SIMPRO_ENTITY_KINDS).toContain("ServiceAgreement");
    expect(SIMPRO_ENTITY_KINDS.length).toBeGreaterThanOrEqual(17);
  });

  it("maps Simpro events into BusinessEvents without vendor leakage", () => {
    const adapter = createSimproDomainAdapter();
    const events = adapter.toBusinessEventsMany(createMockSimproDomainEvents());
    expect(events.length).toBeGreaterThan(0);
    for (const event of events) {
      expect(event.sourceSystem).toBe("simpro");
      expect(event.payload.executiveMeaning).toBeTruthy();
      expect(event.metadata.vendorBoundary).toBe("simpro-adapter");
      expect(JSON.stringify(event)).not.toMatch(/simpro\.com/i);
    }
    expect(
      SIMPRO_EVENT_MAPPINGS.some(
        (mapping) => mapping.executiveMeaning === "Revenue Opportunity Increased",
      ),
    ).toBe(true);
    expect(
      SIMPRO_EVENT_MAPPINGS.some(
        (mapping) => mapping.executiveMeaning === "Cash Flow Risk Increased",
      ),
    ).toBe(true);
  });

  it("provides the executive KPI library", () => {
    expect(FIELD_SERVICE_KPI_LIBRARY.length).toBeGreaterThanOrEqual(18);
    expect(
      FIELD_SERVICE_KPI_LIBRARY.some((kpi) => kpi.id === "technician_utilisation"),
    ).toBe(true);
    expect(
      FIELD_SERVICE_KPI_LIBRARY.some((kpi) => kpi.id === "gross_margin"),
    ).toBe(true);
  });

  it("derives health dimensions with reasoning, evidence, confidence, trend", () => {
    const health = deriveFieldServicesHealth({
      asOf: MOCK_FIELD_SERVICE_KPIS.asOf,
      kpis: MOCK_FIELD_SERVICE_KPIS,
    });
    expect(health.dimensions).toHaveLength(HEALTH_DIMENSION_IDS.length);
    for (const dimension of health.dimensions) {
      expect(dimension.reasoning.length).toBeGreaterThan(10);
      expect(dimension.evidence.length).toBeGreaterThan(0);
      expect(dimension.confidence.value).toBeGreaterThan(0);
      expect(["improving", "stable", "declining"]).toContain(dimension.trend);
      expect(["improving", "stable", "declining"]).toContain(
        dimension.predictedDirection,
      );
    }
    expect(health.executiveNarrative).toMatch(
      /utilisation|margin|cash|SLA|risk/i,
    );
  });

  it("fires reusable judgement rules without hardcoding decisions", () => {
    const health = deriveFieldServicesHealth({
      asOf: MOCK_FIELD_SERVICE_KPIS.asOf,
      kpis: MOCK_FIELD_SERVICE_KPIS,
    });
    const hits = applyFieldServiceJudgementRules({
      kpis: MOCK_FIELD_SERVICE_KPIS,
      health,
    });
    expect(hits.length).toBeGreaterThan(0);
    expect(
      hits.some((hit) =>
        /efficiency|delivery|growth|quality|retention|cash|concentration/i.test(
          hit.hypothesis,
        ),
      ),
    ).toBe(true);
    expect(hits.every((hit) => hit.evidence.length > 0)).toBe(true);
  });

  it("includes contractor and trade benchmarks", () => {
    expect(FIELD_SERVICE_BENCHMARKS.length).toBeGreaterThanOrEqual(12);
    const comparison = compareToBenchmark({
      benchmarkId: "bench-medium",
      actual: {
        technician_utilisation: MOCK_FIELD_SERVICE_KPIS.values.technician_utilisation,
        gross_margin: MOCK_FIELD_SERVICE_KPIS.values.gross_margin,
        sla_compliance: MOCK_FIELD_SERVICE_KPIS.values.sla_compliance,
        cash_collection: MOCK_FIELD_SERVICE_KPIS.values.cash_collection,
      },
    });
    expect(comparison?.deltas.length).toBeGreaterThan(0);
    expect(comparison?.summary.length).toBeGreaterThan(10);
  });

  it("extends Reality Lab with 20 field-service scenarios", () => {
    expect(FIELD_SERVICES_SCENARIOS).toHaveLength(20);
    const result = runScenario(
      ORG_APEX_FIELD_SERVICES,
      FIELD_SERVICES_SCENARIOS.find((s) => s.id === "fs-margin-erosion")!,
    );
    expect(result.capture.pulse.label.length).toBeGreaterThan(0);
    expect(result.snapshot.judgementBriefs?.length).toBeGreaterThan(0);
    expect(result.evaluations.length).toBeGreaterThan(0);
    expect(result.benchmarks.trustScore).toBeGreaterThan(0);
    expect(result.industry?.health.dimensions.length).toBe(7);
    expect(result.snapshot.pulse.narrative).toMatch(
      /utilisation|margin|cash|SLA|Technician|Gross|Cash/i,
    );
    expect(result.benchmarkComparison?.benchmarkLabel).toBeTruthy();
  });

  it("builds Today snapshot with industry executive language", () => {
    const ctx = ORG_APEX_FIELD_SERVICES.createContext();
    const snapshot = buildFieldServicesExecutiveSnapshot(
      createMockEnterpriseDataProvider(ctx.portfolio!),
      ctx.graph,
      ctx.intent,
      ctx.memory,
      ctx.twin,
    );
    expect(snapshot.pulse.narrative).toMatch(
      /utilisation|margin|cash|SLA|Technician|Gross|Cash|risk/i,
    );
    expect(snapshot.narrative.executiveBrief.length).toBeGreaterThan(40);
  });
});
