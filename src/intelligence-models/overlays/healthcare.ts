import type { IndustryBehaviourOverlay } from "@/intelligence-models/types";

export const HEALTHCARE_OVERLAYS: IndustryBehaviourOverlay[] = [
  {
    industry: "healthcare",
    roleId: "ceo",
    priorityEmphasis: ["Patient outcomes & public trust", "Access", "Clinical governance"],
    thresholdOverrides: ["Sentinel / never-event → immediate CEO ownership"],
    observationAdds: {
      monitors: ["Safety events", "Access/wait times", "Workforce critical gaps"],
    },
  },
  {
    industry: "healthcare",
    roleId: "cfo",
    priorityEmphasis: ["Service-line sustainability", "Payer mix", "Cost per case"],
    observationAdds: {
      monitors: ["Margin by service line", "Length of stay economics", "Labour cost"],
    },
  },
  {
    industry: "healthcare",
    roleId: "coo",
    priorityEmphasis: ["Flow (ED to discharge)", "Bed/theatre capacity", "Clinical workforce rostering"],
    observationAdds: {
      monitors: ["Bed occupancy", "ED wait", "Theatre utilisation", "Staffing fill"],
      escalationTriggers: ["Capacity surge breach", "Critical clinical staffing gap"],
    },
  },
  {
    industry: "healthcare",
    roleId: "cco",
    priorityEmphasis: ["Patient/member experience", "Complaint themes as safety signals"],
    observationAdds: {
      monitors: ["Experience scores", "Complaint acuity", "Access friction"],
    },
  },
  {
    industry: "healthcare",
    roleId: "crisk",
    priorityEmphasis: ["Clinical risk", "Credentialing", "Infection / outbreak"],
    observationAdds: {
      escalationTriggers: ["Clinical harm cluster", "Accreditation threat"],
    },
  },
];
