/**
 * Fully modelled simulated enterprises for internal stress-testing.
 * Presentation / simulation metadata only — reuses existing org identities.
 */

import {
  ORG_APEX_FIELD_SERVICES,
  ORG_ENTERPRISE_SAAS,
  ORG_HEALTHCARE_PROVIDER,
  ORG_INDUSTRIAL_MANUFACTURER,
  ORG_NORTHLINE_MINING,
  ORG_UTILITIES_OPERATOR,
  SIMULATED_ORGANISATIONS,
  getSimulatedOrganisation,
} from "@/simulation/organisations";
import type { SimulatedOrganisation } from "@/simulation/types";
import type { EnterpriseModel } from "@/simulation/enterprise/types";

function person(
  id: string,
  name: string,
  title: string,
  departmentId: string,
  isExecutive: boolean,
) {
  return { id, name, title, departmentId, isExecutive };
}

function buildBaseModel(
  org: SimulatedOrganisation,
  patch: Omit<
    EnterpriseModel,
    "organisationId" | "name" | "industry" | "description"
  >,
): EnterpriseModel {
  return {
    organisationId: org.id,
    name: org.name,
    industry: org.industry,
    description: org.description,
    ...patch,
  };
}

const NORTHLINE: EnterpriseModel = buildBaseModel(ORG_NORTHLINE_MINING, {
  executives: [
    person("exec-ceo", "Alex Rivera", "CEO", "dept-executive", true),
    person("exec-cfo", "Priya Shah", "CFO", "dept-finance", true),
    person("exec-coo", "Marcus Chen", "COO", "dept-operations", true),
    person("exec-cro", "Elena Vogt", "CRO", "dept-commercial", true),
    person("exec-cso", "Tom Hale", "CSO", "dept-strategy", true),
  ],
  employees: [
    person("emp-1", "Sam Okonkwo", "VP Operations", "dept-operations", false),
    person("emp-2", "Nina Brooks", "Head of Safety", "dept-operations", false),
    person("emp-3", "Chris Adey", "Enterprise AE", "dept-commercial", false),
    person("emp-4", "Lara Kim", "FP&A Lead", "dept-finance", false),
    person("emp-5", "Jon Reeves", "Knowledge Lead", "dept-strategy", false),
  ],
  departments: [
    { id: "dept-executive", name: "Executive Office", headcount: 6, owner: "Alex Rivera" },
    { id: "dept-operations", name: "Operations", headcount: 420, owner: "Marcus Chen" },
    { id: "dept-commercial", name: "Commercial", headcount: 85, owner: "Elena Vogt" },
    { id: "dept-finance", name: "Finance", headcount: 48, owner: "Priya Shah" },
    { id: "dept-strategy", name: "Strategy & Risk", headcount: 22, owner: "Tom Hale" },
  ],
  customers: [
    { id: "cust-helix", name: "Helix Industries", arr: 1_800_000, health: "at_risk" },
    { id: "cust-orbit", name: "Orbit Metals", arr: 960_000, health: "stable" },
    { id: "cust-ridge", name: "Ridge Logistics", arr: 540_000, health: "strong" },
  ],
  revenue: {
    arr: 48_000_000,
    currency: "AUD",
    growthPct: 11,
    forecastConfidence: 68,
  },
  projects: [
    {
      id: "proj-residency",
      name: "EU residency exception programme",
      owner: "CSO",
      budget: 1_200_000,
      status: "at_risk",
    },
    {
      id: "proj-reliability",
      name: "Reliability operating rhythm",
      owner: "COO",
      budget: 780_000,
      status: "on_track",
    },
  ],
  budgets: [
    {
      id: "bud-opex",
      name: "Opex FY26",
      approved: 32_000_000,
      spent: 18_400_000,
      owner: "CFO",
    },
    {
      id: "bud-growth",
      name: "Growth investments",
      approved: 4_500_000,
      spent: 2_100_000,
      owner: "CEO",
    },
  ],
  meetings: [
    {
      id: "mtg-elt",
      subject: "Weekly ELT",
      when: "2026-07-21T09:00:00+10:00",
      owner: "CEO",
    },
    {
      id: "mtg-board",
      subject: "Board pack freeze",
      when: "2026-07-28T14:00:00+10:00",
      owner: "CFO",
    },
  ],
  integrations: {
    microsoft365: {
      meetingsThisWeek: 18,
      unreadExecutiveThreads: 7,
      calendarLoadHours: 26,
    },
    salesforce: {
      openPipeline: 12_400_000,
      opportunitiesAtRisk: 3,
      nextCloseDate: "2026-08-04",
    },
    simpro: {
      openJobs: 0,
      overdueJobs: 0,
      technicianUtilisation: 0,
    },
  },
  strategicOutcomes: [
    "Expand enterprise ARR",
    "Board-ready risk posture",
    "Operating efficiency",
  ],
  risks: ["Helix churn", "Cyber exposure", "Capacity constraint"],
  knowledgeTopics: [
    "Helix residency exception",
    "Board disclosure language",
    "Overnight commercial signals",
  ],
  decisionsInFlight: [
    "EU data residency exception",
    "Board disclosure language",
  ],
  historicalMemory: [
    "Prior Helix escalation favoured compensating controls",
    "Board rejected optimistic risk language last quarter",
  ],
  cadence: {
    daily: ["Morning Command Centre", "Council observation scan"],
    weekly: ["Weekly ELT", "Commercial forecast huddle"],
    monthly: ["Operating review", "Risk committee"],
    quarterly: ["Board meeting", "Strategy refresh"],
    boardCalendar: [
      "2026-07-28 Board pack freeze",
      "2026-08-12 Board meeting",
      "2026-11-10 Q2 Board",
    ],
  },
  executiveBehaviours: [
    "CEO resolves cross-functional trade-offs same day",
    "CFO escalates forecast misses before board window",
    "COO challenges capacity claims with delivery evidence",
  ],
});

const CLEARPATH: EnterpriseModel = buildBaseModel(ORG_ENTERPRISE_SAAS, {
  executives: [
    person("cp-ceo", "Riley Ng", "CEO", "dept-executive", true),
    person("cp-cfo", "Aisha Rahman", "CFO", "dept-finance", true),
    person("cp-coo", "Ben Torres", "COO", "dept-operations", true),
    person("cp-cro", "Mia Copeland", "CRO", "dept-commercial", true),
    person("cp-cso", "Owen Blake", "CSO", "dept-strategy", true),
  ],
  employees: [
    person("cp-e1", "Dana Wu", "VP CS", "dept-commercial", false),
    person("cp-e2", "Greg Holt", "VP Engineering", "dept-operations", false),
  ],
  departments: [
    { id: "dept-executive", name: "Executive", headcount: 5, owner: "Riley Ng" },
    { id: "dept-operations", name: "Product & Eng", headcount: 160, owner: "Ben Torres" },
    { id: "dept-commercial", name: "Revenue", headcount: 95, owner: "Mia Copeland" },
    { id: "dept-finance", name: "Finance", headcount: 28, owner: "Aisha Rahman" },
    { id: "dept-strategy", name: "Strategy", headcount: 12, owner: "Owen Blake" },
  ],
  customers: [
    { id: "cust-a", name: "Northwind Bank", arr: 2_200_000, health: "stable" },
    { id: "cust-b", name: "Cascade Health", arr: 1_100_000, health: "at_risk" },
  ],
  revenue: {
    arr: 36_000_000,
    currency: "USD",
    growthPct: 28,
    forecastConfidence: 72,
  },
  projects: [
    {
      id: "proj-expansion",
      name: "APAC expansion",
      owner: "CRO",
      budget: 2_000_000,
      status: "on_track",
    },
  ],
  budgets: [
    {
      id: "bud-saas",
      name: "Operating plan",
      approved: 24_000_000,
      spent: 13_200_000,
      owner: "CFO",
    },
  ],
  meetings: [
    {
      id: "mtg-pipeline",
      subject: "Pipeline review",
      when: "2026-07-22T10:00:00+10:00",
      owner: "CRO",
    },
  ],
  integrations: {
    microsoft365: {
      meetingsThisWeek: 22,
      unreadExecutiveThreads: 11,
      calendarLoadHours: 30,
    },
    salesforce: {
      openPipeline: 18_500_000,
      opportunitiesAtRisk: 5,
      nextCloseDate: "2026-07-30",
    },
    simpro: {
      openJobs: 0,
      overdueJobs: 0,
      technicianUtilisation: 0,
    },
  },
  strategicOutcomes: ["Expand enterprise ARR", "Retention durability"],
  risks: ["Logo concentration", "Expansion burn"],
  knowledgeTopics: ["Expansion diligence", "Churn playbooks"],
  decisionsInFlight: ["Market expansion commit"],
  historicalMemory: ["Prior expansion paused for retention"],
  cadence: {
    daily: ["Command Centre"],
    weekly: ["Pipeline review", "ELT"],
    monthly: ["Board prep"],
    quarterly: ["Board"],
    boardCalendar: ["2026-08-05 Board"],
  },
  executiveBehaviours: [
    "CRO surfaces at-risk logos before forecast lock",
    "CEO protects retention over vanity growth",
  ],
});

const FORGEWORKS: EnterpriseModel = buildBaseModel(
  ORG_INDUSTRIAL_MANUFACTURER,
  {
    executives: [
      person("fw-ceo", "Morgan Ellis", "CEO", "dept-executive", true),
      person("fw-cfo", "Hannah Cole", "CFO", "dept-finance", true),
      person("fw-coo", "Victor Lang", "COO", "dept-operations", true),
      person("fw-cro", "Sofia Park", "CRO", "dept-commercial", true),
      person("fw-cso", "Ivy Dent", "CSO", "dept-strategy", true),
    ],
    employees: [
      person("fw-e1", "Paul Ng", "Plant Manager", "dept-operations", false),
    ],
    departments: [
      { id: "dept-executive", name: "Executive", headcount: 4, owner: "Morgan Ellis" },
      { id: "dept-operations", name: "Manufacturing", headcount: 640, owner: "Victor Lang" },
      { id: "dept-commercial", name: "Sales", headcount: 70, owner: "Sofia Park" },
      { id: "dept-finance", name: "Finance", headcount: 35, owner: "Hannah Cole" },
      { id: "dept-strategy", name: "Strategy", headcount: 10, owner: "Ivy Dent" },
    ],
    customers: [
      { id: "cust-oem", name: "Atlas OEM", arr: 4_100_000, health: "stable" },
    ],
    revenue: {
      arr: 210_000_000,
      currency: "USD",
      growthPct: 4,
      forecastConfidence: 61,
    },
    projects: [
      {
        id: "proj-supply",
        name: "Dual-source critical parts",
        owner: "COO",
        budget: 3_200_000,
        status: "at_risk",
      },
    ],
    budgets: [
      {
        id: "bud-plant",
        name: "Plant opex",
        approved: 88_000_000,
        spent: 51_000_000,
        owner: "COO",
      },
    ],
    meetings: [
      {
        id: "mtg-ops",
        subject: "Operations stand-up",
        when: "2026-07-21T07:30:00+10:00",
        owner: "COO",
      },
    ],
    integrations: {
      microsoft365: {
        meetingsThisWeek: 14,
        unreadExecutiveThreads: 5,
        calendarLoadHours: 20,
      },
      salesforce: {
        openPipeline: 9_200_000,
        opportunitiesAtRisk: 2,
        nextCloseDate: "2026-08-18",
      },
      simpro: {
        openJobs: 0,
        overdueJobs: 0,
        technicianUtilisation: 0,
      },
    },
    strategicOutcomes: ["Operating efficiency", "Margin defence"],
    risks: ["Supplier disruption", "Margin compression"],
    knowledgeTopics: ["Supplier dual-source plan"],
    decisionsInFlight: ["Supply recovery posture"],
    historicalMemory: ["Single-source failure in 2025"],
    cadence: {
      daily: ["Plant pulse"],
      weekly: ["Ops review"],
      monthly: ["Margin committee"],
      quarterly: ["Board"],
      boardCalendar: ["2026-09-02 Board"],
    },
    executiveBehaviours: [
      "COO escalates supplier risk within 24h",
      "CFO pairs recovery cost with margin impact",
    ],
  },
);

const GRIDLINE: EnterpriseModel = buildBaseModel(ORG_UTILITIES_OPERATOR, {
  executives: [
    person("gl-ceo", "Sam Ortiz", "CEO", "dept-executive", true),
    person("gl-cfo", "Ruth Adler", "CFO", "dept-finance", true),
    person("gl-coo", "Ken Miles", "COO", "dept-operations", true),
    person("gl-cro", "Amy Frost", "CRO", "dept-commercial", true),
    person("gl-cso", "Leo Grant", "CSO", "dept-strategy", true),
  ],
  employees: [
    person("gl-e1", "Pat Quinn", "Reliability Lead", "dept-operations", false),
  ],
  departments: [
    { id: "dept-executive", name: "Executive", headcount: 5, owner: "Sam Ortiz" },
    { id: "dept-operations", name: "Network Ops", headcount: 900, owner: "Ken Miles" },
    { id: "dept-commercial", name: "Customer", headcount: 120, owner: "Amy Frost" },
    { id: "dept-finance", name: "Finance", headcount: 55, owner: "Ruth Adler" },
    { id: "dept-strategy", name: "Regulatory", headcount: 40, owner: "Leo Grant" },
  ],
  customers: [
    { id: "cust-region", name: "Regional municipalities", arr: 0, health: "stable" },
  ],
  revenue: {
    arr: 620_000_000,
    currency: "AUD",
    growthPct: 2,
    forecastConfidence: 80,
  },
  projects: [
    {
      id: "proj-capex",
      name: "Network resilience capex",
      owner: "COO",
      budget: 45_000_000,
      status: "on_track",
    },
  ],
  budgets: [
    {
      id: "bud-reg",
      name: "Regulated opex",
      approved: 210_000_000,
      spent: 102_000_000,
      owner: "CFO",
    },
  ],
  meetings: [
    {
      id: "mtg-reg",
      subject: "Regulatory liaison",
      when: "2026-07-23T11:00:00+10:00",
      owner: "CSO",
    },
  ],
  integrations: {
    microsoft365: {
      meetingsThisWeek: 16,
      unreadExecutiveThreads: 4,
      calendarLoadHours: 22,
    },
    salesforce: {
      openPipeline: 1_200_000,
      opportunitiesAtRisk: 0,
      nextCloseDate: "2026-09-01",
    },
    simpro: {
      openJobs: 40,
      overdueJobs: 3,
      technicianUtilisation: 78,
    },
  },
  strategicOutcomes: ["Reliability", "Board-ready risk posture"],
  risks: ["Regulatory investigation", "Outage credits"],
  knowledgeTopics: ["Regulator correspondence"],
  decisionsInFlight: ["Regulatory posture"],
  historicalMemory: ["Prior outage disclosure lesson"],
  cadence: {
    daily: ["Reliability brief"],
    weekly: ["Ops + regulatory"],
    monthly: ["Board risk"],
    quarterly: ["Board"],
    boardCalendar: ["2026-08-20 Board"],
  },
  executiveBehaviours: [
    "CSO owns regulator narrative",
    "CEO refuses optimistic outage language",
  ],
});

const CAREAXIS: EnterpriseModel = buildBaseModel(ORG_HEALTHCARE_PROVIDER, {
  executives: [
    person("ca-ceo", "Jordan Lee", "CEO", "dept-executive", true),
    person("ca-cfo", "Nora Bliss", "CFO", "dept-finance", true),
    person("ca-coo", "Dev Patel", "COO", "dept-operations", true),
    person("ca-cro", "Kim Alvarez", "CRO", "dept-commercial", true),
    person("ca-cso", "Quinn Hart", "CSO", "dept-strategy", true),
  ],
  employees: [
    person("ca-e1", "Dr. May Chen", "Clinical Director", "dept-operations", false),
  ],
  departments: [
    { id: "dept-executive", name: "Executive", headcount: 6, owner: "Jordan Lee" },
    { id: "dept-operations", name: "Clinical Ops", headcount: 1_200, owner: "Dev Patel" },
    { id: "dept-commercial", name: "Payer Relations", headcount: 40, owner: "Kim Alvarez" },
    { id: "dept-finance", name: "Finance", headcount: 60, owner: "Nora Bliss" },
    { id: "dept-strategy", name: "Quality & Risk", headcount: 35, owner: "Quinn Hart" },
  ],
  customers: [
    { id: "cust-payer", name: "State payer consortium", arr: 18_000_000, health: "stable" },
  ],
  revenue: {
    arr: 410_000_000,
    currency: "USD",
    growthPct: 3,
    forecastConfidence: 70,
  },
  projects: [
    {
      id: "proj-capacity",
      name: "Capacity surge plan",
      owner: "COO",
      budget: 6_500_000,
      status: "at_risk",
    },
  ],
  budgets: [
    {
      id: "bud-clinical",
      name: "Clinical opex",
      approved: 260_000_000,
      spent: 140_000_000,
      owner: "COO",
    },
  ],
  meetings: [
    {
      id: "mtg-quality",
      subject: "Quality & safety",
      when: "2026-07-21T08:00:00+10:00",
      owner: "CSO",
    },
  ],
  integrations: {
    microsoft365: {
      meetingsThisWeek: 20,
      unreadExecutiveThreads: 9,
      calendarLoadHours: 28,
    },
    salesforce: {
      openPipeline: 2_400_000,
      opportunitiesAtRisk: 1,
      nextCloseDate: "2026-08-12",
    },
    simpro: {
      openJobs: 0,
      overdueJobs: 0,
      technicianUtilisation: 0,
    },
  },
  strategicOutcomes: ["Clinical capacity", "Safety posture"],
  risks: ["Safety incident", "Capacity overrun"],
  knowledgeTopics: ["Safety protocols", "Payer commitments"],
  decisionsInFlight: ["Safety posture"],
  historicalMemory: ["Near-miss review tightened escalation"],
  cadence: {
    daily: ["Clinical pulse"],
    weekly: ["Quality committee"],
    monthly: ["Board quality"],
    quarterly: ["Board"],
    boardCalendar: ["2026-08-15 Board"],
  },
  executiveBehaviours: [
    "COO escalates safety within the hour",
    "CEO owns public and board posture",
  ],
});

const APEX: EnterpriseModel = buildBaseModel(ORG_APEX_FIELD_SERVICES, {
  executives: [
    person("ap-ceo", "Casey Morgan", "CEO", "dept-executive", true),
    person("ap-cfo", "Jules Ward", "CFO", "dept-finance", true),
    person("ap-coo", "Robin Tate", "COO", "dept-operations", true),
    person("ap-cro", "Sky Benton", "CRO", "dept-commercial", true),
    person("ap-cso", "Reese Quinn", "CSO", "dept-strategy", true),
  ],
  employees: [
    person("ap-e1", "Alex Field", "Dispatch Lead", "dept-operations", false),
  ],
  departments: [
    { id: "dept-executive", name: "Executive", headcount: 4, owner: "Casey Morgan" },
    { id: "dept-operations", name: "Field Ops", headcount: 280, owner: "Robin Tate" },
    { id: "dept-commercial", name: "Accounts", headcount: 35, owner: "Sky Benton" },
    { id: "dept-finance", name: "Finance", headcount: 18, owner: "Jules Ward" },
    { id: "dept-strategy", name: "Strategy", headcount: 8, owner: "Reese Quinn" },
  ],
  customers: [
    { id: "cust-facility", name: "Metro Facilities", arr: 3_400_000, health: "stable" },
  ],
  revenue: {
    arr: 52_000_000,
    currency: "AUD",
    growthPct: 9,
    forecastConfidence: 66,
  },
  projects: [
    {
      id: "proj-util",
      name: "Technician utilisation uplift",
      owner: "COO",
      budget: 900_000,
      status: "on_track",
    },
  ],
  budgets: [
    {
      id: "bud-field",
      name: "Field opex",
      approved: 28_000_000,
      spent: 15_600_000,
      owner: "COO",
    },
  ],
  meetings: [
    {
      id: "mtg-dispatch",
      subject: "Dispatch review",
      when: "2026-07-21T06:45:00+10:00",
      owner: "COO",
    },
  ],
  integrations: {
    microsoft365: {
      meetingsThisWeek: 12,
      unreadExecutiveThreads: 3,
      calendarLoadHours: 16,
    },
    salesforce: {
      openPipeline: 4_800_000,
      opportunitiesAtRisk: 2,
      nextCloseDate: "2026-08-08",
    },
    simpro: {
      openJobs: 186,
      overdueJobs: 14,
      technicianUtilisation: 81,
    },
  },
  strategicOutcomes: ["Job completion reliability", "Utilisation"],
  risks: ["Overdue jobs", "SLA credits"],
  knowledgeTopics: ["Simpro job ageing", "SLA clauses"],
  decisionsInFlight: ["Overdue job recovery"],
  historicalMemory: ["Prior storm surge taught surge rostering"],
  cadence: {
    daily: ["Dispatch pulse"],
    weekly: ["Field ops review"],
    monthly: ["Customer SLA"],
    quarterly: ["Board"],
    boardCalendar: ["2026-08-22 Board"],
  },
  executiveBehaviours: [
    "COO watches Simpro ageing hourly in crisis",
    "CRO pairs SLA risk with account outreach",
  ],
});

const MODEL_BY_ORG: Record<string, EnterpriseModel> = {
  [ORG_NORTHLINE_MINING.id]: NORTHLINE,
  [ORG_ENTERPRISE_SAAS.id]: CLEARPATH,
  [ORG_INDUSTRIAL_MANUFACTURER.id]: FORGEWORKS,
  [ORG_UTILITIES_OPERATOR.id]: GRIDLINE,
  [ORG_HEALTHCARE_PROVIDER.id]: CAREAXIS,
  [ORG_APEX_FIELD_SERVICES.id]: APEX,
};

export function getEnterpriseModel(
  organisationId: string,
): EnterpriseModel | undefined {
  return MODEL_BY_ORG[organisationId];
}

export function listEnterpriseModels(): EnterpriseModel[] {
  return SIMULATED_ORGANISATIONS.map((org) => {
    const model = MODEL_BY_ORG[org.id];
    if (model) return model;
    return buildBaseModel(org, {
      executives: [
        person(
          `${org.id}-ceo`,
          org.executiveName,
          "CEO",
          "dept-executive",
          true,
        ),
      ],
      employees: [],
      departments: [
        {
          id: "dept-executive",
          name: "Executive",
          headcount: 1,
          owner: org.executiveName,
        },
      ],
      customers: [],
      revenue: {
        arr: 10_000_000,
        currency: "USD",
        growthPct: 5,
        forecastConfidence: 60,
      },
      projects: [],
      budgets: [],
      meetings: [],
      integrations: {
        microsoft365: {
          meetingsThisWeek: 8,
          unreadExecutiveThreads: 2,
          calendarLoadHours: 12,
        },
        salesforce: {
          openPipeline: 1_000_000,
          opportunitiesAtRisk: 1,
          nextCloseDate: org.asOf.slice(0, 10),
        },
        simpro: {
          openJobs: 0,
          overdueJobs: 0,
          technicianUtilisation: 0,
        },
      },
      strategicOutcomes: ["Enterprise performance"],
      risks: ["Unmodelled operational risk"],
      knowledgeTopics: ["Operating context"],
      decisionsInFlight: [],
      historicalMemory: [],
      cadence: {
        daily: ["Command Centre"],
        weekly: ["ELT"],
        monthly: ["Operating review"],
        quarterly: ["Board"],
        boardCalendar: [],
      },
      executiveBehaviours: ["Lead through Focus Outcomes"],
    });
  });
}

export function resolveOrganisation(
  organisationId: string,
): SimulatedOrganisation | undefined {
  return getSimulatedOrganisation(organisationId);
}
