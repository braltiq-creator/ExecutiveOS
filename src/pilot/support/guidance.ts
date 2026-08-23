/**
 * Support helpers for implementation / CS teams.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { diagnosePilot } from "@/pilot/diagnostics";
import { getPlaybook } from "@/pilot/playbooks";
import type { PilotDiagnostic } from "@/pilot/types";

export type SupportGuidance = {
  summary: string;
  topDiagnostics: PilotDiagnostic[];
  playbookEscalation: string[];
  nextActions: string[];
};

export function buildSupportGuidance(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): SupportGuidance {
  const diagnostics = diagnosePilot(input);
  const playbook = getPlaybook(input.profileId);
  const critical = diagnostics.filter((d) => d.severity === "critical");
  return {
    summary:
      critical.length > 0
        ? `${critical.length} critical issue(s) blocking pilot progress.`
        : diagnostics.length > 0
          ? `${diagnostics.length} issue(s) require attention.`
          : "No blocking diagnostics — pilot health is stable.",
    topDiagnostics: diagnostics.slice(0, 5),
    playbookEscalation: playbook.escalation,
    nextActions: diagnostics
      .slice(0, 3)
      .flatMap((d) => d.remediation.slice(0, 1)),
  };
}
