import Link from "next/link";
import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { ORGANISATION_PORTAL_NAV } from "@/organisation-portal";

const LEGACY_LINKS = [
  {
    href: "/settings/organization",
    title: "Legacy organisation settings",
    description: "Previous settings form — prefer Organisation Portal.",
  },
  {
    href: "/settings/adaptive",
    title: "Adaptive learning",
    description:
      "Review learned preferences, reset your adaptive profile, or disable personalisation.",
  },
] as const;

export default async function AdministrationPage() {
  await requireAppAccess({ requireOnboarding: false });

  return (
    <AppFrame title="Administration" density="snapshot">
      <ExperiencePage width="brief" className="pb-16">
        <header className="space-y-3 pt-2">
          <ExperienceBadge tone="accent">Organisation Portal</ExperienceBadge>
          <h1 className="ex-display">Manage your organisation</h1>
          <p className="ex-body max-w-xl">
            Subscription, executives, connected systems, and security — a
            customer portal that feels like ExecutiveOS, not an admin console.
            The Command Centre remains your operational front end.
          </p>
        </header>

        <ul className="mt-10 space-y-3">
          {ORGANISATION_PORTAL_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-[var(--ex-radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
              >
                <ExperienceCardShell className="transition-shadow hover:shadow-[var(--eos-shadow-2)]">
                  <h2 className="ex-heading text-base">{item.label}</h2>
                  <p className="ex-body mt-2">{item.description}</p>
                </ExperienceCardShell>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 space-y-3">
          <p className="ex-caption">Also available</p>
          <ul className="space-y-3">
            {LEGACY_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-[var(--ex-radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
                >
                  <ExperienceCardShell className="transition-shadow hover:shadow-[var(--eos-shadow-2)]">
                    <h2 className="ex-heading text-base">{item.title}</h2>
                    <p className="ex-body mt-2">{item.description}</p>
                  </ExperienceCardShell>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </ExperiencePage>
    </AppFrame>
  );
}
