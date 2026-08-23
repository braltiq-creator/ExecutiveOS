import type { IndustryBehaviourOverlay } from "@/intelligence-models/types";

export const UTILITIES_OVERLAYS: IndustryBehaviourOverlay[] = [
  {
    industry: "utilities",
    roleId: "ceo",
    priorityEmphasis: ["Public trust", "Reliability narrative", "Regulatory relationship"],
    observationAdds: {
      monitors: ["Customer minutes lost", "Major outage risk", "Regulatory determination risk"],
    },
  },
  {
    industry: "utilities",
    roleId: "cfo",
    priorityEmphasis: ["Allowed returns / WACC", "Capex programme delivery", "Affordability politics"],
    observationAdds: {
      monitors: ["Capex % complete", "Opex vs allowance", "Regulatory clawback risk"],
    },
  },
  {
    industry: "utilities",
    roleId: "coo",
    priorityEmphasis: ["SAIDI/SAIFI", "Storm readiness", "OT/IT resilience"],
    thresholdOverrides: ["Major outage → disruption huddle same day"],
    observationAdds: {
      monitors: ["SAIDI/SAIFI", "Restoration time", "Asset health", "OT cyber alerts"],
    },
  },
  {
    industry: "utilities",
    roleId: "cso",
    priorityEmphasis: ["Energy transition pathway", "Grid modernisation bets"],
    observationAdds: {
      monitors: ["Transition milestone health", "DER integration risk"],
    },
  },
  {
    industry: "utilities",
    roleId: "crisk",
    priorityEmphasis: ["Public safety", "Cyber on OT", "Extreme weather tails"],
    observationAdds: {
      escalationTriggers: ["OT cyber material event", "Catastrophic weather readiness gap"],
    },
  },
];
