import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { ExecutiveAgenda } from "@/agenda/models/types";
import { buildExecutiveAgenda } from "@/agenda/build";

/**
 * Apply Executive Agenda above Futures / Council / Intelligence.
 */
export function applyExecutiveAgenda(input: {
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
}): {
  agenda: ExecutiveAgenda;
  snapshot: IntelligentExecutiveSnapshot;
} {
  const agenda = buildExecutiveAgenda({
    snapshot: input.snapshot,
    twin: input.twin,
  });

  return {
    agenda,
    snapshot: {
      ...input.snapshot,
      agendaBrief: agenda,
    },
  };
}
