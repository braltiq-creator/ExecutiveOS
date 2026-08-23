/**
 * Brief layout helpers — presentation prioritisation only.
 */

import type {
  BriefSectionId,
  IntelligenceProfile,
} from "@/profiles/framework/types";

export type BriefSectionDescriptor = {
  id: BriefSectionId;
  label: string;
  kind: "core" | "context" | "advisory";
};

const SECTION_META: Record<BriefSectionId, BriefSectionDescriptor> = {
  pulse: { id: "pulse", label: "Business Pulse", kind: "core" },
  compass: { id: "compass", label: "Executive Compass", kind: "core" },
  outcomes: { id: "outcomes", label: "Outcomes", kind: "core" },
  metrics: { id: "metrics", label: "Metrics", kind: "core" },
  decisions: { id: "decisions", label: "Priority Decisions", kind: "core" },
  actions: { id: "actions", label: "Recommended Actions", kind: "core" },
  since_yesterday: {
    id: "since_yesterday",
    label: "Since Yesterday",
    kind: "core",
  },
  executive_context: {
    id: "executive_context",
    label: "Executive Context",
    kind: "context",
  },
  operational_context: {
    id: "operational_context",
    label: "Operational Context",
    kind: "context",
  },
  commercial_context: {
    id: "commercial_context",
    label: "Commercial Context",
    kind: "context",
  },
  council: { id: "council", label: "Executive Council", kind: "advisory" },
  futures: { id: "futures", label: "Possible Futures", kind: "advisory" },
  agenda: { id: "agenda", label: "Executive Agenda", kind: "advisory" },
};

export function resolveBriefLayout(
  profile: IntelligenceProfile,
): BriefSectionDescriptor[] {
  return profile.briefLayout.map((id) => SECTION_META[id]);
}

export function primaryContextLabel(profile: IntelligenceProfile): string {
  const primary = profile.executiveContext.primary[0];
  if (primary === "operational") return "Operational-first briefing";
  if (primary === "commercial") return "Commercial-first briefing";
  return "Executive activity briefing";
}
