import type { FieldServiceKpiSnapshot } from "@/industry/field-services/simpro/kpis";
import type { FieldServicesHealthReport } from "@/industry/field-services/simpro/health";

/**
 * Reusable field-service judgement rules.
 * Never hardcode a Decision — emit structured reasoning hypotheses.
 */

export type JudgementRuleId =
  | "high_util_falling_margin"
  | "backlog_low_availability"
  | "sales_vs_capacity"
  | "recurring_callouts_quality"
  | "high_overtime_retention"
  | "sla_vs_workload"
  | "cash_after_projects"
  | "concentration_risk";

export type JudgementRuleHit = {
  ruleId: JudgementRuleId;
  title: string;
  hypothesis: string;
  executiveImplication: string;
  evidence: string[];
  severity: "critical" | "high" | "moderate";
  suggestedStance:
    | "lean_investigate"
    | "lean_approve"
    | "lean_wait"
    | "lean_delegate"
    | "balanced";
};

export type JudgementRule = {
  id: JudgementRuleId;
  title: string;
  evaluate(input: {
    kpis: FieldServiceKpiSnapshot;
    health: FieldServicesHealthReport;
  }): JudgementRuleHit | null;
};

export const FIELD_SERVICE_JUDGEMENT_RULES: JudgementRule[] = [
  {
    id: "high_util_falling_margin",
    title: "High utilisation with falling margins",
    evaluate({ kpis, health }) {
      const util = kpis.values.technician_utilisation ?? 0;
      const margin = kpis.values.gross_margin ?? 100;
      const revenueHealth = health.dimensions.find((d) => d.id === "revenue");
      if (util >= 88 && margin <= 24) {
        return {
          ruleId: "high_util_falling_margin",
          title: "High utilisation with falling margins",
          hypothesis: "Operational efficiency issue",
          executiveImplication:
            "The business is busy but not earning — price, mix, or recovery is leaking.",
          evidence: [
            `Technician utilisation ${util}%`,
            `Gross margin ${margin}%`,
            revenueHealth?.reasoning ?? "Revenue health under pressure",
          ],
          severity: margin <= 18 ? "critical" : "high",
          suggestedStance: "lean_investigate",
        };
      }
      return null;
    },
  },
  {
    id: "backlog_low_availability",
    title: "High backlog with low technician availability",
    evaluate({ kpis }) {
      const backlog = kpis.values.job_backlog ?? 0;
      const util = kpis.values.technician_utilisation ?? 0;
      if (backlog >= 120 && util >= 90) {
        return {
          ruleId: "backlog_low_availability",
          title: "High backlog + constrained capacity",
          hypothesis: "Delivery risk increasing",
          executiveImplication:
            "Demand is outrunning available skilled labour — customer commitments are at risk.",
          evidence: [
            `Job backlog ${backlog}`,
            `Technician utilisation ${util}%`,
          ],
          severity: "critical",
          suggestedStance: "lean_investigate",
        };
      }
      return null;
    },
  },
  {
    id: "sales_vs_capacity",
    title: "Strong sales with weak labour capacity",
    evaluate({ kpis, health }) {
      const conversion = kpis.values.quote_conversion ?? 0;
      const util = kpis.values.technician_utilisation ?? 0;
      const growth = health.dimensions.find((d) => d.id === "growth");
      if (conversion >= 40 && util >= 90) {
        return {
          ruleId: "sales_vs_capacity",
          title: "Strong sales + weak labour capacity",
          hypothesis: "Growth constrained by operations",
          executiveImplication:
            "Winning work without capacity converts growth into delivery and margin risk.",
          evidence: [
            `Quote conversion ${conversion}%`,
            `Technician utilisation ${util}%`,
            growth?.reasoning ?? "Growth health constrained",
          ],
          severity: "high",
          suggestedStance: "balanced",
        };
      }
      return null;
    },
  },
  {
    id: "recurring_callouts_quality",
    title: "Recurring call-outs signal quality issues",
    evaluate({ kpis }) {
      const ftfr = kpis.values.first_time_fix_rate ?? 100;
      const preventive = kpis.values.preventive_vs_reactive ?? 1;
      if (ftfr <= 70 && preventive <= 0.4) {
        return {
          ruleId: "recurring_callouts_quality",
          title: "Recurring call-outs",
          hypothesis: "Quality issue",
          executiveImplication:
            "Repeat visits are taxing capacity and eroding customer confidence.",
          evidence: [
            `First-time fix ${ftfr}%`,
            `Preventive vs reactive ${preventive}`,
          ],
          severity: "high",
          suggestedStance: "lean_investigate",
        };
      }
      return null;
    },
  },
  {
    id: "high_overtime_retention",
    title: "High overtime creates retention risk",
    evaluate({ kpis, health }) {
      const util = kpis.values.technician_utilisation ?? 0;
      const people = health.dimensions.find((d) => d.id === "people");
      if (util >= 92 || (people && people.score <= 50)) {
        return {
          ruleId: "high_overtime_retention",
          title: "High overtime / people strain",
          hypothesis: "Future retention risk",
          executiveImplication:
            "Sustained overload will become a people and delivery problem, not only a cost line.",
          evidence: [
            `Technician utilisation ${util}%`,
            people?.reasoning ?? "People health under strain",
          ],
          severity: "high",
          suggestedStance: "lean_delegate",
        };
      }
      return null;
    },
  },
  {
    id: "sla_vs_workload",
    title: "SLA held under workload pressure",
    evaluate({ kpis }) {
      const sla = kpis.values.sla_compliance ?? 0;
      const backlog = kpis.values.job_backlog ?? 0;
      if (sla >= 92 && backlog >= 120) {
        return {
          ruleId: "sla_vs_workload",
          title: "SLA resilience under load",
          hypothesis: "Operational discipline holding — capacity still constrained",
          executiveImplication:
            "SLA compliance has improved despite increased workload — protect the system that made that possible.",
          evidence: [`SLA compliance ${sla}%`, `Job backlog ${backlog}`],
          severity: "moderate",
          suggestedStance: "balanced",
        };
      }
      return null;
    },
  },
  {
    id: "cash_after_projects",
    title: "Cash collection weakens after project completion",
    evaluate({ kpis, health }) {
      const cash = kpis.values.cash_collection ?? 100;
      const wip = kpis.values.work_in_progress ?? 0;
      const cashHealth = health.dimensions.find((d) => d.id === "cash");
      if (cash <= 82 && wip >= 500000) {
        return {
          ruleId: "cash_after_projects",
          title: "Cash collection lag",
          hypothesis: "Cash conversion lagging project completion",
          executiveImplication:
            "Cash collection has weakened after project completion — working capital needs executive focus.",
          evidence: [
            `Cash collection ${cash}%`,
            `WIP $${wip}`,
            cashHealth?.reasoning ?? "Cash flow health soft",
          ],
          severity: "high",
          suggestedStance: "lean_investigate",
        };
      }
      return null;
    },
  },
  {
    id: "concentration_risk",
    title: "Customer concentration risk",
    evaluate({ kpis }) {
      const concentration = kpis.values.customer_concentration ?? 0;
      if (concentration >= 35) {
        return {
          ruleId: "concentration_risk",
          title: "Customer concentration",
          hypothesis: "Portfolio concentration risk",
          executiveImplication:
            "Too much revenue depends on too few relationships — growth quality needs attention.",
          evidence: [`Customer concentration ${concentration}%`],
          severity: concentration >= 45 ? "critical" : "moderate",
          suggestedStance: "balanced",
        };
      }
      return null;
    },
  },
];

export function applyFieldServiceJudgementRules(input: {
  kpis: FieldServiceKpiSnapshot;
  health: FieldServicesHealthReport;
}): JudgementRuleHit[] {
  return FIELD_SERVICE_JUDGEMENT_RULES.map((rule) => rule.evaluate(input)).filter(
    (hit): hit is JudgementRuleHit => hit != null,
  );
}
