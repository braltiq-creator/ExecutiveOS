import { PortalShell } from "@/components/organisation-portal/PortalShell";
import {
  PortalSection,
  PortalStat,
} from "@/components/organisation-portal/PortalSection";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { loadOrganisationPortal } from "@/lib/organisation-portal/load";

export default async function ExecutiveIntelligencePortalPage() {
  const { snapshot } = await loadOrganisationPortal();
  const intel = snapshot.executiveIntelligence;

  return (
    <PortalShell
      title="Executive Intelligence"
      description="Your Executive Profile, installed Intelligence Packs, recommendations, and learning status."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <PortalStat label="Current profile" value={intel.currentProfileName} />
        <PortalStat label="Pack health" value={intel.packHealthLabel} />
        <PortalStat label="Learning" value="Active" hint={intel.learningStatus} />
      </div>

      <PortalSection title="Installed Intelligence Packs">
        {intel.installedPacks.length === 0 ? (
          <p className="ex-body">No packs installed yet.</p>
        ) : (
          <ul className="space-y-3">
            {intel.installedPacks.map((pack) => (
              <li
                key={pack.id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--eos-border)] pt-3 first:border-0 first:pt-0"
              >
                <div>
                  <p className="ex-heading text-sm">{pack.name}</p>
                  <p className="ex-caption">{pack.learningStatus}</p>
                </div>
                <ExperienceBadge tone="accent">{pack.health}</ExperienceBadge>
              </li>
            ))}
          </ul>
        )}
      </PortalSection>

      <PortalSection title="Recommendations">
        <ul className="space-y-2">
          {intel.recommendations.map((rec) => (
            <li key={rec} className="ex-body">
              · {rec}
            </li>
          ))}
        </ul>
      </PortalSection>

      <PortalSection title="Available packs & profiles">
        <ul className="space-y-3">
          {intel.availablePacks.map((pack) => (
            <li key={pack.id}>
              <p className="ex-heading text-sm">{pack.name}</p>
              <p className="ex-body mt-1">{pack.summary}</p>
            </li>
          ))}
        </ul>
      </PortalSection>
    </PortalShell>
  );
}
