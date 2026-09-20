import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { requireAppSession } from "@/services/session";
import { listOrganizationDataSourcesAction } from "@/verified-evidence/data-sources/actions";
import { DataSourcesPanel } from "@/features/data-sources/DataSourcesPanel";
import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { ExperienceBadge } from "@/experience/design-system/Badge";

/**
 * Phase 37C — Data & Sources
 * Recurring weekly upload surface for Design Partners.
 */
export default async function DataSourcesPage() {
  await requireAppAccess({ requireOnboarding: false });
  const session = await requireAppSession();

  const listed = await listOrganizationDataSourcesAction({
    organisationId: session.company.id,
  });

  const sources = listed.ok ? listed.sources : [];

  return (
    <AppFrame title="Data & Sources" density="snapshot">
      <ExperiencePage width="brief" className="pb-16">
        <header className="space-y-3 pt-2">
          <ExperienceBadge tone="accent">Data & Sources</ExperienceBadge>
          <h1 className="ex-display">Data & Sources</h1>
          <p className="ex-body max-w-xl">
            Keep ExecutiveOS current with the latest business data.
          </p>
          {!listed.ok ? (
            <p className="eos-type-supporting text-[var(--eos-color-danger,#b91c1c)]">
              {listed.error}
            </p>
          ) : null}
        </header>

        <div className="mt-10">
          <DataSourcesPanel sources={sources} />
        </div>
      </ExperiencePage>
    </AppFrame>
  );
}
