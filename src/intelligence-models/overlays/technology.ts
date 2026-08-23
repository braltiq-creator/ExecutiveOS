import type { IndustryBehaviourOverlay } from "@/intelligence-models/types";

export const TECHNOLOGY_OVERLAYS: IndustryBehaviourOverlay[] = [
  {
    industry: "technology",
    roleId: "cfo",
    priorityEmphasis: ["Unit economics", "Burn multiple / efficiency", "NRR quality"],
    observationAdds: {
      monitors: ["CAC payback", "Gross margin", "Burn multiple", "NRR"],
    },
  },
  {
    industry: "technology",
    roleId: "cro",
    priorityEmphasis: ["Pipeline quality", "NRR", "Commitment vs reliability"],
    observationAdds: {
      monitors: ["Pipeline coverage & age", "Logo churn risk", "Discount leakage"],
    },
  },
  {
    industry: "technology",
    roleId: "cto",
    priorityEmphasis: ["Reliability SLOs", "Advantage bets", "Engineering flow"],
    observationAdds: {
      monitors: ["Uptime", "Change fail rate", "Deployment frequency"],
      escalationTriggers: ["Sev-1 reliability breach"],
    },
  },
  {
    industry: "technology",
    roleId: "cco",
    priorityEmphasis: ["Time-to-value", "Adoption", "Health scores"],
    observationAdds: {
      monitors: ["Product usage", "Health risk book", "Expansion readiness"],
    },
  },
];
