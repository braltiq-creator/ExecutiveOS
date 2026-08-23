import type { BusinessEvent } from "@/connectors/types";
import type { EnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/enterprise-data-provider";
import type { EnterpriseSignals } from "@/intelligence/executive-intelligence/types";
import type {
  ExecutiveScenario,
  SimulationContext,
} from "@/simulation/types";
import {
  MOCK_FIELD_SERVICE_KPIS,
  type FieldServiceKpiSnapshot,
} from "@/industry/field-services/simpro/kpis";

export type FieldServiceScenarioMeta = {
  kpiPatch?: Partial<FieldServiceKpiSnapshot["values"]>;
  benchmarkId?: string;
};

/**
 * 20 field-service Reality Lab scenarios.
 */
export const FIELD_SERVICES_SCENARIOS: ExecutiveScenario[] = [
  fsScenario("fs-technician-shortage", "technician_shortage", "Technician shortage", "critical", "Skilled technician shortage across priority trades.", { technician_utilisation: 96, job_backlog: 210 }),
  fsScenario("fs-flood-event", "flood_event", "Flood event", "critical", "Regional flood disrupts sites and travel corridors.", { schedule_efficiency: 48, average_response_time: 14, sla_compliance: 81 }),
  fsScenario("fs-major-outage", "major_outage", "Major outage", "critical", "Customer critical-asset outage with SLA exposure.", { sla_compliance: 78, first_time_fix_rate: 55, job_backlog: 190 }),
  fsScenario("fs-customer-insolvency", "customer_insolvency", "Customer insolvency", "critical", "Major customer enters insolvency with WIP and AR at risk.", { cash_collection: 52, customer_concentration: 46, work_in_progress: 1400000 }),
  fsScenario("fs-labour-strike", "labour_strike", "Labour strike", "critical", "Field labour action reduces available capacity.", { technician_utilisation: 40, job_backlog: 260, schedule_efficiency: 35 }),
  fsScenario("fs-equipment-shortage", "equipment_shortage", "Equipment shortage", "high", "Critical parts/equipment shortage stalls jobs.", { job_backlog: 175, work_in_progress: 1100000, first_time_fix_rate: 60 }),
  fsScenario("fs-large-project-win", "large_project_win", "Large project win", "high", "Large project won without matching labour plan.", { quote_conversion: 58, technician_utilisation: 93, gross_margin: 19 }),
  fsScenario("fs-contract-cancellation", "contract_cancellation", "Contract cancellation", "critical", "Material service agreement cancelled.", { recurring_revenue: 3200000, customer_concentration: 42, cash_collection: 70 }),
  fsScenario("fs-safety-incident", "safety_incident", "Safety incident", "critical", "Serious safety incident stops workstreams.", { schedule_efficiency: 50, technician_utilisation: 70, sla_compliance: 85 }),
  fsScenario("fs-acquisition", "acquisition", "Acquisition", "high", "Inbound acquisition of a smaller contractor.", { revenue_per_technician: 160000, gross_margin: 20, quote_conversion: 36 }),
  fsScenario("fs-rapid-expansion", "rapid_expansion", "Rapid expansion", "high", "Rapid geographic expansion stretches supervision.", { technician_utilisation: 94, travel_time: 78, schedule_efficiency: 58 }),
  fsScenario("fs-compliance-audit", "compliance_audit", "Major compliance audit", "high", "Major compliance audit across licensed trades.", { sla_compliance: 90, preventive_vs_reactive: 0.28, first_time_fix_rate: 66 }),
  fsScenario("fs-margin-erosion", "margin_erosion", "Gross margin erosion", "critical", "Project and job margins compress simultaneously.", { gross_margin: 14, project_profitability: 6, labour_recovery: 72 }),
  fsScenario("fs-sla-recovery", "sla_recovery", "SLA recovery under load", "moderate", "SLA recovers while backlog remains elevated.", { sla_compliance: 96, job_backlog: 160, technician_utilisation: 91 }),
  fsScenario("fs-cash-lag", "cash_lag", "Cash collection lag", "high", "Cash collection weakens after project completions.", { cash_collection: 68, work_in_progress: 1250000 }),
  fsScenario("fs-quality-spiral", "quality_spiral", "Quality spiral", "high", "First-time fix declines with rising reactive work.", { first_time_fix_rate: 58, preventive_vs_reactive: 0.22, travel_time: 70 }),
  fsScenario("fs-overtime-burn", "overtime_burn", "Overtime burn", "high", "Sustained overtime threatens retention.", { technician_utilisation: 97, labour_recovery: 88, schedule_efficiency: 62 }),
  fsScenario("fs-supplier-delay", "supplier_delay", "Supplier delay", "high", "Purchase-order delays cascade into job slippage.", { job_backlog: 170, average_response_time: 11 }),
  fsScenario("fs-variation-leak", "variation_leak", "Variation recovery leak", "moderate", "Approved scope changes not recovered commercially.", { variation_recovery: 38, gross_margin: 18, project_profitability: 9 }),
  fsScenario("fs-preventive-shift", "preventive_shift", "Preventive mix shift", "moderate", "Successful shift toward preventive contracted work.", { preventive_vs_reactive: 0.62, sla_compliance: 97, recurring_revenue: 4800000, gross_margin: 27 }),
];

function fsScenario(
  id: string,
  kind: string,
  name: string,
  severity: ExecutiveScenario["severity"],
  description: string,
  kpiPatch: Partial<FieldServiceKpiSnapshot["values"]>,
): ExecutiveScenario {
  return {
    id,
    kind: kind as ExecutiveScenario["kind"],
    name,
    description,
    severity,
    apply(context: SimulationContext): SimulationContext {
      const kpis: FieldServiceKpiSnapshot = {
        asOf: context.asOf,
        values: {
          ...MOCK_FIELD_SERVICE_KPIS.values,
          ...kpiPatch,
        },
      };

      // Stash KPI snapshot on twin via metric events
      const kpiEvents: BusinessEvent[] = Object.entries(kpis.values).map(
        ([kpiId, value]) => ({
          id: `evt-kpi-${id}-${kpiId}`,
          timestamp: context.asOf,
          sourceSystem: "simpro",
          entityType: "Metric",
          entityId: `kpi-${kpiId}`,
          eventType: "entity_upserted",
          importance: 60,
          confidence: 85,
          relationships: [],
          payload: {
            name: kpiId,
            value,
            fieldServiceKpis: kpis.values,
            scenarioId: id,
          },
          metadata: {
            connectorId: "reality-lab-field-services",
            labels: ["field-services", "kpi", id],
          },
        }),
      );
      context.twin.apply(kpiEvents);

      const base = context.provider.getSignals();
      const provider = overlayFieldServiceSignals(
        base,
        name,
        description,
        severity,
        context.organisationId,
        kpis,
      );

      return {
        ...context,
        provider,
        seedEvents: [...context.seedEvents, ...kpiEvents],
      };
    },
  };
}

function overlayFieldServiceSignals(
  base: EnterpriseSignals,
  scenarioName: string,
  description: string,
  severity: ExecutiveScenario["severity"],
  organisationId: string,
  kpis: FieldServiceKpiSnapshot,
): EnterpriseDataProvider {
  const margin = kpis.values.gross_margin ?? 25;
  const util = kpis.values.technician_utilisation ?? 80;
  const cash = kpis.values.cash_collection ?? 90;
  const sla = kpis.values.sla_compliance ?? 95;

  const outcomes = base.outcomes.map((outcome) => {
    let healthScore = outcome.healthScore;
    if (outcome.id.includes("arr") || outcome.id.includes("revenue") || outcome.name.toLowerCase().includes("revenue") || outcome.id === "outcome-enterprise-arr") {
      healthScore = clamp(40 + margin * 1.5 - (util > 92 ? 10 : 0), 25, 92);
    }
    if (outcome.id.includes("efficiency") || outcome.id === "outcome-efficiency") {
      healthScore = clamp(100 - (kpis.values.job_backlog ?? 100) * 0.2, 25, 90);
    }
    if (outcome.id.includes("retention") || outcome.id.includes("board")) {
      healthScore = clamp(sla - (100 - cash) * 0.2, 30, 95);
    }
    return {
      ...outcome,
      healthScore,
      status:
        healthScore < 48
          ? ("off_track" as const)
          : healthScore < 70
            ? ("at_risk" as const)
            : outcome.status,
      yesterdayMovement: healthScore - outcome.healthScore,
      yesterdayMovementLabel: `${scenarioName} pressure`,
      overnightSignals: [
        {
          id: `fs-overnight-${organisationId}-${outcome.id}`,
          severity:
            severity === "critical"
              ? ("critical" as const)
              : severity === "high"
                ? ("attention" as const)
                : ("info" as const),
          whatChanged: description,
          why: scenarioName,
        },
        ...outcome.overnightSignals,
      ],
      contributingSystems: unique([
        ...outcome.contributingSystems,
        "Simpro",
        "Field Services Pack",
      ]),
    };
  });

  const decisions = [
    {
      id: `decision-fs-${organisationId}`,
      question: `How should leadership respond to: ${scenarioName}?`,
      status: "due_today",
      owner: base.executiveName,
      deadline: base.asOf.slice(0, 10),
      confidence: severity === "critical" ? 60 : 72,
      businessImpact: description,
      expectedOutcomeImpact:
        "Stabilises field-service health across customers, capacity and cash.",
      costOfDelay: "Delay compounds operational and commercial damage.",
      whatChanged: description,
      why: "Field Services Reality Lab scenario.",
      outcomeIds: outcomes.slice(0, 2).map((outcome) => outcome.id),
      stakeholderCount: 5,
      evidenceCount: 4,
      systems: ["Simpro", "Field Services Pack", "Reality Lab"],
    },
    ...base.decisions,
  ];

  const overallScore = Math.round(
    outcomes.reduce((sum, outcome) => sum + outcome.healthScore, 0) /
      Math.max(1, outcomes.length),
  );

  return {
    id: `provider-fs-${organisationId}`,
    label: "Field Services scenario provider",
    getSignals: () => ({
      ...base,
      overallScore,
      outcomes,
      decisions,
    }),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function getFieldServicesScenario(
  id: string,
): ExecutiveScenario | undefined {
  return FIELD_SERVICES_SCENARIOS.find((scenario) => scenario.id === id);
}
