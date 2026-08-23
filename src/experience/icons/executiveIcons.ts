import {
  Activity,
  BookOpen,
  Brain,
  Building2,
  CalendarDays,
  Compass,
  FileText,
  Gem,
  Handshake,
  HeartPulse,
  Sparkles,
  Server,
  Settings,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { McKpiId } from "@/experience/mission-control/types";

/**
 * Permanent ExecutiveOS icon language (Lucide).
 * Same icon for KPI, module, navigation, page header, and card.
 */
export const EXECUTIVE_ICONS = {
  today: CalendarDays,
  organisation_health: Building2,
  executive_intelligence: Sparkles,
  executive_value: Gem,
  strategic_outcomes: Target,
  priority_decisions: Brain,
  critical_risks: ShieldAlert,
  customer_health: Handshake,
  system_health: Server,
  people_health: Users,
  commercial_health: TrendingUp,
  strategy: Target,
  decisions: Brain,
  knowledge: BookOpen,
  reports: FileText,
  administration: Settings,
  value: Gem,
  team: Users,
  priorities: Compass,
  activity: Activity,
  pulse: HeartPulse,
} as const satisfies Record<string, LucideIcon>;

export type ExecutiveIconId = keyof typeof EXECUTIVE_ICONS;

export function executiveIcon(id: ExecutiveIconId): LucideIcon {
  return EXECUTIVE_ICONS[id];
}

export function kpiIcon(id: McKpiId): LucideIcon {
  return EXECUTIVE_ICONS[id];
}

/** Resolve module icon from pathname for headers / nav consistency. */
export function moduleIconForPath(pathname: string): LucideIcon | null {
  if (pathname === "/today" || pathname === "/dashboard") {
    return EXECUTIVE_ICONS.today;
  }
  if (pathname.startsWith("/strategy") || pathname === "/intent") {
    return EXECUTIVE_ICONS.strategy;
  }
  if (pathname.startsWith("/decisions")) {
    return EXECUTIVE_ICONS.decisions;
  }
  if (pathname.startsWith("/knowledge") || pathname === "/graph") {
    return EXECUTIVE_ICONS.knowledge;
  }
  if (pathname.startsWith("/reports") || pathname === "/value") {
    return pathname === "/value"
      ? EXECUTIVE_ICONS.value
      : EXECUTIVE_ICONS.reports;
  }
  if (
    pathname.startsWith("/administration") ||
    pathname.startsWith("/settings") ||
    pathname === "/organization"
  ) {
    return EXECUTIVE_ICONS.administration;
  }
  if (pathname === "/team") {
    return EXECUTIVE_ICONS.team;
  }
  return null;
}

/**
 * Consistent drill-down language.
 * Priorities / feed use Open →; named opens remain available for module CTAs.
 */
export function openActionLabel(href: string): string {
  if (href.startsWith("/strategy") || href === "/intent") {
    return "Open Strategy →";
  }
  if (href.startsWith("/decisions")) {
    return "Open Decisions →";
  }
  if (href.startsWith("/knowledge") || href === "/graph") {
    return "Open Knowledge →";
  }
  if (href.startsWith("/reports") || href === "/value") {
    return "Open Reports →";
  }
  if (
    href.startsWith("/administration") ||
    href.startsWith("/settings") ||
    href === "/organization"
  ) {
    return "Open Administration →";
  }
  return "Open →";
}
