import type { StrategicInitiative } from "@/initiatives/models/types";
import type { InitiativeTemplate } from "@/initiatives/planner/catalogue";
import { executionBoundaryNote } from "@/initiatives/integration/execution-systems";

export function buildInitiativeExplanation(input: {
  template: InitiativeTemplate;
  evidence: string[];
  relatedDecisionIds: string[];
}): StrategicInitiative["explanation"] {
  const boundary = executionBoundaryNote();
  return {
    whyItExists: `"${input.template.title}" exists as a strategic priority because current evidence points to ${input.template.strategicTheme.toLowerCase()} as a leadership coordination problem — not a task backlog.`,
    whyNow:
      input.evidence[0] ??
      "Current intelligence and foresight pressure make delay costly.",
    whatSuccessLooksLike: input.template.completionCriteria.join(" "),
    whatExecutiveOSOwns: boundary.executiveOSOwns,
    whatExecutionSystemsOwn: boundary.executionSystemsOwn,
  };
}

export function explainInitiativeForExecutive(
  initiative: StrategicInitiative,
): string {
  return [
    initiative.explanation.whyItExists,
    `Sponsor: ${initiative.executiveSponsor}.`,
    `Success: ${initiative.explanation.whatSuccessLooksLike}`,
    `ExecutiveOS owns strategy and governance; ${initiative.operationalSystems
      .map((s) => s.label)
      .join(", ")} own delivery.`,
  ].join(" ");
}
