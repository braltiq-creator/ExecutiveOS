/**
 * Domain Advisor catalogues for industries without a production pack yet.
 * Catalogue-first — expandable to full ExecutiveDomainAdvisor without Core changes.
 */

import { catalogue } from "@/domain-advisors/catalogues/helpers";
import type { ExecutiveRelationshipMap } from "@/domain-advisors/types";

const R = (
  ceo: string,
  cfo: string,
  coo: string,
  cro: string,
  cso: string,
): ExecutiveRelationshipMap => ({ ceo, cfo, coo, cro, cso });

function entry(
  id: string,
  name: string,
  mission: string,
  decisions: string[],
  relationships: ExecutiveRelationshipMap,
) {
  return {
    id,
    name,
    mission,
    primaryDecisions: decisions,
    continuousObservations: [`${name} leading operating signals`],
    leadingIndicators: [`${name} early-warning metrics`],
    laggingIndicators: [`${name} outcome metrics`],
    questionsAsked: [
      `What evidence would change the ${name} recommendation?`,
      "What does the Council need to see before deciding?",
    ],
    executiveInteractions: [`${name} pre-Council specialist brief`],
    escalationTriggers: [`${name} material threshold breach`],
    typicalRecommendations: [
      `Constrain plan to ${name} reality`,
      "Disclose trade-offs to Council",
    ],
    relationships,
  };
}

export const CONSTRUCTION_ADVISOR_CATALOGUE = catalogue(
  "construction",
  "pack-construction-executive (future)",
  "Domain Advisors for construction / project delivery executive leadership.",
  [
    entry("con-adv-project-controls", "Project Controls Advisor", "Evidence schedule, cost, and risk truth on major programmes.", ["Re-baseline advice", "Contingency release"], R("Enterprise delivery truth", "Cost and contingency", "Site execution", "Client commitments", "Portfolio strategy")),
    entry("con-adv-commercial", "Commercial Advisor", "Advise on contract commercial risk and variations.", ["Variation posture", "Claim strategy advice"], R("Reputation", "Margin and cash", "Delivery constraints", "Client relationship", "Contract strategy")),
    entry("con-adv-safety", "Safety Advisor", "Bound decisions with critical safety risk.", ["Stop-work advice"], R("Accountability", "Cost of control", "Site control", "Client trust", "Culture")),
    entry("con-adv-supply-chain", "Supply Chain Advisor", "Materials and subcontractor constraint advice.", ["Procurement posture"], R("Continuity", "Working capital", "Programme feasibility", "Client dates", "Supplier strategy")),
    entry("con-adv-workforce", "Workforce Advisor", "Crewing and skills constraints on delivery.", ["Crewing posture"], R("Culture", "Labour cost", "Execution capacity", "Client service", "Capability")),
    entry("con-adv-quality", "Quality Advisor", "Defect and rework risk before handover promises.", ["Containment advice"], R("Reputation", "Rework cost", "Site quality", "Client acceptance", "Brand")),
    entry("con-adv-claims", "Claims & Disputes Advisor", "Dispute risk and evidence readiness.", ["Dispute posture"], R("Enterprise risk", "Cash and provisions", "Evidence from site", "Client posture", "Long-term relationships")),
    entry("con-adv-bim-digital", "Digital Delivery Advisor", "Information model and coordination risk.", ["Digital gate advice"], R("Delivery coherence", "Cost of rework", "Coordination", "Client reporting", "Digital strategy")),
  ],
);

export const HEALTHCARE_ADVISOR_CATALOGUE = catalogue(
  "healthcare",
  "pack-healthcare-executive (future)",
  "Domain Advisors for healthcare executive leadership.",
  [
    entry("hc-adv-clinical-ops", "Clinical Operations Advisor", "Clinical flow and capacity constraints.", ["Capacity posture"], R("Care mission", "Cost of capacity", "Flow execution", "Patient access", "Service strategy")),
    entry("hc-adv-patient-safety", "Patient Safety Advisor", "Safety and harm risk bounds decisions.", ["Safety stop advice"], R("Duty of care", "Liability cost", "Clinical control", "Trust", "Quality strategy")),
    entry("hc-adv-workforce", "Clinical Workforce Advisor", "Roster, skills, and fatigue constraints.", ["Roster posture"], R("Culture", "Labour cost", "Roster execution", "Access", "Capability")),
    entry("hc-adv-access", "Access & Waiting Advisor", "Waiting list and access outcome stakes.", ["Access prioritisation"], R("Public promise", "Cost of backlog", "Theatre / bed ops", "Patient experience", "Service design")),
    entry("hc-adv-quality", "Quality & Outcomes Advisor", "Outcome and quality metric integrity.", ["Quality intervention"], R("Mission", "Penalty / incentive", "Clinical ops", "Reputation", "Quality strategy")),
    entry("hc-adv-revenue-cycle", "Revenue Cycle Advisor", "Funding and billing constraint advice.", ["Revenue integrity posture"], R("Sustainability", "Cash and margin", "Coding ops", "Payer relations", "Portfolio")),
    entry("hc-adv-supply", "Clinical Supply Advisor", "Critical clinical supply risk.", ["Buffer / source advice"], R("Continuity of care", "Inventory capital", "Supply ops", "Service continuity", "Supplier strategy")),
    entry("hc-adv-digital-health", "Digital Health Advisor", "EHR / digital reliability constraints.", ["Go-live / rollback advice"], R("Care continuity", "Programme cost", "Clinical ops burden", "Patient experience", "Digital strategy")),
    entry("hc-adv-regulatory", "Regulatory Advisor", "Accreditation and regulatory risk.", ["Compliance posture"], R("Licence", "Fine risk", "Ops compliance", "Public trust", "Regulatory strategy")),
  ],
);

export const GOVERNMENT_ADVISOR_CATALOGUE = catalogue(
  "government",
  "pack-government-executive (future)",
  "Domain Advisors for government / public-sector executive leadership.",
  [
    entry("gov-adv-policy", "Policy Advisor", "Policy intent vs delivery reality.", ["Policy trade-off framing"], R("Mandate", "Fiscal impact", "Delivery feasibility", "Citizen impact", "Policy strategy")),
    entry("gov-adv-service-delivery", "Service Delivery Advisor", "Frontline service performance stakes.", ["Service recovery advice"], R("Public accountability", "Cost to serve", "Operations", "Citizen experience", "Service strategy")),
    entry("gov-adv-fiscal", "Fiscal Advisor", "Budget and fiscal constraint advice.", ["Spend posture"], R("Mandate affordability", "Fiscal control", "Delivery cost", "Equity of access", "Priority setting")),
    entry("gov-adv-risk", "Enterprise Risk Advisor", "Enterprise and operational risk.", ["Risk acceptance advice"], R("Accountability", "Contingent liability", "Controls", "Public trust", "Risk strategy")),
    entry("gov-adv-digital", "Digital Government Advisor", "Platform and cyber constraints.", ["Release / defer advice"], R("Service continuity", "Programme cost", "Ops burden", "Citizen UX", "Digital strategy")),
    entry("gov-adv-workforce", "Public Workforce Advisor", "Capability and industrial constraints.", ["Workforce posture"], R("Culture", "Labour cost", "Delivery capacity", "Service levels", "Capability")),
    entry("gov-adv-procurement", "Public Procurement Advisor", "Procurement compliance and value.", ["Procurement posture"], R("Integrity", "Value for money", "Delivery timing", "Supplier market", "Procurement strategy")),
    entry("gov-adv-stakeholder", "Stakeholder Advisor", "Political and stakeholder risk.", ["Engagement posture"], R("Mandate risk", "Cost of delay", "Delivery optics", "Citizen narrative", "Stakeholder strategy")),
  ],
);

export const TECHNOLOGY_ADVISOR_CATALOGUE = catalogue(
  "technology",
  "pack-technology-executive (future)",
  "Domain Advisors for technology / software executive leadership.",
  [
    entry("tech-adv-product", "Product Advisor", "Product outcome and roadmap risk.", ["Roadmap trade-offs"], R("Enterprise focus", "Investment return", "Delivery capacity", "Customer value", "Product strategy")),
    entry("tech-adv-engineering", "Engineering Advisor", "Delivery system and reliability constraints.", ["Release posture"], R("Trust", "Cost of quality", "Engineering ops", "Customer SLAs", "Platform strategy")),
    entry("tech-adv-security", "Security Advisor", "Security and trust risk bounds.", ["Ship / hold advice"], R("Trust", "Breach cost", "SecOps", "Customer assurance", "Security strategy")),
    entry("tech-adv-infrastructure", "Infrastructure Advisor", "Reliability and cost of infrastructure.", ["Capacity posture"], R("Continuity", "Cloud cost", "SRE execution", "Uptime promises", "Architecture strategy")),
    entry("tech-adv-data", "Data & AI Advisor", "Data quality and model risk.", ["Model release advice"], R("Decision quality", "Risk cost", "Data ops", "Customer outcomes", "AI strategy")),
    entry("tech-adv-customer-success", "Customer Success Advisor", "Retention and adoption stakes.", ["Intervention posture"], R("Franchise health", "NRR economics", "Support ops", "Primary partner", "Land-and-expand strategy")),
    entry("tech-adv-gtm", "Go-to-Market Advisor", "Pipeline quality and GTM system health.", ["Focus advice"], R("Growth coherence", "CAC / efficiency", "Enablement", "Primary commercial", "GTM strategy")),
    entry("tech-adv-compliance", "Compliance Advisor", "Privacy and regulatory constraints.", ["Compliance posture"], R("Trust", "Fine risk", "Ops compliance", "Enterprise sales", "Compliance strategy")),
  ],
);

export const FINANCIAL_SERVICES_ADVISOR_CATALOGUE = catalogue(
  "financial_services",
  "pack-financial-services-executive (future)",
  "Domain Advisors for financial services executive leadership.",
  [
    entry("fs-adv-credit-risk", "Credit Risk Advisor", "Credit portfolio risk stakes.", ["Risk appetite advice"], R("Franchise risk", "Provisions", "Underwriting ops", "Client franchise", "Risk strategy")),
    entry("fs-adv-market-risk", "Market Risk Advisor", "Market and liquidity risk.", ["Limit posture"], R("Stability", "Capital", "Trading ops", "Client impact", "Risk strategy")),
    entry("fs-adv-ops-resilience", "Operational Resilience Advisor", "Resilience and continuity.", ["Mode posture"], R("Continuity", "Loss cost", "Ops control", "Client service", "Resilience strategy")),
    entry("fs-adv-conduct", "Conduct Advisor", "Conduct and customer outcome risk.", ["Product / sales posture"], R("Licence", "Remediation cost", "Frontline control", "Customer trust", "Conduct strategy")),
    entry("fs-adv-capital", "Capital Advisor", "Capital adequacy constraints.", ["Capital actions advice"], R("Solvency narrative", "Primary partner", "Balance sheet ops", "Growth capacity", "Capital strategy")),
    entry("fs-adv-fraud", "Fraud & Financial Crime Advisor", "Fraud and FC risk.", ["Control posture"], R("Trust", "Loss / fine", "Ops controls", "Client friction", "FC strategy")),
    entry("fs-adv-technology", "Technology Risk Advisor", "Tech and cyber risk in FS context.", ["Change posture"], R("Trust", "Incident cost", "Tech ops", "Client availability", "Tech strategy")),
    entry("fs-adv-regulatory", "Regulatory Advisor", "Prudential and conduct regulation.", ["Compliance posture"], R("Licence", "Capital / fine", "Ops compliance", "Client obligations", "Regulatory strategy")),
  ],
);

export const RETAIL_ADVISOR_CATALOGUE = catalogue(
  "retail",
  "pack-retail-executive (future)",
  "Domain Advisors for retail executive leadership.",
  [
    entry("ret-adv-merchandise", "Merchandise Advisor", "Range and buy decisions.", ["Buy / markdown advice"], R("Offer coherence", "Margin and stock", "Supply ops", "Customer offer", "Category strategy")),
    entry("ret-adv-inventory", "Inventory Advisor", "Stock and availability trade-offs.", ["Rebalance advice"], R("Availability promise", "Working capital", "Fulfilment", "Customer availability", "Network strategy")),
    entry("ret-adv-pricing", "Pricing Advisor", "Price and promotion effectiveness.", ["Promo posture"], R("Value perception", "Margin", "Execution", "Primary commercial", "Price strategy")),
    entry("ret-adv-stores", "Store Operations Advisor", "Store labour and experience constraints.", ["Labour posture"], R("Brand in store", "Labour cost", "Store ops", "Customer experience", "Format strategy")),
    entry("ret-adv-ecommerce", "E-commerce Advisor", "Digital demand and fulfilment.", ["Promise posture"], R("Channel coherence", "Contribution", "Fulfilment ops", "Digital CX", "Channel strategy")),
    entry("ret-adv-supply", "Retail Supply Advisor", "Inbound and vendor constraints.", ["Vendor posture"], R("Availability", "Cost", "Supply ops", "Offer continuity", "Vendor strategy")),
    entry("ret-adv-customer", "Customer Advisor", "Loyalty and customer outcome stakes.", ["Proposition advice"], R("Franchise", "LTV economics", "Service ops", "Primary partner", "Customer strategy")),
    entry("ret-adv-loss", "Loss Prevention Advisor", "Shrink and loss risk.", ["Control posture"], R("Integrity", "Loss cost", "Store control", "Availability", "Risk strategy")),
  ],
);

export const PROFESSIONAL_SERVICES_ADVISOR_CATALOGUE = catalogue(
  "professional_services",
  "pack-professional-services-executive (future)",
  "Domain Advisors for professional services executive leadership.",
  [
    entry("ps-adv-utilisation", "Utilisation Advisor", "Capacity and utilisation truth.", ["Staffing posture"], R("Leverage model", "Margin", "Delivery ops", "Client staffing", "Talent strategy")),
    entry("ps-adv-pipeline", "Pipeline Advisor", "Pipeline quality and win risk.", ["Bid posture"], R("Growth coherence", "Bid cost", "Delivery fit", "Primary commercial", "Growth strategy")),
    entry("ps-adv-delivery", "Delivery Advisor", "Engagement delivery risk.", ["Recovery advice"], R("Reputation", "Write-offs", "Delivery ops", "Client trust", "Delivery model")),
    entry("ps-adv-talent", "Talent Advisor", "Hiring, retention, and skills.", ["Hiring posture"], R("Culture", "People cost", "Bench capacity", "Client capability", "Talent strategy")),
    entry("ps-adv-pricing", "Pricing Advisor", "Pricing and realisation.", ["Discount posture"], R("Value narrative", "Realisation", "Delivery cost", "Deal desk", "Pricing strategy")),
    entry("ps-adv-risk", "Engagement Risk Advisor", "Contract and delivery risk.", ["Accept / decline advice"], R("Franchise risk", "Liability", "Delivery control", "Client selectivity", "Risk strategy")),
    entry("ps-adv-knowledge", "Knowledge Advisor", "Reuse and IP leverage.", ["Investment advice"], R("Differentiation", "Leverage economics", "Delivery efficiency", "Client value", "IP strategy")),
  ],
);

export const FIELD_SERVICES_ADVISOR_CATALOGUE = catalogue(
  "field_services",
  "pack-field-services-executive (future)",
  "Domain Advisors for field services executive leadership.",
  [
    entry("fsvc-adv-scheduling", "Scheduling Advisor", "Job scheduling and promise integrity.", ["Schedule posture"], R("Promise keeping", "Cost to serve", "Dispatch ops", "Customer ETA", "Service design")),
    entry("fsvc-adv-workforce", "Field Workforce Advisor", "Technician capacity and skills.", ["Crewing posture"], R("Service culture", "Labour cost", "Field ops", "Customer wait", "Capability")),
    entry("fsvc-adv-parts", "Parts Advisor", "Van stock and parts availability.", ["Parts posture"], R("First-time fix", "Inventory capital", "Parts ops", "Customer completion", "Network strategy")),
    entry("fsvc-adv-sla", "SLA Advisor", "Contract SLA risk and penalties.", ["Priority advice"], R("Reputation", "Penalty cost", "Dispatch priority", "Account health", "Contract strategy")),
    entry("fsvc-adv-quality", "Service Quality Advisor", "First-time fix and rework.", ["Quality intervention"], R("Trust", "Rework cost", "Field quality", "Customer satisfaction", "Quality strategy")),
    entry("fsvc-adv-safety", "Field Safety Advisor", "Field safety risk bounds.", ["Stop-job advice"], R("Duty of care", "Incident cost", "Field control", "Customer trust", "Safety culture")),
    entry("fsvc-adv-customer", "Customer Advisor", "Account health and escalations.", ["Escalation posture"], R("Franchise", "Retention economics", "Service recovery", "Primary partner", "Account strategy")),
  ],
);

export const LOGISTICS_ADVISOR_CATALOGUE = catalogue(
  "logistics",
  "pack-logistics-executive (future)",
  "Domain Advisors for logistics / supply-network executive leadership.",
  [
    entry("log-adv-network", "Network Advisor", "Network design and flow constraints.", ["Flow posture"], R("Service promise", "Network cost", "Ops execution", "Customer OTIF", "Network strategy")),
    entry("log-adv-capacity", "Capacity Advisor", "Lane and node capacity truth.", ["Capacity posture"], R("Promise integrity", "Cost of surge", "Ops planning", "Customer commitments", "Capacity strategy")),
    entry("log-adv-fleet", "Fleet Advisor", "Fleet availability and cost.", ["Fleet posture"], R("Service continuity", "Fleet capital", "Fleet ops", "Delivery promise", "Asset strategy")),
    entry("log-adv-warehouse", "Warehouse Advisor", "DC productivity and accuracy.", ["Labour / slotting advice"], R("Availability", "Cost to serve", "DC ops", "Order accuracy", "Network design")),
    entry("log-adv-last-mile", "Last Mile Advisor", "Last-mile cost and experience.", ["Promise posture"], R("Customer promise", "Unit economics", "Delivery ops", "Primary CX", "Channel strategy")),
    entry("log-adv-inventory", "Inventory Advisor", "Positioning and turns vs service.", ["Rebalance advice"], R("Availability", "Working capital", "Node ops", "Fill rate", "Inventory strategy")),
    entry("log-adv-customs", "Customs & Trade Advisor", "Cross-border and compliance risk.", ["Routing posture"], R("Continuity", "Duty / fine", "Border ops", "Customer delay", "Trade strategy")),
    entry("log-adv-sustainability", "Sustainability Advisor", "Emissions constraints on network choices.", ["Mode advice"], R("Licence / brand", "Carbon cost", "Ops feasibility", "Customer requirements", "ESG strategy")),
  ],
);
