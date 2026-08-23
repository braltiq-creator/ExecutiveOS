import { PortalShell } from "@/components/organisation-portal/PortalShell";
import {
  PortalSection,
  PortalStat,
} from "@/components/organisation-portal/PortalSection";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { loadOrganisationPortal } from "@/lib/organisation-portal/load";

export default async function OrganisationSecurityPage() {
  const { snapshot } = await loadOrganisationPortal();
  const security = snapshot.security;

  return (
    <PortalShell
      title="Security"
      description="MFA, sessions, trusted devices, audit history, and API keys — security you control."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <PortalStat
          label="Security health"
          value={security.health.grade.replace("_", " ")}
          hint={`Score ${security.health.score}`}
        />
        <PortalStat
          label="MFA"
          value={security.mfa.enabled ? "Enabled" : "Off"}
          hint={
            security.mfa.enforcedForAdmins
              ? "Enforced for admins"
              : "Optional for admins"
          }
        />
        <PortalStat
          label="Trusted devices"
          value={security.trustedDevices.length}
        />
      </div>

      <PortalSection title="Sessions">
        <ul className="space-y-3">
          {security.sessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--eos-border)] pt-3 first:border-0 first:pt-0"
            >
              <div>
                <p className="ex-heading text-sm">{session.deviceLabel}</p>
                <p className="ex-caption">
                  {session.ipRegion}
                  {session.current ? " · This device" : ""}
                </p>
              </div>
              <ExperienceBadge tone={session.trusted ? "accent" : "attention"}>
                {session.trusted ? "Trusted" : "Review"}
              </ExperienceBadge>
            </li>
          ))}
        </ul>
      </PortalSection>

      <PortalSection title="API keys">
        {security.apiKeys.length === 0 ? (
          <p className="ex-body">No API keys yet.</p>
        ) : (
          <ul className="space-y-2">
            {security.apiKeys.map((key) => (
              <li
                key={key.id}
                className="flex justify-between border-t border-[var(--eos-border)] pt-2 text-sm first:border-0 first:pt-0"
              >
                <span className="ex-body">
                  {key.label} · {key.keyId}
                </span>
                <span className="ex-caption">
                  {key.secretPreview} · {key.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </PortalSection>

      <PortalSection title="Audit history">
        {security.auditHistory.length === 0 ? (
          <p className="ex-body">No audit events yet.</p>
        ) : (
          <ul className="space-y-2">
            {security.auditHistory.map((event) => (
              <li key={event.id} className="ex-body border-t border-[var(--eos-border)] pt-2 first:border-0 first:pt-0">
                <span className="ex-caption">{event.at.slice(0, 16)}</span>
                <br />
                {event.summary}
              </li>
            ))}
          </ul>
        )}
      </PortalSection>

      <PortalSection title="Findings">
        <ul className="space-y-1">
          {security.health.findings.map((finding) => (
            <li key={finding} className="ex-body">
              · {finding}
            </li>
          ))}
        </ul>
      </PortalSection>
    </PortalShell>
  );
}
