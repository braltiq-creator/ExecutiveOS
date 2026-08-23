import type { IndustryBehaviourOverlay } from "@/intelligence-models/types";

export const FIELD_SERVICES_OVERLAYS: IndustryBehaviourOverlay[] = [
  {
    industry: "field_services",
    roleId: "coo",
    priorityEmphasis: ["Technician utilisation band", "First-time fix", "SLA"],
    thresholdOverrides: ["Utilisation high only via overtime → escalate as fake capacity"],
    observationAdds: {
      monitors: ["Utilisation", "FTF", "SLA compliance", "Job backlog per tech"],
    },
  },
  {
    industry: "field_services",
    roleId: "cfo",
    priorityEmphasis: ["Job/project margin", "Cash after completion"],
    observationAdds: {
      monitors: ["Gross margin by job", "Cash collection lag", "WIP"],
    },
  },
  {
    industry: "field_services",
    roleId: "cro",
    priorityEmphasis: ["Quote quality", "Contract renewals", "Capacity-aware selling"],
    observationAdds: {
      monitors: ["Quote conversion", "SLA credit risk on sold work"],
    },
  },
];
