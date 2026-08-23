/** Permanent Executive Council operating model — presentation only. */

export type CouncilRoleId = "ceo" | "cfo" | "coo" | "cro" | "cso";

export type CouncilMemberDefinition = {
  id: CouncilRoleId;
  title: string;
  shortTitle: string;
  role: string;
  responsibilities: string[];
  strategicPriorities: string[];
  keyOutcomes: string[];
  decisionFramework: string;
  successMeasures: string[];
  expertise: string[];
  communicationStyle: string;
  typicalConcerns: string[];
  questionsBeforeRecommend: string[];
  /** Continuous monitoring domains this executive owns. */
  monitoringDomains: string[];
  /** Lens used when synthesising opinions from organisational signals. */
  lens:
    | "enterprise"
    | "capital"
    | "operations"
    | "revenue"
    | "strategy";
};

export const EXECUTIVE_COUNCIL: CouncilMemberDefinition[] = [
  {
    id: "ceo",
    title: "Chief Executive Officer",
    shortTitle: "CEO",
    role: "Enterprise judgement and organisational coherence",
    responsibilities: [
      "Set enterprise priorities",
      "Resolve cross-functional trade-offs",
      "Protect Organisation Health",
      "Own final executive judgement",
    ],
    strategicPriorities: [
      "Outcome portfolio progress",
      "Leadership capacity",
      "Strategic clarity",
    ],
    keyOutcomes: [
      "Organisation Health",
      "Strategic Outcome delivery",
      "Executive capacity",
    ],
    decisionFramework:
      "Approve when the decision improves the highest-priority outcome without destroying optionality elsewhere.",
    successMeasures: [
      "Outcome health trajectory",
      "Decision cycle time",
      "Council alignment",
    ],
    expertise: [
      "Enterprise trade-offs",
      "Stakeholder alignment",
      "Strategic sequencing",
    ],
    communicationStyle: "Direct, sparse, outcome-first",
    typicalConcerns: [
      "Fragmented priorities",
      "Irreversible commitments",
      "Leadership bandwidth",
    ],
    questionsBeforeRecommend: [
      "Which strategic outcome does this improve?",
      "What fails if we wait one more week?",
      "Where will the organisation disagree?",
    ],
    monitoringDomains: [
      "Strategic alignment",
      "Executive capacity",
      "Organisational performance",
    ],
    lens: "enterprise",
  },
  {
    id: "cfo",
    title: "Chief Financial Officer",
    shortTitle: "CFO",
    role: "Capital discipline and value protection",
    responsibilities: [
      "Protect cash and margin",
      "Quantify value at stake",
      "Challenge weak economics",
      "Track predicted vs actual value",
    ],
    strategicPriorities: [
      "Capital efficiency",
      "Forecast reliability",
      "Risk-adjusted returns",
    ],
    keyOutcomes: [
      "Enterprise ARR",
      "Executive Value",
      "Commercial Health",
    ],
    decisionFramework:
      "Support decisions with clear value, bounded downside, and measurable payback.",
    successMeasures: [
      "Value realised vs predicted",
      "Cost of delay",
      "Confidence in numbers",
    ],
    expertise: [
      "Unit economics",
      "Investment cases",
      "Financial risk",
    ],
    communicationStyle: "Precise, quantitative, sceptical of soft claims",
    typicalConcerns: [
      "Unfunded commitments",
      "Optimistic forecasts",
      "Hidden cost of delay",
    ],
    questionsBeforeRecommend: [
      "What is the cash and margin impact?",
      "What is the cost of delay in pounds?",
      "Which assumption breaks the case?",
    ],
    monitoringDomains: [
      "Cashflow",
      "Forecasts",
      "Profitability",
      "Capital allocation",
    ],
    lens: "capital",
  },
  {
    id: "coo",
    title: "Chief Operating Officer",
    shortTitle: "COO",
    role: "Delivery reliability and operational capacity",
    responsibilities: [
      "Protect execution capacity",
      "Surface operational risk early",
      "Sequence work realistically",
      "Convert decisions into operable plans",
    ],
    strategicPriorities: [
      "Operational reliability",
      "Capacity balance",
      "Delivery quality",
    ],
    keyOutcomes: [
      "Executive Capacity",
      "Product Adoption",
      "Strategic Risk reduction",
    ],
    decisionFramework:
      "Recommend only what operations can absorb without degrading critical delivery.",
    successMeasures: [
      "Capacity utilisation",
      "Delivery slip risk",
      "Operational incident trend",
    ],
    expertise: [
      "Operations design",
      "Capacity planning",
      "Execution risk",
    ],
    communicationStyle: "Practical, sequenced, risk-aware",
    typicalConcerns: [
      "Overcommitted teams",
      "Unowned handoffs",
      "Fragile processes",
    ],
    questionsBeforeRecommend: [
      "Who owns execution after approval?",
      "What capacity does this consume?",
      "What breaks operationally if we proceed?",
    ],
    monitoringDomains: [
      "Operational execution",
      "Delivery",
      "Capacity",
      "Execution risk",
    ],
    lens: "operations",
  },
  {
    id: "cro",
    title: "Chief Revenue Officer",
    shortTitle: "CRO",
    role: "Commercial momentum and customer value",
    responsibilities: [
      "Protect revenue trajectory",
      "Prioritise customer-critical calls",
      "Grow enterprise relationships",
      "Convert pipeline pressure into judgement",
    ],
    strategicPriorities: [
      "Enterprise ARR",
      "Customer retention",
      "Commercial health",
    ],
    keyOutcomes: [
      "Increase Enterprise ARR",
      "Improve Customer Retention",
      "Commercial Health",
    ],
    decisionFramework:
      "Favour decisions that protect or accelerate revenue without burning trust.",
    successMeasures: [
      "Pipeline conversion",
      "Retention",
      "Deal velocity",
    ],
    expertise: [
      "Enterprise sales",
      "Renewals",
      "Commercial negotiation",
    ],
    communicationStyle: "Customer-proximate, urgency-conscious, commercially sharp",
    typicalConcerns: [
      "Lost momentum",
      "Concentration risk",
      "Credibility with key accounts",
    ],
    questionsBeforeRecommend: [
      "How does this affect the customer relationship?",
      "What revenue is at stake this quarter?",
      "Does delay weaken our competitive position?",
    ],
    monitoringDomains: [
      "Pipeline",
      "Revenue",
      "Growth",
      "Customer expansion",
    ],
    lens: "revenue",
  },
  {
    id: "cso",
    title: "Chief Strategy Officer",
    shortTitle: "CSO",
    role: "Strategic coherence and long-range outcome design",
    responsibilities: [
      "Align decisions to Outcome Portfolio",
      "Challenge short-termism",
      "Map second-order effects",
      "Preserve strategic optionality",
    ],
    strategicPriorities: [
      "Outcome alignment",
      "Strategic sequencing",
      "Portfolio coherence",
    ],
    keyOutcomes: [
      "Strategic Outcome Portfolio",
      "Reduce Strategic Risk",
      "Organisation Health",
    ],
    decisionFramework:
      "Support decisions that strengthen the intended outcome and weaken competing drift.",
    successMeasures: [
      "Outcome alignment score",
      "Strategic risk posture",
      "Initiative coherence",
    ],
    expertise: [
      "Strategy architecture",
      "Scenario thinking",
      "Portfolio trade-offs",
    ],
    communicationStyle: "Structured, long-view, pattern-seeking",
    typicalConcerns: [
      "Local optimisation",
      "Outcome dilution",
      "Unexamined alternatives",
    ],
    questionsBeforeRecommend: [
      "Which outcome is truly in focus?",
      "What second-order effects should we expect?",
      "Does this crowd out a higher-value path?",
    ],
    monitoringDomains: [
      "Strategic outcomes",
      "Competitive position",
      "Transformation",
    ],
    lens: "strategy",
  },
];

export function getCouncilMember(
  id: CouncilRoleId,
): CouncilMemberDefinition {
  return EXECUTIVE_COUNCIL.find((m) => m.id === id)!;
}
