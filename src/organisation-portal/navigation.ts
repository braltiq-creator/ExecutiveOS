import type { PortalNavItem } from "@/organisation-portal/types";

/** Customer portal nav — not PRIMARY_NAV (keeps Command Centre clean). */
export const ORGANISATION_PORTAL_NAV: PortalNavItem[] = [
  {
    id: "organisation",
    label: "Organisation",
    href: "/organisation",
    description: "Company details, branding, and regional settings",
  },
  {
    id: "executives",
    label: "Executives",
    href: "/organisation/executives",
    description: "Invite, roles, permissions, and activity",
  },
  {
    id: "connected_systems",
    label: "Connected Systems",
    href: "/organisation/connected-systems",
    description: "Microsoft 365, Simpro, Salesforce, Dynamics",
  },
  {
    id: "executive_intelligence",
    label: "Executive Intelligence",
    href: "/organisation/executive-intelligence",
    description: "Profiles, packs, recommendations, learning",
  },
  {
    id: "subscription",
    label: "Subscription",
    href: "/organisation/subscription",
    description: "Plan, trial, invoices, upgrade",
  },
  {
    id: "security",
    label: "Security",
    href: "/organisation/security",
    description: "MFA, sessions, audit, API keys",
  },
  {
    id: "usage_value",
    label: "Usage & Value",
    href: "/organisation/usage",
    description: "Value score, ROI, adoption, outcomes",
  },
  {
    id: "support",
    label: "Support",
    href: "/organisation/support",
    description: "Knowledge base, training, requests",
  },
];

export function isPortalNavActive(
  href: string,
  pathname: string,
): boolean {
  if (href === "/organisation") {
    return pathname === "/organisation";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
