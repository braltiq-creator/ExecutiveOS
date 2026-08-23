import type { ImplementationStageDefinition } from "@/commercial/framework/types";

export const IMPLEMENTATION_STAGES: ImplementationStageDefinition[] = [
  {
    id: "discovery",
    label: "Discovery",
    order: 1,
    objective: "Confirm fit, edition, sponsors, and success definition",
    exitCriteria: [
      "Edition selected",
      "Executive sponsor named",
      "Success outcomes agreed",
    ],
  },
  {
    id: "provisioning",
    label: "Provisioning",
    order: 2,
    objective: "Stand up isolated tenant and licensing shell",
    exitCriteria: [
      "Tenant provisioned",
      "License issued",
      "Admin access confirmed",
    ],
  },
  {
    id: "provider_connection",
    label: "Provider Connection",
    order: 3,
    objective: "Connect required providers for the edition",
    exitCriteria: [
      "Required providers connected",
      "Sync health green or amber with plan",
    ],
  },
  {
    id: "executive_discovery",
    label: "Executive Discovery",
    order: 4,
    objective: "Capture organisation context and strategic outcomes",
    exitCriteria: [
      "Discovery minimum complete",
      "Three strategic outcomes defined",
    ],
  },
  {
    id: "validation",
    label: "Validation",
    order: 5,
    objective: "Validate recommendation quality and coverage",
    exitCriteria: [
      "Validation suite above threshold",
      "Outstanding blockers documented",
    ],
  },
  {
    id: "executive_brief",
    label: "Executive Brief",
    order: 6,
    objective: "Deliver first calm, trusted Executive Brief",
    exitCriteria: [
      "First brief opened by sponsor",
      "Sponsor confirms clarity of what matters today",
    ],
  },
  {
    id: "scenario_validation",
    label: "Scenario Validation",
    order: 7,
    objective: "Prove scenario packs answer real executive questions",
    exitCriteria: [
      "At least two scenarios exercised",
      "Acceptance or feedback recorded",
    ],
  },
  {
    id: "success_review",
    label: "Success Review",
    order: 8,
    objective: "Confirm value and readiness for commercial transition",
    exitCriteria: [
      "Success plan health green or amber",
      "ROI draft reviewed with sponsor",
    ],
  },
  {
    id: "go_live",
    label: "Go Live",
    order: 9,
    objective: "Transition to production licensing and operating rhythm",
    exitCriteria: [
      "Production or enterprise license active",
      "Renewal date set",
      "CS cadence booked",
    ],
  },
];

export function getImplementationStage(id: string) {
  return IMPLEMENTATION_STAGES.find((s) => s.id === id);
}
