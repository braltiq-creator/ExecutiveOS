export type PrimaryNavItem = {
  id: string;
  label: string;
  href: string;
  keywords: string[];
  description: string;
};

/** Experience 2.0 — primary navigation (Data & Sources added Phase 37C). */
export const PRIMARY_NAV: PrimaryNavItem[] = [
  {
    id: "today",
    label: "Today",
    href: "/today",
    keywords: ["briefing", "home", "brief", "dashboard", "executive brief"],
    description: "Executive Command Centre",
  },
  {
    id: "strategy",
    label: "Strategy",
    href: "/strategy",
    keywords: ["strategy", "strategic outcomes", "alignment", "intent"],
    description: "Strategic outcomes",
  },
  {
    id: "decisions",
    label: "Decisions",
    href: "/decisions",
    keywords: ["decision", "judgment", "register"],
    description: "Decision register",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    href: "/knowledge",
    keywords: ["graph", "memory", "context", "book"],
    description: "Knowledge and memory",
  },
  {
    id: "reports",
    label: "Reports",
    href: "/reports",
    keywords: ["board", "export", "narrative"],
    description: "Reports and exports",
  },
  {
    id: "data",
    label: "Data & Sources",
    href: "/data",
    keywords: [
      "data",
      "sources",
      "upload",
      "csv",
      "excel",
      "pipeline",
      "freshness",
      "weekly",
    ],
    description: "Business data sources and weekly uploads",
  },
  {
    id: "administration",
    label: "Administration",
    href: "/administration",
    keywords: [
      "admin",
      "settings",
      "organisation",
      "billing",
      "integrations",
      "portal",
      "subscription",
      "security",
    ],
    description: "Organisation Portal",
  },
];

export type UtilityNavItem = {
  id: string;
  label: string;
  href: string;
  keywords: string[];
};

/**
 * Compact account menu — Experience 2.0 keeps utility tools out of daily view.
 * Full UTILITY_NAV remains available via command palette search.
 */
export const ACCOUNT_MENU_NAV: UtilityNavItem[] = [
  {
    id: "value",
    label: "Executive Value",
    href: "/value",
    keywords: ["value", "roi", "evs", "hours saved"],
  },
  {
    id: "subscribe",
    label: "Subscribe",
    href: "/subscribe",
    keywords: ["subscribe", "plans", "trial", "billing"],
  },
  {
    id: "activate",
    label: "Activate",
    href: "/activate",
    keywords: ["activate", "onboarding", "providers"],
  },
  {
    id: "insights",
    label: "Insights",
    href: "/insights",
    keywords: ["advisors", "intelligence", "analysis"],
  },
  {
    id: "actions",
    label: "Actions",
    href: "/actions",
    keywords: ["commitments", "follow-up", "todo"],
  },
  {
    id: "organisation-portal",
    label: "Organisation Portal",
    href: "/organisation",
    keywords: [
      "organisation",
      "portal",
      "subscription",
      "security",
      "executives",
      "billing",
    ],
  },
  {
    id: "administration",
    label: "Administration",
    href: "/administration",
    keywords: ["admin", "settings", "portal"],
  },
];

/** Searchable utility destinations (not primary nav). */
export const UTILITY_NAV: UtilityNavItem[] = [
  ...ACCOUNT_MENU_NAV.filter((item) => item.id !== "administration"),
  {
    id: "intent",
    label: "Strategic Intent",
    href: "/intent",
    keywords: ["intent", "focus", "mandate", "strategy"],
  },
  {
    id: "outcomes",
    label: "Outcome Engine",
    href: "/outcomes",
    keywords: ["outcomes", "portfolio", "health"],
  },
  {
    id: "organisation-portal-utility",
    label: "Organisation Portal",
    href: "/organisation",
    keywords: ["organisation", "portal", "subscription", "security"],
  },
  {
    id: "organization",
    label: "Organisation overview",
    href: "/organization",
    keywords: ["organization", "org"],
  },
  {
    id: "team",
    label: "Team",
    href: "/team",
    keywords: ["people", "seats"],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings/organization",
    keywords: ["settings", "preferences"],
  },
  {
    id: "billing",
    label: "Billing",
    href: "/settings/billing",
    keywords: ["billing", "subscription", "plan"],
  },
  {
    id: "integrations",
    label: "Integrations",
    href: "/settings/integrations",
    keywords: ["integrations", "calendar", "microsoft"],
  },
  {
    id: "adaptive-admin",
    label: "Adaptive Intelligence",
    href: "/admin/adaptive",
    keywords: [
      "adaptive",
      "learning",
      "personalisation",
      "benchmarking",
      "ranking",
      "continuous intelligence",
    ],
  },
  {
    id: "adaptive-settings",
    label: "Adaptive preferences",
    href: "/settings/adaptive",
    keywords: [
      "adaptive profile",
      "reset learning",
      "disable personalisation",
      "learned preferences",
    ],
  },
  {
    id: "commercial-admin",
    label: "Commercial",
    href: "/admin/commercial",
    keywords: [
      "commercial",
      "editions",
      "licensing",
      "pricing",
      "implementation",
      "roi",
      "security pack",
      "renewals",
      "expansion",
      "sales enablement",
    ],
  },
  {
    id: "provisioning-admin",
    label: "Provisioning",
    href: "/admin/provisioning",
    keywords: [
      "provisioning",
      "self-service",
      "trial",
      "tenant",
      "onboarding",
      "start free trial",
      "customer",
    ],
  },

  {
    id: "experiments-admin",
    label: "Experiments",
    href: "/admin/experiments",
    keywords: [
      "experiments",
      "pilot intelligence",
      "hypotheses",
      "cohorts",
      "feature adoption",
      "roadmap",
      "interviews",
      "analytics",
    ],
  },

  {
    id: "trust-admin",
    label: "Trust",
    href: "/admin/trust",
    keywords: [
      "trust",
      "explainability",
      "evidence",
      "confidence",
      "audit",
      "provenance",
      "reasoning",
    ],
  },

  {
    id: "strategy-admin",
    label: "Strategy Admin",
    href: "/admin/strategy",
    keywords: [
      "strategy",
      "strategic outcomes",
      "alignment",
      "initiatives",
      "progress",
    ],
  },

  {
    id: "memory-admin",
    label: "Memory",
    href: "/admin/memory",
    keywords: [
      "memory",
      "organisational memory",
      "lessons",
      "patterns",
      "timeline",
      "playbooks",
    ],
  },
  {
    id: "outcomes-admin",
    label: "Outcomes",
    href: "/admin/outcomes",
    keywords: [
      "outcomes",
      "value",
      "roi",
      "impact",
      "recommendations",
      "pilot success",
    ],
  },
  {
    id: "operations",
    label: "Operations",
    href: "/admin/operations",
    keywords: [
      "operations",
      "observability",
      "platform health",
      "provider health",
      "commercial metrics",
      "incidents",
      "releases",
      "design partner",
      "customer success",
      "engagement",
      "alerts",
      "portfolio",
    ],
  },

  {
    id: "pilots",
    label: "Pilots",
    href: "/admin/pilots",
    keywords: [
      "pilots",
      "design partner",
      "readiness",
      "provisioning",
      "onboarding",
    ],
  },
  {
    id: "validation",
    label: "Validation",
    href: "/admin/validation",
    keywords: ["validation", "maturity", "confidence", "quality"],
  },
  {
    id: "microsoft365-admin",
    label: "Microsoft 365",
    href: "/admin/microsoft365",
    keywords: ["microsoft", "m365", "graph"],
  },
  {
    id: "simpro-admin",
    label: "Simpro",
    href: "/admin/simpro",
    keywords: ["simpro", "operations", "field"],
  },
  {
    id: "salesforce-admin",
    label: "Salesforce",
    href: "/admin/salesforce",
    keywords: ["salesforce", "crm", "commercial", "pipeline"],
  },
];

export function isPrimaryNavActive(pathname: string, href: string): boolean {
  if (href === "/today") {
    return pathname === "/today" || pathname === "/dashboard";
  }
  if (href === "/strategy") {
    return (
      pathname === "/strategy" ||
      pathname.startsWith("/strategy/") ||
      pathname === "/intent"
    );
  }
  if (href === "/administration") {
    return (
      pathname === "/administration" ||
      pathname.startsWith("/administration/") ||
      pathname.startsWith("/organisation") ||
      pathname.startsWith("/settings/") ||
      pathname === "/organization" ||
      pathname === "/team"
    );
  }
  if (href === "/knowledge") {
    return (
      pathname === "/knowledge" ||
      pathname.startsWith("/knowledge/") ||
      pathname === "/graph"
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
