import type { IndustryBehaviourOverlay } from "@/intelligence-models/types";

export const MINING_OVERLAYS: IndustryBehaviourOverlay[] = [
  {
    industry: "mining",
    roleId: "ceo",
    priorityEmphasis: ["Zero harm", "Guidance integrity", "Licence to operate"],
    thresholdOverrides: ["Any fatality / catastrophic safety event → immediate CEO ownership"],
    observationAdds: {
      monitors: ["Safety leading indicators", "Guidance variance", "Community / permit risk"],
    },
  },
  {
    industry: "mining",
    roleId: "cfo",
    priorityEmphasis: ["Unit cash cost", "Capex across cycle", "Commodity scenario P&Ls"],
    thresholdOverrides: ["Stress price decks required on material capital asks"],
    observationAdds: {
      monitors: ["AISC / C1", "Capex vs plan", "FX and commodity exposure"],
    },
  },
  {
    industry: "mining",
    roleId: "coo",
    priorityEmphasis: ["Production vs plan", "Geotech / fleet reliability", "Safety system health"],
    observationAdds: {
      monitors: ["TRIFR/LTIFR", "Plant utilisation", "Grade vs model", "Contractor performance"],
      escalationTriggers: ["Major geotech or plant failure"],
    },
  },
  {
    industry: "mining",
    roleId: "cso",
    priorityEmphasis: ["Jurisdiction portfolio", "Countercyclical capital posture"],
    observationAdds: {
      monitors: ["Jurisdiction risk", "Critical minerals demand signposts"],
    },
  },
  {
    industry: "mining",
    roleId: "crisk",
    priorityEmphasis: ["Catastrophic safety", "Tailings / environmental", "Permit risk"],
    observationAdds: {
      escalationTriggers: ["Material licence-to-operate threat"],
    },
  },
];
