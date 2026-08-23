/**
 * Enterprise Simulation Environment runner — internal Braltiq harness.
 * Reuses Reality Lab + experience derives. No customer routes.
 */

import { runScenario } from "@/simulation/runner";
import { getScenario } from "@/simulation/scenarios";
import {
  getEnterpriseModel,
  listEnterpriseModels,
  resolveOrganisation,
} from "@/simulation/enterprise/models";
import {
  BUSINESS_EVENTS,
  getBusinessEvent,
  listBusinessEvents,
  modeForScenarioId,
} from "@/simulation/enterprise/events";
import { buildExperienceSurface } from "@/simulation/enterprise/experience-bridge";
import { validateOperatingLoop } from "@/simulation/enterprise/operating-loop";
import { validateCouncil } from "@/simulation/enterprise/council-validation";
import { buildEnterpriseScorecard } from "@/simulation/enterprise/scoring";
import {
  generateEnterpriseReport,
  summariseEnterpriseSuite,
} from "@/simulation/enterprise/report";
import type {
  BusinessEventDefinition,
  EnterpriseSimulationResult,
  EnterpriseSuiteResult,
  OperatingMode,
} from "@/simulation/enterprise/types";

function resolveEvent(
  eventOrScenarioId: string,
): BusinessEventDefinition | undefined {
  return (
    getBusinessEvent(eventOrScenarioId) ??
    BUSINESS_EVENTS.find((event) => event.scenarioId === eventOrScenarioId)
  );
}

/**
 * Run one organisation through one business event end-to-end.
 */
export function runEnterpriseSimulation(input: {
  organisationId: string;
  eventId?: string;
  scenarioId?: string;
}): EnterpriseSimulationResult {
  const organisation = resolveOrganisation(input.organisationId);
  if (!organisation) {
    throw new Error(`Unknown organisation: ${input.organisationId}`);
  }

  const event =
    (input.eventId ? getBusinessEvent(input.eventId) : undefined) ??
    (input.scenarioId ? resolveEvent(input.scenarioId) : undefined) ??
    listBusinessEvents("crisis")[0];

  if (!event) {
    throw new Error("No business event available for enterprise simulation.");
  }

  const scenario = getScenario(event.scenarioId);
  if (!scenario) {
    throw new Error(`Unknown scenario: ${event.scenarioId}`);
  }

  const enterprise =
    getEnterpriseModel(organisation.id) ??
    listEnterpriseModels().find(
      (model) => model.organisationId === organisation.id,
    );

  if (!enterprise) {
    throw new Error(`No enterprise model for ${organisation.id}`);
  }

  const lab = runScenario(organisation, scenario);
  const surface = buildExperienceSurface({ organisation, scenario });
  const mode = event.mode;
  const operatingLoop = validateOperatingLoop(surface);
  const council = validateCouncil(surface, mode);
  const scorecard = buildEnterpriseScorecard({
    lab,
    operatingLoop,
    council,
  });
  const report = generateEnterpriseReport({
    organisationId: organisation.id,
    organisationName: organisation.name,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    mode,
    asOf: lab.asOf,
    lab,
    operatingLoop,
    council,
    scorecard,
  });

  return {
    organisationId: organisation.id,
    organisationName: organisation.name,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    mode,
    asOf: lab.asOf,
    enterprise,
    event,
    lab,
    operatingLoop,
    council,
    scorecard,
    report,
  };
}

/**
 * Stress-test across normal / growth / crisis modes.
 * Defaults to flagship Northline × representative events per mode.
 */
export function runEnterpriseSimulationSuite(options?: {
  organisationIds?: string[];
  modes?: OperatingMode[];
  eventIds?: string[];
  /** When true, run every business event for each selected org (heavier). */
  exhaustive?: boolean;
}): EnterpriseSuiteResult {
  const organisationIds =
    options?.organisationIds ?? ["org-northline", "org-clearpath"];
  const modes = options?.modes ?? (["normal", "growth", "crisis"] as OperatingMode[]);

  const events = options?.eventIds
    ? options.eventIds
        .map((id) => getBusinessEvent(id))
        .filter((event): event is BusinessEventDefinition => Boolean(event))
    : options?.exhaustive
      ? BUSINESS_EVENTS.filter((event) => modes.includes(event.mode))
      : modes.flatMap((mode) => {
          const inMode = listBusinessEvents(mode);
          // Representative sample: first two per mode for fast confidence loops.
          return inMode.slice(0, 2);
        });

  const runs: EnterpriseSimulationResult[] = [];
  for (const organisationId of organisationIds) {
    for (const event of events) {
      runs.push(
        runEnterpriseSimulation({
          organisationId,
          eventId: event.id,
        }),
      );
    }
  }

  const summary = summariseEnterpriseSuite(runs);

  return {
    asOf: runs[0]?.asOf ?? new Date().toISOString(),
    runs,
    modes,
    ...summary,
  };
}

export function listSimulationModes(): OperatingMode[] {
  return ["normal", "growth", "crisis"];
}

export { modeForScenarioId };
