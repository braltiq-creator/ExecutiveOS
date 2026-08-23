import { PortalShell } from "@/components/organisation-portal/PortalShell";
import {
  PortalSection,
  PortalStat,
} from "@/components/organisation-portal/PortalSection";
import { loadOrganisationPortal } from "@/lib/organisation-portal/load";

export default async function OrganisationUsagePage() {
  const { snapshot } = await loadOrganisationPortal();
  const value = snapshot.usageValue;

  return (
    <PortalShell
      title="Usage & Value"
      description="See the value ExecutiveOS is creating — hours saved, outcomes, adoption, and health."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PortalStat
          label="Executive Value Score"
          value={value.executiveValueScore}
          hint={value.roiLabel}
        />
        <PortalStat label="Hours saved" value={value.hoursSaved} />
        <PortalStat
          label="Recommendations accepted"
          value={value.recommendationsAccepted}
        />
        <PortalStat
          label="Adoption"
          value={value.adoption.label}
          hint={`Score ${value.adoption.score}`}
        />
      </div>

      <PortalSection title="Business outcomes">
        <ul className="space-y-2">
          {value.businessOutcomes.map((outcome) => (
            <li key={outcome} className="ex-body">
              · {outcome}
            </li>
          ))}
        </ul>
      </PortalSection>

      <PortalSection title="Organisation health">
        <p className="ex-heading text-base">{value.health.label}</p>
        <p className="ex-body mt-1">Health score {value.health.score}</p>
      </PortalSection>
    </PortalShell>
  );
}
