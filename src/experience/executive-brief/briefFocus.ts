/**
 * Derive Today's Focus area from snapshot signals — presentation only.
 */

import type { ExecutiveSnapshot } from "@/lib/snapshot/types";

export type BriefFocusArea =
  | "Commercial"
  | "Strategy"
  | "Risk"
  | "People"
  | "Operations"
  | "Growth";

export const BRIEF_FOCUS_AREAS: BriefFocusArea[] = [
  "Commercial",
  "Strategy",
  "Risk",
  "People",
  "Operations",
  "Growth",
];

/** Level-two workspace for each focus — execution lives elsewhere. */
export function focusWorkspaceHref(focus: BriefFocusArea): string {
  switch (focus) {
    case "Commercial":
      return "/strategy";
    case "Strategy":
      return "/strategy";
    case "Risk":
      return "/decisions";
    case "People":
      return "/team";
    case "Operations":
      return "/strategy";
    case "Growth":
      return "/value";
  }
}

export function focusQuestion(focus: BriefFocusArea): string {
  switch (focus) {
    case "Commercial":
      return "Where is commercial capacity under pressure?";
    case "Strategy":
      return "Where is strategic direction most at stake?";
    case "Risk":
      return "What risk requires judgement today?";
    case "People":
      return "Where does leadership attention on people matter most?";
    case "Operations":
      return "What operational constraint shapes today?";
    case "Growth":
      return "Where is growth creating the next decision?";
  }
}

export function deriveTodaysFocus(
  snapshot: ExecutiveSnapshot,
): BriefFocusArea {
  const blob = [
    snapshot.pulse.label,
    snapshot.pulse.why,
    snapshot.executiveState.summary,
    ...snapshot.sinceYesterday.map((u) => u.sentence),
    ...snapshot.recommendedActions.slice(0, 3).map((a) => a.title),
  ]
    .join(" ")
    .toLowerCase();

  if (/revenue|pipeline|deal|commercial|sales|margin|pricing/.test(blob)) {
    return "Commercial";
  }
  if (/risk|at-risk|escalat|compliance|security|exposure/.test(blob)) {
    return "Risk";
  }
  if (/people|talent|capacity|leadership|team|hire/.test(blob)) {
    return "People";
  }
  if (/growth|expansion|market|acquire|scale/.test(blob)) {
    return "Growth";
  }
  if (/operat|delivery|job|field|sla|reliability|simpro/.test(blob)) {
    return "Operations";
  }
  return "Strategy";
}
