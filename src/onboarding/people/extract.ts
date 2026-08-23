/**
 * People discovery helpers.
 */

import type { DiscoveryItem } from "@/onboarding/types";

export type DiscoveredPerson = {
  id: string;
  name: string;
  roleHint: string;
  confidence: number;
  evidence: string[];
};

export function extractPeople(discoveries: DiscoveryItem[]): DiscoveredPerson[] {
  return discoveries
    .filter(
      (d) =>
        d.kind === "executive_team_member" || d.kind === "technician",
    )
    .map((d) => {
      const value = d.editableValue ?? d.label;
      const [name, roleHint] = value.split("—").map((s) => s.trim());
      return {
        id: d.relatedEntityIds[0] ?? d.id,
        name: name || d.label,
        roleHint: roleHint || (d.kind === "technician" ? "Technician" : "Leader"),
        confidence: d.confidence,
        evidence: d.evidence,
      };
    });
}
