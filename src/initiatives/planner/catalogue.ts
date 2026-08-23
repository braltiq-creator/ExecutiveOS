import type { CouncilAgentId } from "@/agents/types";
import type { BusinessDriverId, TimeHorizonId } from "@/futures/models/types";
import type {
  ExecutionSystemId,
  InitiativePriority,
  InitiativeTemplateId,
} from "@/initiatives/models/types";

export type InitiativeTemplate = {
  id: InitiativeTemplateId;
  title: string;
  executiveOutcome: string;
  businessObjective: string;
  strategicTheme: string;
  defaultSponsor: CouncilAgentId;
  defaultSupporters: CouncilAgentId[];
  drivers: BusinessDriverId[];
  timeHorizon: TimeHorizonId;
  defaultPriority: InitiativePriority;
  preferredExecution: ExecutionSystemId[];
  successMeasureLabels: string[];
  completionCriteria: string[];
  /** Keywords that raise selection score from snapshot evidence */
  evidenceHints: RegExp[];
};

/**
 * Catalogue of genuine strategic priorities — outcomes, not task lists.
 */
export const INITIATIVE_TEMPLATES: InitiativeTemplate[] = [
  {
    id: "improve_cash_flow",
    title: "Improve Cash Flow",
    executiveOutcome: "Protect runway and working capital discipline",
    businessObjective: "Reduce cash conversion cycle and overdue exposure",
    strategicTheme: "Financial resilience",
    defaultSponsor: "cfo",
    defaultSupporters: ["coo", "ceo"],
    drivers: ["cash_flow", "revenue"],
    timeHorizon: "90d",
    defaultPriority: "high",
    preferredExecution: ["sap_ps", "microsoft_planner"],
    successMeasureLabels: [
      "DSO inside policy",
      "Overdue balance trending down",
    ],
    completionCriteria: [
      "Cash indicators inside board tolerance for two review cycles",
      "Executive Decision binds on material cash levers are closed",
    ],
    evidenceHints: [/cash|runway|budget|cost|collect|invoice|dso/i],
  },
  {
    id: "increase_asset_availability",
    title: "Increase Asset Availability",
    executiveOutcome: "Raise uptime on material customer-facing assets",
    businessObjective: "Improve reliability without creating backlog debt",
    strategicTheme: "Operational excellence",
    defaultSponsor: "coo",
    defaultSupporters: ["cfo", "ceo"],
    drivers: ["asset_reliability", "capacity"],
    timeHorizon: "90d",
    defaultPriority: "high",
    preferredExecution: ["oracle_primavera", "sap_ps", "jira"],
    successMeasureLabels: ["MTTR improved", "Critical failure cluster reduced"],
    completionCriteria: [
      "Critical asset availability meets agreed threshold",
      "No SLA-impacting failure cluster in the horizon",
    ],
    evidenceHints: [/asset|uptime|fail|reliab|mttr|outage|maintenance/i],
  },
  {
    id: "reduce_customer_churn",
    title: "Reduce Customer Churn",
    executiveOutcome: "Protect enterprise retention and expansion capacity",
    businessObjective: "Close critical escalations and renew at-risk accounts",
    strategicTheme: "Customer outcomes",
    defaultSponsor: "cro",
    defaultSupporters: ["ceo", "coo"],
    drivers: ["customer_demand", "revenue"],
    timeHorizon: "90d",
    defaultPriority: "critical",
    preferredExecution: ["asana", "jira", "monday"],
    successMeasureLabels: [
      "Critical escalations closed",
      "At-risk renewals secured",
    ],
    completionCriteria: [
      "No material enterprise account in formal escalation",
      "Renewal risk portfolio inside agreed band",
    ],
    evidenceHints: [/churn|customer|escalat|renew|retention|nps|helix/i],
  },
  {
    id: "improve_safety_performance",
    title: "Improve Safety Performance",
    executiveOutcome: "Reduce harm exposure and strengthen safety culture",
    businessObjective: "Close critical findings and prevent repeat incidents",
    strategicTheme: "Risk & safety",
    defaultSponsor: "cfo",
    defaultSupporters: ["coo", "ceo"],
    drivers: ["safety", "regulatory"],
    timeHorizon: "12m",
    defaultPriority: "high",
    preferredExecution: ["microsoft_project", "clickup"],
    successMeasureLabels: ["Incident severity trend", "Open safety findings"],
    completionCriteria: [
      "No open critical safety findings past SLA",
      "Leading indicators inside board tolerance",
    ],
    evidenceHints: [/safety|incident|harm|near.?miss|hse/i],
  },
  {
    id: "expand_new_markets",
    title: "Expand into New Markets",
    executiveOutcome: "Open a credible growth corridor without diluting focus",
    businessObjective: "Validate market entry thesis with controlled investment",
    strategicTheme: "Growth strategy",
    defaultSponsor: "cso",
    defaultSupporters: ["cro", "cfo"],
    drivers: ["market_conditions", "strategic_initiatives", "revenue"],
    timeHorizon: "12m",
    defaultPriority: "medium",
    preferredExecution: ["asana", "monday"],
    successMeasureLabels: ["Pipeline in target market", "Unit economics validated"],
    completionCriteria: [
      "Board-ready market thesis with Decision binds",
      "Investment gated by cash and capacity evidence",
    ],
    evidenceHints: [/market|expand|growth|geograph|segment|acquisition/i],
  },
  {
    id: "strengthen_cyber_resilience",
    title: "Strengthen Cyber Resilience",
    executiveOutcome: "Reduce existential cyber exposure to board tolerance",
    businessObjective: "Close material control gaps and rehearse response",
    strategicTheme: "Technology risk",
    defaultSponsor: "cfo",
    defaultSupporters: ["coo", "cso"],
    drivers: ["technology", "regulatory"],
    timeHorizon: "90d",
    defaultPriority: "high",
    preferredExecution: ["jira", "microsoft_planner"],
    successMeasureLabels: ["Critical control gaps closed", "Response drill completed"],
    completionCriteria: [
      "No open critical cyber findings past agreed SLA",
      "Executive tabletop evidence recorded",
    ],
    evidenceHints: [/cyber|security|breach|resilien|control.?gap|ransomware/i],
  },
  {
    id: "increase_technician_capacity",
    title: "Increase Technician Capacity",
    executiveOutcome: "Match skilled labour to committed demand",
    businessObjective: "Close coverage gaps without unsustainable overtime",
    strategicTheme: "Workforce capability",
    defaultSponsor: "coo",
    defaultSupporters: ["ceo", "cfo"],
    drivers: ["labour_availability", "capacity"],
    timeHorizon: "90d",
    defaultPriority: "high",
    preferredExecution: ["sap_ps", "clickup"],
    successMeasureLabels: ["Coverage vs demand", "Overtime within band"],
    completionCriteria: [
      "Coverage meets committed demand for two cycles",
      "No critical job slip due to labour alone",
    ],
    evidenceHints: [/technician|labour|labor|workforce|staff|capacity|utili/i],
  },
  {
    id: "prepare_board_strategy_review",
    title: "Prepare Board Strategy Review",
    executiveOutcome: "Board receives decision-ready strategic narrative",
    businessObjective: "Align agenda, evidence, and Decision milestones for board",
    strategicTheme: "Governance",
    defaultSponsor: "ceo",
    defaultSupporters: ["cso", "cfo"],
    drivers: ["strategic_initiatives", "regulatory"],
    timeHorizon: "30d",
    defaultPriority: "high",
    preferredExecution: ["microsoft_planner", "asana"],
    successMeasureLabels: ["Board pack completeness", "Open Decision binds closed"],
    completionCriteria: [
      "Board pack approved by CEO and CSO",
      "Material Decision milestones scheduled",
    ],
    evidenceHints: [/board|strategy.?review|governance|pack/i],
  },
  {
    id: "improve_workforce_capability",
    title: "Improve Workforce Capability",
    executiveOutcome: "Build leadership and skills depth for the strategy",
    businessObjective: "Close critical capability gaps without burnout",
    strategicTheme: "People & capability",
    defaultSponsor: "coo",
    defaultSupporters: ["ceo", "cso"],
    drivers: ["labour_availability", "capacity"],
    timeHorizon: "12m",
    defaultPriority: "medium",
    preferredExecution: ["monday", "asana"],
    successMeasureLabels: ["Critical role coverage", "Capability gap closure"],
    completionCriteria: [
      "Named capability gaps have owners and horizons",
      "Attrition in critical roles inside tolerance",
    ],
    evidenceHints: [/people|capability|talent|skill|attrition|leadership/i],
  },
  {
    id: "accelerate_digital_transformation",
    title: "Accelerate Digital Transformation",
    executiveOutcome: "Advance digital bets that move material Outcomes",
    businessObjective: "Sequence transformation without capacity overdraw",
    strategicTheme: "Digital strategy",
    defaultSponsor: "cso",
    defaultSupporters: ["coo", "cfo", "ceo"],
    drivers: ["technology", "strategic_initiatives", "capacity"],
    timeHorizon: "12m",
    defaultPriority: "medium",
    preferredExecution: ["jira", "microsoft_project", "clickup"],
    successMeasureLabels: [
      "Transformation milestones linked to Outcomes",
      "Capacity reserved for judgement work",
    ],
    completionCriteria: [
      "Top transformation bets have Decision binds and Outcome links",
      "No transformation work crowding out critical operating risk",
    ],
    evidenceHints: [/digital|transform|platform|moderni|technology/i],
  },
];

export function getInitiativeTemplate(
  id: InitiativeTemplateId,
): InitiativeTemplate {
  const found = INITIATIVE_TEMPLATES.find((t) => t.id === id);
  if (!found) throw new Error(`Unknown initiative template: ${id}`);
  return found;
}
