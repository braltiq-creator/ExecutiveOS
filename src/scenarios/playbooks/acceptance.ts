/**
 * Scenario playbooks for Design Partner acceptance runs.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { getScenarioPackForProfile } from "@/scenarios/framework";

export type ScenarioPlaybook = {
  id: string;
  profileId: IntelligenceProfileId;
  title: string;
  preparation: string[];
  execution: string[];
  measurement: string[];
  acceptanceGate: string[];
};

export function getScenarioPlaybook(
  profileId: IntelligenceProfileId,
): ScenarioPlaybook {
  const pack = getScenarioPackForProfile(profileId);
  const isOps = profileId === "operations_executive";
  return {
    id: `playbook-${pack.id}`,
    profileId,
    title: `${pack.name} Acceptance Playbook`,
    preparation: [
      `Confirm required providers connected: ${pack.requiredProviders.join(", ")}`,
      "Ensure Executive Discovery and first brief completed",
      "Brief the executive on scenario-based acceptance (questions, not features)",
    ],
    execution: [
      "Open Today with the target Intelligence Profile active",
      `Walk each of the ${pack.scenarios.length} scenarios as executive questions`,
      "Record whether each question was answered with evidence and a recommendation",
      "Capture executive feedback per scenario (useful / not useful)",
    ],
    measurement: [
      "Scenario completion %",
      "Scenario accuracy / pass rate",
      "Average confidence",
      "Recommendation acceptance",
      "Business outcomes recorded",
    ],
    acceptanceGate: [
      "Scenario completion ≥ 80%",
      "Scenario accuracy ≥ 70%",
      "Average confidence ≥ 60%",
      isOps
        ? "Operations leader confirms overnight orientation without inbox triage"
        : "Commercial leader confirms pipeline priorities without CRM browsing",
    ],
  };
}

export function listScenarioPlaybooks(): ScenarioPlaybook[] {
  return [
    getScenarioPlaybook("operations_executive"),
    getScenarioPlaybook("commercial_executive"),
  ];
}
