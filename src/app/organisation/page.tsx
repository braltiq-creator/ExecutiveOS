import { PortalShell } from "@/components/organisation-portal/PortalShell";
import {
  PortalSection,
  PortalStat,
} from "@/components/organisation-portal/PortalSection";
import { loadOrganisationPortal } from "@/lib/organisation-portal/load";

export default async function OrganisationPortalPage() {
  const { snapshot } = await loadOrganisationPortal();
  const org = snapshot.organisation;

  return (
    <PortalShell
      title="Organisation"
      description="Company details, branding, industry, and regional settings — managed by your team, not Braltiq."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <PortalStat label="Health" value={org.health.label} hint={`Score ${org.health.score}`} />
        <PortalStat label="Industry" value={org.industry} />
        <PortalStat label="Timezone" value={org.timezone} />
      </div>

      <PortalSection
        title="Company details"
        description="Legal and display identity for this ExecutiveOS tenant."
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="ex-caption">Display name</dt>
            <dd className="ex-body mt-1">{org.branding.displayName}</dd>
          </div>
          <div>
            <dt className="ex-caption">Legal name</dt>
            <dd className="ex-body mt-1">{org.legalName}</dd>
          </div>
          <div>
            <dt className="ex-caption">Brand colour</dt>
            <dd className="ex-body mt-1">{org.branding.primaryColor}</dd>
          </div>
          <div>
            <dt className="ex-caption">Organisation id</dt>
            <dd className="ex-body mt-1">{org.id}</dd>
          </div>
        </dl>
      </PortalSection>

      <PortalSection title="Business units">
        <ul className="space-y-2">
          {org.businessUnits.map((unit) => (
            <li key={unit.id} className="ex-body capitalize">
              {unit.name}
            </li>
          ))}
        </ul>
      </PortalSection>

      <PortalSection title="Locations & regional settings">
        <div className="grid gap-4 sm:grid-cols-2">
          <ul className="space-y-2">
            {org.locations.map((loc) => (
              <li key={loc.id} className="ex-body">
                {loc.label} · {loc.region}
              </li>
            ))}
          </ul>
          <dl className="space-y-2">
            <div>
              <dt className="ex-caption">Data residency</dt>
              <dd className="ex-body mt-1 uppercase">
                {org.regionalSettings.residency}
              </dd>
            </div>
            <div>
              <dt className="ex-caption">Currency / locale</dt>
              <dd className="ex-body mt-1">
                {org.regionalSettings.currency} · {org.regionalSettings.locale}
              </dd>
            </div>
          </dl>
        </div>
      </PortalSection>

      <PortalSection title="Organisation health">
        <ul className="space-y-1">
          {org.health.notes.map((note) => (
            <li key={note} className="ex-body">
              · {note}
            </li>
          ))}
        </ul>
      </PortalSection>
    </PortalShell>
  );
}
