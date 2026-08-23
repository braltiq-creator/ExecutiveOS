import type {
  ExecutionSystemId,
  ExecutionSystemRef,
} from "@/initiatives/models/types";

const SYSTEM_LABELS: Record<ExecutionSystemId, string> = {
  microsoft_planner: "Microsoft Planner",
  jira: "Jira",
  asana: "Asana",
  monday: "Monday.com",
  clickup: "ClickUp",
  sap_ps: "SAP Project System",
  oracle_primavera: "Oracle Primavera",
  microsoft_project: "Microsoft Project",
  none: "No execution system linked",
};

/**
 * Execution system references — ExecutiveOS never owns tasks/schedules.
 * Initiatives remain valid if Jira/SAP/Primavera are replaced.
 */
export function toExecutionSystemRefs(
  systems: ExecutionSystemId[],
): ExecutionSystemRef[] {
  const unique = [...new Set(systems.filter((s) => s !== "none"))];
  if (unique.length === 0) {
    return [
      {
        system: "none",
        label: SYSTEM_LABELS.none,
        ownsInSystem: "delivery",
      },
    ];
  }
  return unique.map((system) => ({
    system,
    label: SYSTEM_LABELS[system],
    externalRef: undefined,
    ownsInSystem: defaultOwnership(system),
  }));
}

function defaultOwnership(
  system: ExecutionSystemId,
): ExecutionSystemRef["ownsInSystem"] {
  if (system === "jira" || system === "asana" || system === "clickup") {
    return "tasks";
  }
  if (
    system === "microsoft_project" ||
    system === "oracle_primavera" ||
    system === "sap_ps"
  ) {
    return "schedules";
  }
  if (system === "monday" || system === "microsoft_planner") {
    return "resources";
  }
  return "delivery";
}

export function executionBoundaryNote(): {
  executiveOSOwns: string;
  executionSystemsOwn: string;
} {
  return {
    executiveOSOwns:
      "Strategic intent, executive alignment, decision quality, governance, and business outcomes.",
    executionSystemsOwn: "Tasks, schedules, resources, and delivery.",
  };
}

export { SYSTEM_LABELS };
